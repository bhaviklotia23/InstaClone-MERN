const express = require("express");
const {
  createPost,
  allPosts,
  authPosts,
  unLikePosts,
  likePosts,
  commentPosts,
  deletePost,
} = require("./posts.controller");
const { isAuthenticateUser } = require("../../middleware/auth");

const router = express.Router();

router.route("/createpost").post(isAuthenticateUser, createPost);
router.route("/allposts").get(isAuthenticateUser, allPosts);
router.route("/myposts").get(isAuthenticateUser, authPosts);
router.route("/like").put(isAuthenticateUser, likePosts);
router.route("/unlike").put(isAuthenticateUser, unLikePosts);
router.route("/comment").put(isAuthenticateUser, commentPosts);
router.route("/deletepost/:postId").delete(isAuthenticateUser, deletePost);

module.exports = router;
