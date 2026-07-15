import Message from "../models/messages.model.js";
import Conversation from "../models/conversation.model.js";
import Attachment from "../models/attachments.model.js";
import { uploadBufferToCloudinary } from "../util/util.js";

const SENDER_FIELDS = "_id firstName lastName username profilePicture";

const upsertConversation = async (userA, userB, lastMessageId) => {
  const existing = await Conversation.findOneAndUpdate(
    {
      isGroup: { $ne: true },
      participants: { $size: 2, $all: [userA, userB] },
    },
    { $set: { lastMessage: lastMessageId } },
    { new: true }
  );
  if (existing) return existing;

  return Conversation.create({
    participants: [userA, userB],
    isGroup: false,
    lastMessage: lastMessageId,
  });
};

export const createMessage = async (req, res) => {
  try {
    const { recipientId, content, fileUrl, fileType } = req.body;

    if (!recipientId || (!content?.trim() && !fileUrl)) {
      return res
        .status(400)
        .json({ message: "recipientId and content (or fileUrl) are required" });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content: content ?? "",
      fileUrl: fileUrl || null,
      fileType: fileType || null,
    });

    try {
      await upsertConversation(req.user._id, recipientId, message._id);
    } catch (convErr) {
      console.warn("upsertConversation failed (non-fatal):", convErr.message);
    }

    const populated = await message.populate("sender", SENDER_FIELDS);
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error in createMessage:", error.message);
    res.status(500).json({ message: "Error sending message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: recipientId },
        { sender: recipientId, recipient: req.user._id },
      ],
      isDeleted: { $ne: true },
    })
      .populate("sender", SENDER_FIELDS)
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", SENDER_FIELDS)
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: SENDER_FIELDS },
      });

    res.json(conversations);
  } catch (error) {
    console.error("Error in getConversations:", error.message);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.conversationId
    ).populate("participants", SENDER_FIELDS);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const messages = await Message.find({
      $or: conversation.participants.flatMap((a, i) =>
        conversation.participants
          .slice(i + 1)
          .map((b) => ({
            $or: [
              { sender: a._id, recipient: b._id },
              { sender: b._id, recipient: a._id },
            ],
          }))
      ),
      isDeleted: { $ne: true },
    })
      .populate("sender", SENDER_FIELDS)
      .sort({ createdAt: 1 });

    res.json({ conversation, messages });
  } catch (error) {
    console.error("Error in getConversation:", error.message);
    res.status(500).json({ message: "Error fetching conversation" });
  }
};

const FILE_TYPE_MAP = {
  image: "image",
  video: "video",
  audio: "audio",
};

const resolveFileType = (mimetype) => {
  const top = mimetype.split("/")[0];
  return FILE_TYPE_MAP[top] ?? "document";
};

export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = await uploadBufferToCloudinary(req.file, "messages");
    const fileType = resolveFileType(req.file.mimetype);

    const attachment = await Attachment.create({
      fileUrl,
      fileType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    res.status(201).json({
      _id: attachment._id,
      fileUrl,
      fileType,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
    });
  } catch (error) {
    console.error("Error in uploadAttachment:", error.message);
    res.status(500).json({ message: "Error uploading file" });
  }
};
