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
    required: true 
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
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;