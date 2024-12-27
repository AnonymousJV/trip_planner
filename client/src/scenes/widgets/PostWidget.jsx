// import {
//   ChatBubbleOutlineOutlined,
//   FavoriteBorderOutlined,
//   FavoriteOutlined,
//   ShareOutlined,
// } from "@mui/icons-material";
// import { Box, Divider, IconButton, Typography, useTheme } from "@mui/material";
// import FlexBetween from "components/FlexBetween";
// import Friend from "components/Friend";
// import WidgetWrapper from "components/WidgetWrapper";
// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { setPost } from "state";

// const PostWidget = ({
//   postId,
//   postUserId,
//   name,
//   description,
//   location,
//   picturePath,
//   userPicturePath,
//   likes,
//   comments,
// }) => {
//   const [isComments, setIsComments] = useState(false);
//   const dispatch = useDispatch();
//   const token = useSelector((state) => state.token);
//   const loggedInUserId = useSelector((state) => state.user._id);
//   const isLiked = Boolean(likes[loggedInUserId]);
//   const likeCount = Object.keys(likes).length;

//   const { palette } = useTheme();
//   const main = palette.neutral.main;
//   const primary = palette.primary.main;

//   const patchLike = async () => {
//     const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId: loggedInUserId }),
//     });
//     const updatedPost = await response.json();
//     dispatch(setPost({ post: updatedPost }));
//   };

//   return (
//     <WidgetWrapper m="2rem 0">
//       <Friend
//         friendId={postUserId}
//         name={name}
//         subtitle={location}
//         userPicturePath={userPicturePath}
//       />
//       <Typography color={main} sx={{ mt: "1rem" }}>
//         {description}
//       </Typography>
//       {picturePath && (
//         <img
//           width="100%"
//           height="auto"
//           alt="post"
//           style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
//           src={`http://localhost:3001/assets/${picturePath}`}
//         />
//       )}
//       <FlexBetween mt="0.25rem">
//         <FlexBetween gap="1rem">
//           <FlexBetween gap="0.3rem">
//             <IconButton onClick={patchLike}>
//               {isLiked ? (
//                 <FavoriteOutlined sx={{ color: primary }} />
//               ) : (
//                 <FavoriteBorderOutlined />
//               )}
//             </IconButton>
//             <Typography>{likeCount}</Typography>
//           </FlexBetween>

//           <FlexBetween gap="0.3rem">
//             <IconButton onClick={() => setIsComments(!isComments)}>
//               <ChatBubbleOutlineOutlined />
//             </IconButton>
//             <Typography>{comments.length}</Typography>
//           </FlexBetween>
//         </FlexBetween>

//         <IconButton>
//           <ShareOutlined />
//         </IconButton>
//       </FlexBetween>
//       {isComments && (
//         <Box mt="0.5rem">
//           {comments.map((comment, i) => (
//             <Box key={`${name}-${i}`}>
//               <Divider />
//               <Typography sx={{ color: main, m: "0.5rem 0", pl: "1rem" }}>
//                 {comment}
//               </Typography>
//             </Box>
//           ))}
//           <Divider />
//         </Box>
//       )}
//     </WidgetWrapper>
//   );
// };

// export default PostWidget;

import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  InputBase,
  Button,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments: initialComments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    const response = await fetch(`http://localhost:3001/posts/${postId}/comment`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId, comment: newComment }),
    });

    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setComments(updatedPost.comments);
    setNewComment("");
  };

  const sharePost = () => {
    const shareData = {
      title: "Post by " + name,
      text: description,
      url: window.location.href + `post/${postId}`,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((error) => console.error("Error sharing", error));
    } else {
      alert("Sharing is not supported in your browser.");
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
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
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
            <IconButton onClick={patchLike}>
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
        </FlexBetween>

        <IconButton onClick={sharePost}>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          <Box display="flex" gap="1rem" alignItems="center" mt="1rem">
            <InputBase
              placeholder="Add a comment..."
              onChange={(e) => setNewComment(e.target.value)}
              value={newComment}
              sx={{
                width: "100%",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 1rem",
              }}
            />
            <Button
              onClick={addComment}
              sx={{
                color: palette.background.alt,
                backgroundColor: palette.primary.main,
                borderRadius: "2rem",
              }}
            >
              Post
            </Button>
          </Box>
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

