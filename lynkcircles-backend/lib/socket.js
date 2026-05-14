import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/messages.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

const SENDER_FIELDS = "_id firstName lastName username profilePicture";

const parseCookie = (cookieHeader, name) => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
};

const upsertConversation = (a, b, lastMessageId) =>
  Conversation.findOneAndUpdate(
    { participants: { $all: [a, b] }, isGroup: { $ne: true } },
    {
      $setOnInsert: { participants: [a, b], isGroup: false },
      $set: { lastMessage: lastMessageId },
    },
    { upsert: true, new: true }
  );

const initializeSocket = (server) => {
  const allowedOrigin =
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : "http://localhost:3001";

  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
    },
  });

  // Authenticate every socket connection from the same JWT cookie we
  // use for HTTP requests. Trusting `auth.userId` from the client was
  // a spoofable handshake — anyone could connect as anyone.
  io.use(async (socket, next) => {
    try {
      const token = parseCookie(socket.handshake.headers.cookie, "token");
      if (!token) return next(new Error("Authentication: no token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return next(new Error("Authentication: user not found"));

      socket.user = user;
      socket.userIdStr = user._id.toString();
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  // userIdStr -> Set<socketId> (a user may have multiple tabs/devices)
  const onlineUsers = new Map();

  const isOnline = (userIdStr) =>
    onlineUsers.has(userIdStr) && onlineUsers.get(userIdStr).size > 0;

  const emitToUser = (userIdStr, event, payload) => {
    const sockets = onlineUsers.get(userIdStr);
    if (!sockets) return;
    for (const sid of sockets) io.to(sid).emit(event, payload);
  };

  io.on("connection", (socket) => {
    const userId = socket.userIdStr;
    const wasOnline = isOnline(userId);

    const set = onlineUsers.get(userId) ?? new Set();
    set.add(socket.id);
    onlineUsers.set(userId, set);

    if (!wasOnline) io.emit("userOnline", { userId });

    // Send the current online list to the freshly connected client.
    socket.emit("onlineUsers", { userIds: Array.from(onlineUsers.keys()) });

    socket.on("privateMessage", async (data, ack) => {
      try {
        const { recipientId, content, fileUrl, fileType, tempId } = data || {};
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

        await upsertConversation(socket.user._id, recipientId, message._id);

        const populated = await message.populate("sender", SENDER_FIELDS);
        const payload = { message: populated, tempId };

        emitToUser(recipientId, "newMessage", payload);
        emitToUser(userId, "messageSent", payload);

        if (typeof ack === "function") ack({ ok: true, message: populated, tempId });
      } catch (error) {
        console.error("privateMessage error:", error.message);
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
          { _id: messageId, recipient: socket.user._id, status: { $ne: "read" } },
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

    socket.on("disconnect", () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit("userOffline", { userId });
        }
      }
    });
  });

  return io;
};

export default initializeSocket;
