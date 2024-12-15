import Message from "../models/messages.model.js";
import Conversation from "../models/conversation.model.js";
import Attachment from "../models/attachments.model.js";
import { uploadToCloudinary } from "../util/util.js";

export const createMessage = async (req, res) => {
  try {
    const { recipientId, content, attachmentId } = req.body;

    // Create message
    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
      attachment: attachmentId || null,
    });

    await message.save();

    // Update or create conversation
    await Conversation.findOneAndUpdate(
      {
        participants: {
          $all: [req.user._id, recipientId],
        },
      },
      {
        $addToSet: { participants: [req.user._id, recipientId] },
        lastMessage: message._id,
      },
      { upsert: true }
    );

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name",
        },
      });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

export const getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name avatar")
      .populate("attachment")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    // Use a service like AWS S3 or Google Cloud Storage
    const fileUrl = await uploadToCloudinary(req.file);

    const attachment = new Attachment({
      fileUrl,
      fileType: req.file.mimetype.split("/")[0],
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    await attachment.save();

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ message: "Error uploading file" });
  }
};
