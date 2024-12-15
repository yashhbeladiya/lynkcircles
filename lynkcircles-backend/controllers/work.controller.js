import e from "express";
import JobPost from "../models/jobpost.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const createWork = async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      location,
      pay,
      status,
      requiredOn,
      deadline,
      applicants,
    } = req.body;
    const newWork = new JobPost({
      jobTitle: title,
      description,
      budget: pay,
      location,
      status,
      requiredOn,
      deadline,
      skillsRequired: skills,
      applicants,
      author: req.user._id,
    });
    await newWork.save();
    res.status(201).json({ message: "Work Post created successfully" });

    // Send notification to all followers
    const user = await User.find({ followingClients: req.user._id });
    user.forEach(async (follower) => {
      const notification = new Notification({
        recipient: follower._id,
        relatedUser: req.user._id,
        type: "Job Posted by Followed Client",
        message: `${req.user.firstName} ${req.user.lastName} posted a new work: ${title}`,
      });
      await notification.save();
    });
  } catch (error) {
    console.log("Error in createWork: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkPosts = async (req, res) => {
  try {
    console.log("Get work posts");
    const workPosts = await JobPost.find({ status: "Open" }).populate(
      "author",
      "firstName lastName username profilePicture"
    );
    res.status(200).json(workPosts);
  } catch (error) {
    console.log("Error in getWorkPosts: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId).populate(
      "author",
      "firstName lastName username profilePicture headline"
    );
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getWorkPostById: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const applyForWork = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    if (post.applicants.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have already applied for this work" });
    }
    // if closed
    if (post.status !== "Open") {
      return res
        .status(400)
        .json({ message: "Work Post is not open for applications" });
    }

    post.applicants.push(req.user._id);
    await post.save();
    res.status(200).json({ message: "Applied for work successfully" });
  } catch (error) {
    console.log("Error in applyForWork: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateWorkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this work post" });
    }
    const { title, description, skillsRequired, location, pay, status, requiredOn, deadline } =
      req.body;
    post.title = title;
    post.description = description;
    post.skillsRequired = skillsRequired;
    post.location = location;
    post.budget = pay;
    post.status = status;
    post.requiredOn = requiredOn;
    post.deadline = deadline;
    await post.save();
    res.status(200).json({ message: "Work Post updated successfully" });
  } catch (error) {
    console.log("Error in updateWorkPost: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteWorkPost = async (req, res) => {
  try {
    console.log("Delete work post");
    const postId = req.params.id;
    const post = await JobPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this work post" });
    }
    await JobPost.findByIdAndDelete(postId);
    res.status(200).json({ message: "Work Post deleted successfully" });
  } catch (error) {
    console.log("Error in deleteWorkPost: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyWorkPosts = async (req, res) => {
  try {
    const myWorkPosts = await JobPost.find({ author: req.user._id }).populate(
      "author",
      "firstName lastName username profilePicture"
    );
    res.status(200).json(myWorkPosts);
  } catch (error) {
    console.log("Error in getMyWorkPosts: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const myApplications = await JobPost.find({
      applicants: req.user._id,
    }).populate("author", "firstName lastName username profilePicture");
    res.status(200).json(myApplications);
  } catch (error) {
    console.log("Error in getMyApplications: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    if (!post.applicants.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have not applied for this work" });
    }
    post.applicants = post.applicants.filter(
      (applicant) => applicant.toString() !== req.user._id.toString()
    );
    await post.save();
    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (error) {
    console.log("Error in withdrawApplication: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkApplicants = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId).populate(
      "applicants",
      "firstName lastName username profilePicture"
    );
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    res.status(200).json(post.applicants);
  } catch (error) {
    console.log("Error in getWorkApplicants: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
