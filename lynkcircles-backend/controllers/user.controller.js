import { validateEmail, uploadToCloudinary } from "../util/util.js";
import User from "../models/user.model.js";

import { haversineKm, extractLatLng } from "../lib/geo.js";

export const getSuggestedWorkers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select(
      "location headline locationPoint locationCoordinates"
    );

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { location } = currentUser;
    const servicesOffered = currentUser.workerDetails?.servicesOffered || [];
    const excludedUserIds = [currentUser._id];

    let suggestedWorkers;
    try {
      suggestedWorkers = await User.find({
        _id: { $nin: excludedUserIds },
        role: "Worker",
        $or: [
          { "location.city": location?.city },
          { "location.state": location?.state },
          { "workerDetails.servicesOffered": { $in: servicesOffered } },
        ],
      })
        .select(
          "username firstName lastName location headline profilePicture role verified"
        )
        .limit(5);

      if (suggestedWorkers.length === 0) {
        suggestedWorkers = await User.aggregate([
          { $match: { _id: { $nin: excludedUserIds }, role: "Worker" } },
          { $sample: { size: 5 } },
          {
            $project: {
              username: 1,
              firstName: 1,
              lastName: 1,
              headline: 1,
              location: 1,
              servicesOffered: "$workerDetails.servicesOffered",
              profilePicture: 1,
            },
          },
        ]);
      }
    } catch (error) {
      console.log("Error fetching suggested workers:", error);
      suggestedWorkers = await User.aggregate([
        { $match: { _id: { $nin: excludedUserIds }, role: "Worker" } },
        { $sample: { size: 5 } },
        {
          $project: {
            username: 1,
            firstName: 1,
            lastName: 1,
            headline: 1,
            location: 1,
            servicesOffered: "$workerDetails.servicesOffered",
            profilePicture: 1,
          },
        },
      ]);
    }

    const meCoord = extractLatLng(currentUser);
    if (meCoord) {
      suggestedWorkers = suggestedWorkers.map((u) => {
        const them = extractLatLng(u);
        const distanceKm = them ? haversineKm(meCoord, them) : null;
        return { ...(u.toObject ? u.toObject() : u), distanceKm };
      });
      suggestedWorkers.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    res.status(200).json(suggestedWorkers);
  } catch (error) {
    console.error("Error fetching suggested workers:", error);
    res.status(500).json({ message: "Error fetching suggested workers" });
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
