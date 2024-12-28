import express from "express";
import { verifyToken } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/posts.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* CREATE */
router.post("/", verifyToken, upload.single("picture"), createPost);

/* UPDATE */
router.patch("/:id", verifyToken, upload.single("picture"), updatePost);
router.patch("/:id/like", verifyToken, likePost);

/* DELETE */
router.delete("/:id", verifyToken, deletePost);

export default router;
