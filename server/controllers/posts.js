import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res, next) => {
  try {
    const { userId, description } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath: req.file?.filename || "",
      likes: {},
      comments: [],
    });

    await newPost.save();

    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(201).json(posts);
  } catch (err) {
    next(err);
  }
};

/* READ */
export const getFeedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

/* UPDATE */
export const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.get(userId);
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, description } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { 
        description,
        picturePath: req.file?.filename || post.picturePath
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

/* DELETE */
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
};
