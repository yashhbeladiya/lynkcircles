import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["Job Application", "Message", "Review"],
        },
        relatedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        relatedJob: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        },
        content: String,
        read: {
            type: Boolean,
            default: false,
        },
    }, { timestamps: true }
);


// Notifications list query is always per-recipient ordered newest-first
// (controllers/notification.controller.js → getUserNotifications). The
// unread-count derivation hits the same key plus `read: false`, so the
// compound index covers both shapes without a separate single-field index.
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;