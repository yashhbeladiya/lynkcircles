//@ts-nocheck
import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import { sendConnectionAcceptedEmail } from "../emails/emailHandlers.js";
import User from "../models/user.model.js";

export const sendConnectionRequest = async (req, res) => {
  try {
    const sender = req.user;
    const recipientUserId = req.params.userId;
    const recipient = await User.findById(recipientUserId);

    console.log("got the connection request to connect with ", recipient);

    if (sender === recipient) {
      return res
        .status(400)
        .json({ message: "You cannot send a connection request to yourself." });
    }

    if (req.user.connections.includes(recipient)) {
      return res
        .status(400)
        .json({ message: "You are already connected with this user." });
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender,
      recipient,
    });
    if (existingRequest) {
      return res.status(400).json({
        message: "You have already sent a connection request to this user.",
      });
    }

    const request = new ConnectionRequest({
      sender,
      recipient,
    });

    await request.save();
    res.status(201).json({ message: "Connection request sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getConnectionRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      recipient: req.user._id,
      status: "pending"
    }).populate(
      "sender",
      "firstName lastName username profilePicture headline connections"
    );
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "firstName email username connections")
      .populate("recipient", "firstName email username");

    if (!request) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    // Check if the recipient is the logged in user
    if (request.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to accept this connection request.",
      });
    }

    // Check if the request is still pending
    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "This connection request has already been accepted or declined.",
      });
    }
    
    // Add the recipient to the sender's connections list
    console.log("User is ", request.recipient._id);
    console.log("Sender is ", request.sender._id);
    request.sender.connections.push(request.recipient._id);
    await request.sender.save();

    
    // Add the sender to the recipient's connections list
    req.user.connections.push(request.sender._id);
    await req.user.save();


    request.status = "accepted";
    await request.save();

    console.log("request is accepted");

    const notification = new Notification({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: req.user._id,
    });

    res
      .status(200)
      .json({ message: "Connection request accepted successfully." });

    // Send a notification email to the sender
    const senderEmail = request.sender.email;
    const senderName = request.sender.firstName;
    const recipientName = req.user.firstName;
    const profileURL = `${process.env.CLIENT_URL}/profile/${req.user.username}`;

    try {
      await sendConnectionAcceptedEmail(
        senderEmail,
        senderName,
        recipientName,
        profileURL
      );
      await notification.save();
    } catch (error) {
      console.error("Error sending connection accepted email: ", error);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await ConnectionRequest.findById(requestId);

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to reject this connection request.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "This connection request has already been accepted or declined.",
      });
    }

    request.status = "declined";
    await request.save();

    res
      .status(200)
      .json({ message: "Connection request rejected successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const myId = req.user._id;
    const connectionId = req.params.id;

    if (!myId.equals(connectionId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to remove this connection." });
    }

    const connection = await ConnectionRequest.findOne({
      sender: myId,
      recipient: connectionId,
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found." });
    }

    await connection.remove();

    // Remove the connection from the user's connections list
    req.user.connections = req.user.connections.filter(
      (id) => !id.equals(connectionId)
    );
    await req.user.save();

    // Remove the user from the connection's connections list
    const connectionUser = await User.findById(connectionId);
    connectionUser.connections = connectionUser.connections.filter(
      (id) => !id.equals(myId)
    );
    await connectionUser.save();

    res.status(200).json({ message: "Connection removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const connections = await ConnectionRequest.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
      status: "accepted",
    }).populate(
      "sender",
      "firstName lastName username profilePicture headline connections"
    );

    res.status(200).json(connections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// export const getConnectionStatus = async (req, res) => {
//   try {
//     console.log("get connection status for ", req.params.userId);
//     const targetUserId = req.params.userId;
//     const targetUser = await User.findById(targetUserId);
//     console.log("target user is ", targetUser.username);

//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const pendingRequest = await ConnectionRequest.findOne({
//       $or: [
//         { sender: req.user._id, recipient: targetUser._id, status: 'pending' },
//         { sender: targetUser._id, recipient: req.user._id, status: 'pending' }
//       ]
//     });
//     console.log("pending request is ", pendingRequest);

//     if (pendingRequest) {
//       return res.status(200).json({
//         status: pendingRequest.sender.equals(req.user._id) ? "pending" : "received",
//         requestId: pendingRequest._id
//       });
//     }

//     const acceptedConnection = await ConnectionRequest.findOne({
//       sender: req.user._id,
//       recipient: targetUser._id,
//       status: 'accepted'
//     });

//     if (acceptedConnection) {
//       return res.status(200).json({ status: "connected" });
//     }

//     res.status(200).json({ status: "not_connected" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = req.user;
    if (currentUser.connections.includes(targetUserId)) {
      return res.json({ status: "connected" });
    }

    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        console.log("send status as pending");
        return res.json({ status: "pending" });
      } else {
        return res.json({ status: "received", requestId: pendingRequest._id });
      }
    }

    // if no connection or pending req found
    res.json({ status: "not_connected" });
  } catch (error) {
    console.error("Error in getConnectionStatus controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
