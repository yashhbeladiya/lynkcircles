import { validateEmail, uploadToCloudinary } from "../util/util.js";
import User from "../models/user.model.js";

import { haversineKm, extractLatLng } from "../lib/geo.js";

export const getSuggestedConnections = async (req, res) => {
    try {
      // Pull the location fields too so we can sort suggestions by
      // distance from the asking user.
      const currentUser = await User.findById(req.user._id).select(
        "location connections headline locationPoint locationCoordinates"
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
            "username firstName lastName location headline profilePicture role verified"
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
  
      // Attach distance (km) from the asking user when we have their
      // coordinates. Sort by distance asc, then by whatever the
      // original query order was. Distance is the headline marketplace
      // signal — a verified plumber 30 km away beats an unverified one
      // 3 km away most of the time, but we let the FE see both fields
      // and decide.
      const meCoord = extractLatLng(currentUser);
      if (meCoord) {
        suggestedConnections = suggestedConnections.map((u) => {
          const them = extractLatLng(u);
          const distanceKm = them ? haversineKm(meCoord, them) : null;
          return { ...(u.toObject ? u.toObject() : u), distanceKm };
        });
        suggestedConnections.sort((a, b) => {
          if (a.distanceKm == null && b.distanceKm == null) return 0;
          if (a.distanceKm == null) return 1;
          if (b.distanceKm == null) return -1;
          return a.distanceKm - b.distanceKm;
        });
      }

      res.status(200).json(suggestedConnections);
    } catch (error) {
      console.error("Error fetching suggested connections:", error);
      res.status(500).json({ message: "Error fetching suggested connections" });
    }
  };

export const getPublicProfile = async (req, res) => {
  try {
    const username = req.params.username;
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

/**
 * Lightweight user lookup by ObjectId. Returns a summary suitable for
 * chat headers, mentions, and any UI surface that has a userId but
 * needs a name + avatar. Validates the id format up front so an
 * arbitrary string doesn't trigger a Mongo CastError 500.
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const user = await User.findById(id).select(
      "_id firstName lastName username profilePicture headline verified"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by id:", error.message);
    res.status(500).json({ message: "Error fetching user" });
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
      "profilePicture",
      "bannerImage",
      "socialLinks",
      "status",
      // Client-supplied { lat, lng } object. Mapped into the GeoJSON
      // locationPoint field below so geo queries work.
      "coordinates",
      // Phone (digit-only) + the publicly-visible flag. Used to
      // render the WhatsApp button on a profile.
      "phone",
      "phonePublic",
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

      if (key === "socialLinks") {
        updatedFields.socialLinks = body.socialLinks;
      }

      // Strip everything except digits — keeps storage canonical so
      // a wa.me/<phone> link doesn't break on parentheses or dashes
      // the user pasted in.
      if (key === "phone") {
        const cleaned = (body.phone ?? "").toString().replace(/\D/g, "");
        updatedFields.phone = cleaned;
      }
      if (key === "phonePublic") {
        updatedFields.phonePublic = !!body.phonePublic;
      }

      // Location coordinates: take { lat, lng } from the client,
      // mirror into both the legacy `locationCoordinates` and the new
      // GeoJSON `locationPoint`. Mirror so old read paths keep working
      // while new geo queries get a proper indexed Point.
      if (key === "coordinates" && body.coordinates) {
        const { lat, lng } = body.coordinates;
        if (typeof lat === "number" && typeof lng === "number") {
          updatedFields.locationCoordinates = { lat, long: lng };
          updatedFields.locationPoint = {
            type: "Point",
            coordinates: [lng, lat],
          };
        }
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
      "username firstName lastName location headline connections profilePicture role verified"
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

/**
 * Toggle a Worker on / off the current user's `savedWorkers` list.
 * Replaces the old "connect → accept → connected" flow as the
 * primary bookmark primitive for Clients: tap to save for later,
 * tap again to unsave. Idempotent end state (always reflects the
 * post-action saved state).
 *
 * Returns `{ saved: boolean }` so the FE can flip the button label
 * without re-fetching the whole user.
 */
export const saveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Can't save yourself" });
    }
    const userToSave = await User.findById(userId);
    if (!userToSave) {
      return res.status(404).json({ message: "User not found" });
    }

    const already = req.user.savedWorkers?.some(
      (id) => id.toString() === userId
    );
    if (already) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { savedWorkers: userToSave._id },
      });
      return res.json({ saved: false });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { savedWorkers: userToSave._id },
    });
    res.json({ saved: true });
  } catch (error) {
    console.error("Error saving user:", error.message);
    res.status(500).json({ message: "Error saving user" });
  }
};

/**
 * Populated list of Workers the current user has saved. Used by the
 * Network page's Saved tab. Skips the legacy `connections[]` field
 * entirely — we're done with that primitive.
 */
export const getSavedWorkers = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select("savedWorkers");
    const ids = me?.savedWorkers ?? [];
    if (ids.length === 0) return res.json([]);

    const workers = await User.find({ _id: { $in: ids } }).select(
      "username firstName lastName location headline profilePicture role verified locationPoint locationCoordinates"
    );

    res.json(workers);
  } catch (error) {
    console.error("Error fetching saved workers:", error.message);
    res.status(500).json({ message: "Error fetching saved workers" });
  }
};
