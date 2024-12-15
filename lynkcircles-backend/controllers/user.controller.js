import { validateEmail, uploadToCloudinary } from "../util/util.js";
import User from "../models/user.model.js";

export const getSuggestedConnections = async (req, res) => {
    try {
      // Get the current user's info for location and services offered
      const currentUser = await User.findById(req.user._id).select(
        "location connections headline"
      );
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Ensure we're only suggesting connections for Workers
    //   if (currentUser.role !== "Worker") {
    //     return res.status(400).json({ message: "Only workers can get connection suggestions" });
    //   }
  
      const { location, connections } = currentUser;
      const servicesOffered = currentUser.workerDetails?.servicesOffered || [];
  
      // console.log("Location: ", location, "Services Offered: ", servicesOffered);
  
      // Create an array of user IDs to exclude from suggestions, including self
      const excludedUserIds = [...(connections || []), currentUser._id];
  
      let suggestedConnections;
  
      try {
        // First, try to find connections based on location or services
        suggestedConnections = await User.find({
          _id: { $nin: excludedUserIds },
          role: "Worker", // Suggest other workers
          $or: [
            { 'location.city': location.city }, // Match city
            { 'location.state': location.state }, // Match state
            { 'workerDetails.servicesOffered': { $in: servicesOffered } }, // Match services offered
          ],
        })
          .select(
            "username firstName lastName location headline profilePicture"
          )
          .limit(5);
  
        // If no connections found, fall back to random suggestions
        if (suggestedConnections.length === 0) {
          suggestedConnections = await User.aggregate([
            { 
              $match: { 
                _id: { $nin: excludedUserIds }, 
                role: "Worker" 
              } 
            },
            { $sample: { size: 5 } },
            { $project: {
              username: 1,
              firstName: 1,
              lastName: 1,
              headline: 1,
              location: 1,
              servicesOffered: '$workerDetails.servicesOffered',
              profilePicture: 1
            }}
          ]);
        }
      } catch (error) {
        console.log("Error fetching suggested connections:", error);
        // Fallback to random suggestions if any error occurs
        suggestedConnections = await User.aggregate([
          { 
            $match: { 
              _id: { $nin: excludedUserIds }, 
              role: "Worker" 
            } 
          },
          { $sample: { size: 5 } },
          { $project: {
            username: 1,
            firstName: 1,
            lastName: 1,
            headline: 1,
            location: 1,
            servicesOffered: '$workerDetails.servicesOffered',
            profilePicture: 1
          }}
        ]);
      }
  
      // console.log("Suggested Connections: ", suggestedConnections);
  
      // Send suggestions in response
      res.status(200).json(suggestedConnections);
    } catch (error) {
      console.error("Error fetching suggested connections:", error);
      res.status(500).json({ message: "Error fetching suggested connections" });
    }
  };

export const getPublicProfile = async (req, res) => {
  try {
    // console.log("Params: ", req.params.username);
    const username = req.params.username;
    console.log("Username: ", username);
    const publicProfile = await User.findOne({ username }).select("-password");
    if (!publicProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(publicProfile);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Error fetching public profile" });
  }
};

export const updateProfile = async (req, res) => {
  console.log("Update Profile called");
  try {
    const allowedUpdates = [
      "firstName",
      "lastName",
      "username",
      "headline",
      "location",
      "bio",
      "profilePicture",  // Changed to match frontend
      "bannerImage",        // Changed to match frontend
      "socialLinks",
      "status",
    ];

    const updatedFields = {};
    const { body } = req;

    console.log("Received Body:", body);
    console.log("Allowed Updates:", allowedUpdates);

    // Loop through fields to validate, check uniqueness, or prepare for updating
    for (let key in body) {
      if (!allowedUpdates.includes(key)) {
        console.log(`Skipping unauthorized field: ${key}`);
        continue;
      }

      // Basic validations
      if (["firstName", "lastName", "username"].includes(key)) {
        const value = body[key].trim();
        if (value.length < 2) {
          return res.status(400).json({ 
            message: `${key} must be at least 2 characters long` 
          });
        }
      }

      // Validate Username Uniqueness
      if (key === "username") {
        const existingUser = await User.findOne({ 
          username: body.username 
        });
        
        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
          return res.status(400).json({ 
            message: "Username already exists" 
          });
        }
        updatedFields.username = body.username.trim();
      }

      // Handle Profile Picture Upload
      if (key === "profilePicture" && body.profilePicture) {
        try {
          updatedFields.profilePicture = await uploadToCloudinary(
            body.profilePicture, 
            "profile"
          );
        } catch (uploadError) {
          console.error("Profile Picture Upload Error:", uploadError);
          return res.status(500).json({ 
            message: "Failed to upload profile picture" 
          });
        }
      }

      // Handle Banner Image Upload
      if (key === "bannerImage" && body.bannerImage) {
        try {
          updatedFields.bannerImage = await uploadToCloudinary(
            body.bannerImage, 
            "banner"
          );
        } catch (uploadError) {
          console.error("Banner Image Upload Error:", uploadError);
          return res.status(500).json({ 
            message: "Failed to upload banner image" 
          });
        }
      }

      // For other fields, directly assign
      if (["headline", "location", "bio"].includes(key)) {
        updatedFields[key] = body[key];
      }
    }

    console.log("Fields to Update:", updatedFields);

    // Perform update
    const updatedProfile = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedFields },
      { 
        new: true,        // Return the modified document
        runValidators: true  // Run model validations
      }
    ).select("-password");

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Detailed Profile Update Error:", error);
    res.status(500).json({ 
      message: "Error updating profile", 
      errorDetails: error.message 
    });
  }
};

