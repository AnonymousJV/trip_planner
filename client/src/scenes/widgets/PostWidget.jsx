import React, { useState, useEffect } from "react";
import {
  ChatBubbleOutlineOutlined,
  ThumbDownOutlined,
  ThumbDownAltOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  ThumbUpOutlined,
  ThumbUpAltOutlined,
} from "@mui/icons-material";
import { 
  Box, 
  IconButton, 
  Typography, 
  useTheme, 
  Button, 
  TextField, 
  Avatar 
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useDispatch, useSelector } from "react-redux";
import { setPost, setPosts } from "state";
import { postApis } from "utils/api";

const CommentItem = ({ comment, postId }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state.user);
  
  // Consistent like/dislike state handling
  const [isLiked, setIsLiked] = useState(() => {
    if (comment.likes instanceof Map) {
      return comment.likes.has(loggedInUser?._id);
    }
    return comment.likes && comment.likes[loggedInUser?._id] === true;
  });

  const [isDisliked, setIsDisliked] = useState(() => {
    if (comment.dislikes instanceof Map) {
      return comment.dislikes.has(loggedInUser?._id);
    }
    return comment.dislikes && comment.dislikes[loggedInUser?._id] === true;
  });

  const [likeCount, setLikeCount] = useState(() => {
    if (comment.likes instanceof Map) {
      return comment.likes.size;
    }
    return Object.keys(comment.likes || {}).length;
  });

  const [dislikeCount, setDislikeCount] = useState(() => {
    if (comment.dislikes instanceof Map) {
      return comment.dislikes.size;
    }
    return Object.keys(comment.dislikes || {}).length;
  });

  const handleCommentLike = async () => {
    try {
      const userId = loggedInUser?._id;
      const updatedPost = await postApis.likeComment(postId, comment.id, userId);
      
      // Find the specific comment in the updated post
      const updatedComment = updatedPost.comments.find(
        c => c.id.toString() === comment.id.toString()
      );

      // Update like/dislike states
      const newLikes = updatedComment.likes instanceof Map 
        ? updatedComment.likes 
        : new Map(Object.entries(updatedComment.likes || {}));
      
      const newDislikes = updatedComment.dislikes instanceof Map 
        ? updatedComment.dislikes 
        : new Map(Object.entries(updatedComment.dislikes || {}));

      // Update local state
      setIsLiked(newLikes.has(userId));
      setIsDisliked(false);
      setLikeCount(newLikes.size);
      setDislikeCount(newDislikes.size);

      // Update parent post
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleCommentDislike = async () => {
    try {
      const userId = loggedInUser?._id;
      const updatedPost = await postApis.dislikeComment(postId, comment.id, userId);
      
      // Find the specific comment in the updated post
      const updatedComment = updatedPost.comments.find(
        c => c.id.toString() === comment.id.toString()
      );

      // Update like/dislike states
      const newLikes = updatedComment.likes instanceof Map 
        ? updatedComment.likes 
        : new Map(Object.entries(updatedComment.likes || {}));
      
      const newDislikes = updatedComment.dislikes instanceof Map 
        ? updatedComment.dislikes 
        : new Map(Object.entries(updatedComment.dislikes || {}));

      // Update local state
      setIsDisliked(newDislikes.has(userId));
      setIsLiked(false);
      setDislikeCount(newDislikes.size);
      setLikeCount(newLikes.size);

      // Update parent post
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);

  const handleUpdateComment = async () => {
    if (!editedComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const updatedPost = await postApis.updateComment(postId, comment.id, editedComment);
      
      dispatch(setPost({ post: updatedPost }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing comment:", error);
      alert(error.message || "Failed to edit comment. Please try again.");
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const updatedPost = await postApis.deleteComment(postId, comment.id);
      
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.message || "Failed to delete comment. Please try again.");
    }
  };

  return (
    <Box display="flex" alignItems="center" mb={1}>
      <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
        {comment.firstName?.[0]}
      </Avatar>
      <Box flex={1}>
        {isEditing ? (
          <TextField
            fullWidth
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            variant="outlined"
            size="small"
            multiline
            maxRows={4}
          />
        ) : (
          <Typography variant="body2">{comment.comment}</Typography>
        )}
        <Box display="flex" alignItems="center" mt={1}>
          <IconButton 
            size="small" 
            color={isLiked ? "primary" : "default"}
            onClick={handleCommentLike}
          >
            {isLiked ? <ThumbUpOutlined /> : <ThumbUpAltOutlined />}
            <Typography ml={0.5} variant="caption">{likeCount}</Typography>
          </IconButton>
          <IconButton 
            size="small" 
            color={isDisliked ? "error" : "default"}
            onClick={handleCommentDislike}
          >
            {isDisliked ? <ThumbDownOutlined /> : <ThumbDownAltOutlined />}
            <Typography ml={0.5} variant="caption">{dislikeCount}</Typography>
          </IconButton>
          {loggedInUser?._id === comment.userId && (
            <>
              {isEditing ? (
                <>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={handleUpdateComment}
                  >
                    Save
                  </Button>
                  <Button 
                    size="small" 
                    color="secondary" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <IconButton 
                    size="small" 
                    onClick={() => setIsEditing(true)}
                  >
                    <EditOutlined />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={handleDeleteComment}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  dislikes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [newComment, setNewComment] = useState("");

  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state.user);
  const { palette } = useTheme();

  const [isLiked, setIsLiked] = useState(
    likes ? Object.keys(likes).includes(loggedInUser?._id) : false
  );
  const [isDisliked, setIsDisliked] = useState(
    dislikes ? Object.keys(dislikes).includes(loggedInUser?._id) : false
  );
  const [likeCount, setLikeCount] = useState(
    likes ? Object.keys(likes).length : 0
  );
  const [dislikeCount, setDislikeCount] = useState(
    dislikes ? Object.keys(dislikes).length : 0
  );

  useEffect(() => {
    if (likes) {
      const userLiked = likes instanceof Map 
        ? likes.has(loggedInUser?._id) 
        : Object.keys(likes).includes(loggedInUser?._id);
      setIsLiked(userLiked);
      setLikeCount(likes instanceof Map ? likes.size : Object.keys(likes).length);
    }

    if (dislikes) {
      const userDisliked = dislikes instanceof Map 
        ? dislikes.has(loggedInUser?._id) 
        : Object.keys(dislikes).includes(loggedInUser?._id);
      setIsDisliked(userDisliked);
      setDislikeCount(dislikes instanceof Map ? dislikes.size : Object.keys(dislikes).length);
    }
  }, [likes, dislikes, loggedInUser?._id]);

  const handleLike = async () => {
    try {
      const userId = loggedInUser?._id;
      const updatedPost = await postApis.likePost(postId);
      
      // Update like/dislike states
      const newLikes = updatedPost.likes instanceof Map 
        ? updatedPost.likes 
        : new Map(Object.entries(updatedPost.likes || {}));
      
      const newDislikes = updatedPost.dislikes instanceof Map 
        ? updatedPost.dislikes 
        : new Map(Object.entries(updatedPost.dislikes || {}));

      // Update local state
      setIsLiked(newLikes.has(userId));
      setIsDisliked(false);
      setLikeCount(newLikes.size);
      setDislikeCount(newDislikes.size);

      // Update parent post
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const userId = loggedInUser?._id;
      const updatedPost = await postApis.dislikePost(postId);
      
      // Update like/dislike states
      const newLikes = updatedPost.likes instanceof Map 
        ? updatedPost.likes 
        : new Map(Object.entries(updatedPost.likes || {}));
      
      const newDislikes = updatedPost.dislikes instanceof Map 
        ? updatedPost.dislikes 
        : new Map(Object.entries(updatedPost.dislikes || {}));

      // Update local state
      setIsDisliked(newDislikes.has(userId));
      setIsLiked(false);
      setDislikeCount(newDislikes.size);
      setLikeCount(newLikes.size);

      // Update parent post
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Error disliking post:", error);
    }
  };

  const handleEdit = async () => {
    if (!editedDescription.trim()) {
      alert("Post description cannot be empty");
      return;
    }

    try {
      const updatedPost = await postApis.editPost(postId, editedDescription);
      dispatch(setPost({ post: updatedPost }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing post:", error);
      alert(error.message || "Failed to edit post. Please try again.");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await postApis.deletePost(postId);
      dispatch(setPosts({ posts: await postApis.getFeedPosts() }));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.message || "Failed to delete post. Please try again.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const updatedPost = await postApis.addComment(postId, newComment);
      dispatch(setPost({ post: updatedPost }));
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(error.message || "Failed to add comment. Please try again.");
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      {isEditing ? (
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          variant="outlined"
          sx={{ mt: 2 }}
        />
      ) : (
        <Typography color={palette.neutral.main} sx={{ mt: "1rem" }}>
          {description}
        </Typography>
      )}
      
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton 
              onClick={handleLike} 
              color={isLiked ? "primary" : "default"}
            >
              {isLiked ? <ThumbUpOutlined /> : <ThumbUpAltOutlined />}
            </IconButton>
            <Typography color={isLiked ? "primary.main" : "text.secondary"}>
              {likeCount}
            </Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton 
              onClick={handleDislike} 
              color={isDisliked ? "error" : "default"}
            >
              {isDisliked ? <ThumbDownOutlined /> : <ThumbDownAltOutlined />}
            </IconButton>
            <Typography color={isDisliked ? "error.main" : "text.secondary"}>
              {dislikeCount}
            </Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments ? comments.length : 0}</Typography>
          </FlexBetween>
        </FlexBetween>

        {loggedInUser?._id === postUserId && (
          <FlexBetween gap="0.3rem">
            {isEditing ? (
              <>
                <Button 
                  size="small" 
                  color="primary" 
                  onClick={handleEdit}
                >
                  Save
                </Button>
                <Button 
                  size="small" 
                  color="secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedDescription(description);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <IconButton onClick={() => setIsEditing(true)}>
                  <EditOutlined />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={handleDeletePost}
                >
                  <DeleteOutlined />
                </IconButton>
              </>
            )}
          </FlexBetween>
        )}
      </FlexBetween>

      {isComments && (
        <Box mt="0.5rem">
          {comments?.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={postId} 
            />
          ))}

          <FlexBetween mt="0.5rem">
            <TextField
              fullWidth
              variant="outlined"
              label="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mr: 1 }}
              multiline
              maxRows={3}
            />
            <IconButton 
              color="primary" 
              onClick={handleAddComment}
            >
              <SendOutlined />
            </IconButton>
          </FlexBetween>
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
