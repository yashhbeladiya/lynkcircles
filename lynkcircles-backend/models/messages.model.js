import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  content: {
    type: String,
    // Not required: a message may be just an attachment with no text.
    // Validation that *something* (content or fileUrl) is present lives
    // in the controller/socket layer so the rule can stay app-level.
    default: "",
  },
  fileUrl: { 
    type: String, 
    default: null 
  },
  fileType: { 
    type: String, 
    enum: ['image', 'document', 'video', null], 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
  reactions: [{ 
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, 
    reaction: { 
      type: String, 
      enum: ['like', 'love', 'laugh', 'sad'] 
    } 
  }],
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;