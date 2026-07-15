import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/messages.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

const SENDER_FIELDS = "_id firstName lastName username profilePicture";
const isDev = process.env.NODE_ENV !== "production";

const log = (...args) => {
  if (isDev) console.log("[socket]", ...args);
};

const parseCookie = (cookieHeader, name) => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Find-then-update-or-create. We CAN'T use a single `findOneAndUpdate`
 * with `upsert: true` here because the filter uses `participants: {$all}`
 * and `$setOnInsert` also references `participants` — MongoDB refuses
 * with "cannot infer query fields to set, path 'participants' is matched
 * twice" and the whole privateMessage handler aborts before emitting
 * the real-time events. That's the exact bug that made "you must reload
 * to see new messages" reproduce: the save succeeded, the emit didn't.
 *
 * Two-step pattern avoids the inference conflict entirely. Race window
 * between the find and create is small and the worst case is one extra
 * Conversation row, not data loss. A unique compound index on
 * participants would close it; deferring that to Phase 4 hardening.
 */
const upsertConversation = async (a, b, lastMessageId) => {
  const existing = await Conversation.findOneAndUpdate(
    {
      isGroup: { $ne: true },
      participants: { $size: 2, $all: [a, b] },
    },
    { $set: { lastMessage: lastMessageId } },
    { new: true }
  );
  if (existing) return existing;

  return Conversation.create({
    participants: [a, b],
    isGroup: false,
    lastMessage: lastMessageId,
  });
};

const initializeSocket = (server) => {
  const allowedOrigin = isDev
    ? "http://localhost:3001"
    : process.env.CLIENT_URL;

  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
    },
  });

  // Authenticate every socket connection from the same JWT cookie we
  // use for HTTP requests.
  io.use(async (socket, next) => {
    try {
      const token = parseCookie(socket.handshake.headers.cookie, "token");
      if (!token) {
        log("auth FAIL: no token in handshake. headers.cookie =",
          socket.handshake.headers.cookie ?? "<none>");
        return next(new Error("Authentication: no token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        log("auth FAIL: user not found for token");
        return next(new Error("Authentication: user not found"));
      }

      socket.user = user;
      socket.userIdStr = user._id.toString();
      next();
    } catch (err) {
      log("auth FAIL:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  // Track which user IDs are currently online (any number of sockets).
  // The room-based delivery below doesn't need this map — it exists only
  // for the userOnline/userOffline broadcasts to other clients.
  const onlineUsers = new Set();

  // Emit to every socket that has joined the per-user room. Rooms are
  // managed by socket.io itself and auto-clean on disconnect, so we
  // avoid the stale-socket-id bugs of a manual Map.
  const emitToUser = (userIdStr, event, payload) => {
    // log(`emit ${event} -> user:${userIdStr}`);
    io.to(`user:${userIdStr}`).emit(event, payload);
  };

  io.on("connection", (socket) => {
    const userId = socket.userIdStr;
    // log("CONNECTED", socket.id, "user:", userId,
    //   `${socket.user.firstName} ${socket.user.lastName}`);

    // Join the per-user room so we can emit to all this user's tabs
    // with one call to io.to(roomName).
    socket.join(`user:${userId}`);

    const wasOnline = onlineUsers.has(userId);
    onlineUsers.add(userId);
    if (!wasOnline) io.emit("userOnline", { userId });

    socket.emit("onlineUsers", { userIds: Array.from(onlineUsers) });

    socket.on("privateMessage", async (data, ack) => {
      try {
        const { recipientId, content, fileUrl, fileType, tempId } = data || {};
        // log("RX privateMessage from", userId, "to", recipientId,
        //   "content:", content?.slice(0, 40), "tempId:", tempId);

        if (!recipientId || (!content?.trim() && !fileUrl)) {
          const err = { error: "recipientId and content (or fileUrl) required" };
          if (typeof ack === "function") ack(err);
          return socket.emit("messageError", { tempId, ...err });
        }

        const message = await Message.create({
          sender: socket.user._id,
          recipient: recipientId,
          content: content ?? "",
          fileUrl: fileUrl || null,
          fileType: fileType || null,
        });

        // Conversation upsert is best-effort: if it fails, the message
        // itself is already persisted and we still want the recipient
        // to see it in real time. The conversation list will catch up
        // on its next refetch.
        try {
          await upsertConversation(socket.user._id, recipientId, message._id);
        } catch (convErr) {
          console.warn("upsertConversation failed (non-fatal):", convErr.message);
        }

        const populated = await message.populate("sender", SENDER_FIELDS);
        const payload = { message: populated, tempId };

        // Recipient's tabs get newMessage; sender's other tabs (and the
        // current one) get messageSent — both via per-user rooms.
        emitToUser(recipientId, "newMessage", payload);
        emitToUser(userId, "messageSent", payload);

        if (typeof ack === "function")
          ack({ ok: true, message: populated, tempId });
      } catch (error) {
        console.error("privateMessage error:", error);
        const errPayload = { tempId: data?.tempId, error: "Failed to send" };
        if (typeof ack === "function") ack(errPayload);
        socket.emit("messageError", errPayload);
      }
    });

    socket.on("markMessageRead", async (data) => {
      try {
        const { messageId, senderId } = data || {};
        if (!messageId || !senderId) return;

        const message = await Message.findOneAndUpdate(
          {
            _id: messageId,
            recipient: socket.user._id,
            status: { $ne: "read" },
          },
          { $set: { status: "read" } },
          { new: true }
        );

        if (!message) return;
        emitToUser(senderId.toString(), "messageRead", {
          messageId: message._id,
        });
      } catch (error) {
        console.error("markMessageRead error:", error.message);
      }
    });

    socket.on("typing", (data) => {
      const { recipientId, isTyping } = data || {};
      if (!recipientId) return;
      emitToUser(recipientId.toString(), "userTyping", {
        userId,
        isTyping: !!isTyping,
      });
    });

    socket.on("disconnect", (reason) => {
      // log("DISCONNECTED", socket.id, "user:", userId, "reason:", reason);

      // socket.io has already removed this socket from the user:<id>
      // room by the time disconnect fires. Check if any sockets remain
      // for this user — the room's adapter knows.
      const room = io.sockets.adapter.rooms.get(`user:${userId}`);
      if (!room || room.size === 0) {
        onlineUsers.delete(userId);
        io.emit("userOffline", { userId });
      }
    });
  });

  return io;
};

export default initializeSocket;
