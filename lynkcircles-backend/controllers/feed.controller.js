import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../util/util.js";

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: [...req.user.connections, req.user._id] },
    })
      .sort({ createdAt: -1 })
      .populate("author", "_id firstName lastName username profilePicture headline")
      .populate({
        path: 'comments.user',
        select: '_id firstName lastName username profilePicture'
      })
      .populate({
        path: 'comments.repliedBy',
        select: '_id firstName lastName username profilePicture'
      });

    res.json({ posts });
  } catch (error) {
    console.log("Error in getFeedPosts: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    let newPost;

    if (image) {
      console.log("Image found");
      const image_url = await uploadToCloudinary(image);
      newPost = new Post({ content, image: image_url, author: req.user._id });
    } else {
      console.log("No image found");
      newPost = new Post({ author: req.user._id, content });
      console.log("New post: ", newPost);
    }

    await newPost.save();

    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.log("Error in createPost: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const postToDelete = await Post.findById(postId);
    // Check if the post exists
    if (!postToDelete) {
      return res.status(404).json({ message: "Post not found" });
    }
    console.log("Post to delete: ", postToDelete);
    console.log("Post author: ", postToDelete.author._id.toString());
    console.log("User: ", userId.toString());
    // Check if the user is the author of the post
    if (postToDelete.author._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Delete the post image from Cloudinary
    if (postToDelete.image) {
      await deleteFromCloudinary(postToDelete.image);
    }

    // Delete the post video from Cloudinary
    if (postToDelete.video) {
      await deleteFromCloudinary(postToDelete.video);
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "firstName lastName username profilePicture headline")
      .populate("comments.user", "firstName lastName username profilePicture")
      .populate(
        "comments.repliedBy",
        "firstName lastName username profilePicture"
      );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.log("Error in getPostById: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    const newComment = {
      content,
      user: req.user._id,
      createdAt: new Date(),
    };

    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    )
      .populate("author", "firstName lastName username profilePicture")
      .populate("comments.user", "firstName lastName username profilePicture");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Send notification to the post author
    if (post.author._id.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: post.author._id,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: postId,
      });

      await newNotification.save(); 

      try {
        const postUrl = `${process.env.CLIENT_URL}/post/${postId}`;
        await sendCommentNotificationEmail(
          post.author.email,
          post.author.firstName,
          req.user.firstName,
          postUrl,
          content
        );
      } catch (error) {
        console.error(
          `Error sending comment notification email: ${error.message}`
        );
      }
    }

    // Return the newly created comment
    const lastComment = post.comments[post.comments.length - 1];
    res.status(201).json(lastComment);
  } catch (error) {
    console.log("Error in createComment: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (post.likes.includes(userId)) {
      // Unlike the post
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like the post
      post.likes.push(userId);

      // Send notification to the post author
      if (post.author.toString() !== userId) {
        const newNotification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });

        await newNotification.save();
      }
    }

    await post.save();

    res.status(200).json({ message: "Post liked/unliked successfully" });
  } catch (error) {
    console.log("Error in likePost: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
