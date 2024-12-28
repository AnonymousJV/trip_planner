import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, deletePost as deletePostAction } from "state";
import { makeRequest, uploadFile } from "utils/api";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes = {},
  comments = [],
}) => {
  const [isComments, setIsComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const updatedPost = await makeRequest(`/posts/${postId}/like`, {
        method: "PATCH",
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", loggedInUserId);
      formData.append("description", editedDescription);

      const updatedPost = await uploadFile(`/posts/${postId}`, formData, {
        method: "PATCH",
      });
      
      dispatch(setPost({ post: updatedPost }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await makeRequest(`/posts/${postId}`, {
        method: "DELETE",
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      dispatch(deletePostAction({ postId }));
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!postId || !postUserId) {
    return null;
  }

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`/assets/${picturePath}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/default-post.jpg";
          }}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike} disabled={isLoading}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>

          {postUserId === loggedInUserId && (
            <>
              <IconButton onClick={() => setIsEditing(true)} disabled={isLoading}>
                <EditOutlined />
              </IconButton>
              <IconButton onClick={handleDelete} disabled={isLoading}>
                <DeleteOutlined />
              </IconButton>
            </>
          )}
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditing} 
        onClose={() => setIsEditing(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleEdit} color="primary" disabled={isLoading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {isComments && (
        <Box mt="0.5rem">
          {comments.map((comment, i) => (
            <Box key={`${name}-${i}`}>
              <Divider />
              <Typography sx={{ color: main, m: "0.5rem 0", pl: "1rem" }}>
                {comment}
              </Typography>
            </Box>
          ))}
          <Divider />
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
