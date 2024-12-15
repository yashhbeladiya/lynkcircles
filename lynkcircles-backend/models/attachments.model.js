import mongoose from 'mongoose';

// Attachment Schema
const attachmentSchema = new mongoose.Schema({
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['image', 'document', 'video', 'audio'],
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    }
  });

const Attachment = mongoose.model('Attachment', attachmentSchema);

export default Attachment;