export const connectUser = async (req, res) => {
  try {
    const { username } = req.params;
    const userToConnect = await User.findOne({ username });
    if (!userToConnect) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already connected
    if (req.user.connections.includes(userToConnect._id)) {
      return res.status(400).json({ message: "User already connected" });
    }

    // Update current user's connections
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { connections: userToConnect._id } },
      { new: true }
    ).select("-password");

    // Update other user's connections
    const updatedConnectedUser = await User.findByIdAndUpdate(
      userToConnect._id,
      { $push: { connections: req.user._id } },
      { new: true }
    ).select("-password");

    res.status(200).json({ updatedUser, updatedConnectedUser });
    console.log("User connected successfully");
  } catch (error) {
    console.error("Error connecting user:", error.message);
    res.status(500).json({ message: "Error connecting user" });
  }
};

export const disconnectUser = async (req, res) => {
  try {
    const { username } = req.params;
    const userToDisconnect = await User.findOne({ username });
    if (!userToDisconnect) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already disconnected
    if (!req.user.connections.includes(userToDisconnect._id)) {
      return res.status(400).json({ message: "User not connected" });
    }

    // Update current user's connections
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { connections: userToDisconnect._id } },
      { new: true }
    ).select("-password");

    // Update other user's connections
    const updatedConnectedUser = await User.findByIdAndUpdate(
      userToDisconnect._id,
      { $pull: { connections: req.user._id } },
      { new: true }
    ).select("-password");

    res.status(200).json({ updatedUser, updatedConnectedUser });
    console.log("User disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting user:", error.message);
    res.status(500).json({ message: "Error disconnecting user" });
  }
};

// followUser
export const followClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Check if user is already following
    if (req.user.followingClients.includes(client._id)) {
      return res.status(400).json({ message: "User already following" });
    }

    // Update current user's following
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { followingClients: client._id } },
      { new: true }
    ).select("-password");

    // Update other user's followers
    const updatedClient = await User.findByIdAndUpdate(
      client._id,
      { $push: { followers: req.user._id } },
      { new: true }
    ).select("-password");

    res.status(200).json({ updatedUser, updatedClient });
    console.log("User followed successfully");
  } catch (error) {
    console.error("Error following user:", error.message);
    res.status(500).json({ message: "Error following user" });
  }
};

// unfollowUser
export const unfollowClient = async (req, res) => {
  try {
    const { clientName } = req.params;
    const client = await User.findOne({ clientName });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Check if user is already unfollowed
    if (!req.user.following.includes(client._id)) {
      return res.status(400).json({ message: "User not following" });
    }

    // Update current user's following
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: client._id } },
      { new: true }
    ).select("-password");

    // Update other user's followers
    const updatedClient = await User.findByIdAndUpdate(
      client._id,
      { $pull: { followers: req.user._id } },
      { new: true }
    ).select("-password");

    res.status(200).json({ updatedUser, updatedClient });
    console.log("User unfollowed successfully");
  } catch (error) {
    console.error("Error unfollowing user:", error.message);
    res.status(500).json({ message: "Error unfollowing user" });
  }
};

// getUserConnections
export const getUserConnections = async (req, res) => {
  try {
    const connections = await User.find({
      _id: { $in: req.user.connections },
    }).select(
      "username firstName lastName location headline connections profilePicture"
    );
    res.status(200).json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error.message);
    res.status(500).json({ message: "Error fetching connections" });
  }
};

// getUserFollowers
export const getUserFollowers = async (req, res) => {
  try {
    const followers = await User.find({
      _id: { $in: req.user.followers },
    }).select(
      "username firstName lastName location servicesOffered profilePicture"
    );
    res.status(200).json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error.message);
    res.status(500).json({ message: "Error fetching followers" });
  }
};

// getUserFollowing
export const getUserFollowing = async (req, res) => {
  try {
    const following = await User.find({
      _id: { $in: req.user.following },
    }).select(
      "username firstName lastName location servicesOffered profilePicture"
    );
    res.status(200).json(following);
  } catch (error) {
    console.error("Error fetching following:", error.message);
    res.status(500).json({ message: "Error fetching following" });
  }
};

// deleteAccount
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie("token");
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res.status(500).json({ message: "Error deleting account" });
  }
};

// saveUser
export const saveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userToSave = await User.findById(userId);
    console.log("User to Save:", userToSave);
    if (!userToSave) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already saved
    if (req.user.savedWorkers.includes(userToSave._id)) {
      return res.status(400).json({ message: "User already saved" });
    }

    // Update current user's saved users
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { savedWorkers: userToSave._id } },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
    console.log("User saved successfully");
  } catch (error) {
    console.error("Error saving user:", error.message);
    res.status(500).json({ message: "Error saving user" });
  }
};
