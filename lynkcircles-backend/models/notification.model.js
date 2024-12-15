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
            enum: [
                "Job Application", // New notification type for job applications received by clients
                "Message", // New notification type for messages received by users
                "Review", // New notification type for reviews received by freelancers
                "Job Posted by Followed Client", // New notification type for jobs posted by clients followed by freelancers
                "like", // New notification type for likes received on posts
                "comment", // New notification type for comments received on posts
                "follow", // New notification type for follows received on users
                "connectionAccepted", // New notification type for connection requests accepted by users
            ],
        },
        relatedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        relatedJob: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        },
        relatedPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        content: String,
        read: {
            type: Boolean,
            default: false,
        },
    }, { timestamps: true }
);


const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;