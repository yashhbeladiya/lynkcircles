import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "firstName lastName username profilePicture")
      .populate("relatedPost", "content image");

      // filter out notifications that are not that is user's own
    const filteredNotifications = notifications.filter( notification => {
      return notification.relatedUser._id.toString() !== req.user._id.toString();
    }
    );

    res.status(200).json(filteredNotifications);
  } catch (error) {
    console.error("Error in getUserNotifications: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({
          message: "You are not authorized to mark this notification as read",
        });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error in markNotificationAsRead: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotification: ", error);
    res.status(500).json({ message: error.message });
  }
};
