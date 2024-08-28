const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");

const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, parentId, userId, username } = req.body;

    try {
      user = await User.findOne({ username: username });
    } catch (err) {
      console.log("Not present");
    }

    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const comment = await Comment.create({
      content,
      parent: parentId,
      post: postId,
      commenter: user._id.toString(),
    });

    post.commentCount += 1;

    await post.save();

    await Comment.populate(comment, { path: "commenter", select: "-password" });

    return res.json(comment);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getPostComments = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId })
      .populate("commenter", "-password")
      .sort("-createdAt");

    let commentParents = {};
    let rootComments = [];

    for (let i = 0; i < comments.length; i++) {
      let comment = comments[i];
      commentParents[comment._id] = comment;
    }

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      if (comment.parent) {
        let commentParent = commentParents[comment.parent];
        commentParent.children = [...commentParent.children, comment];
      } else {
        rootComments = [...rootComments, comment];
      }
    }

    return res.json(rootComments);
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const getUserComments = async (req, res) => {
  try {
    const userId = req.params.id;

    let { sortBy } = req.query;

    if (!sortBy) sortBy = "-createdAt";

    let comments = await Comment.find({ commenter: userId })
      .sort(sortBy)
      .populate("post");

    return res.json(comments);
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

module.exports = {
  createComment,
  getPostComments,
  getUserComments,
};
