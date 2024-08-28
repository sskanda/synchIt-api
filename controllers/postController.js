const mongoose = require("mongoose");
const Post = require("../models/post");
const User = require("../models/User");
const PostLike = require("../models/PostLike");

const createPost = async (req, res) => {
  try {
    let user;
    const { title, content, userId, username } = req.body;
    if (!(title && content)) {
      throw new Error("All input required");
    }

    try {
      user = await User.findOne({ username: username });
    } catch (err) {
      console.log("Not present");
    }
    const post = await Post.create({
      title,
      content,
      poster: user._id.toString(),
    });

    res.json(post);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getPosts = async (req, res) => {
  try {
    let { search, sortBy, author } = req.query;
    let username;
    if (req.body != null) username = req.body;

    if (!sortBy) sortBy = "-createdAt";
    let posts = await Post.find()
      .populate("poster", "-password")
      .sort(sortBy)
      .lean();

    if (author) {
      posts = posts.filter((post) => post.poster.username == author);
    }

    if (search) {
      posts = posts.filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    let user, userId;
    try {
      user = await User.findOne({ username: username });
    } catch (err) {
      console.log("Not present");
    }

    if (user) userId = user._id.toString();

    if (userId) {
      await setLiked(posts, userId);
    }

    return res.json({ data: posts });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new Error("Post does not exist");
    }

    const post = await Post.findById(postId)
      .populate("poster", "-password")
      .lean();

    if (!post) {
      throw new Error("Post does not exist");
    }

    return res.json(post);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getUserLikedPosts = async (req, res) => {
  try {
    const likerId = req.params.id;
    let { search, sortBy, author } = req.query;
    const { userId } = req.body;

    if (!sortBy) sortBy = "-createdAt";

    let posts = await PostLike.find({ userId: likerId })
      .sort(sortBy)
      .populate({ path: "postId", populate: { path: "poster" } })
      .lean();
    console.log(posts);

    const count = posts.length;

    let responsePosts = [];
    posts.forEach((post) => {
      responsePosts.push(post.postId);
    });

    return res.json({ data: responsePosts, count });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { username } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post does not exist");
    }
    let user, userId;
    try {
      user = await User.findOne({ username: username });
    } catch (err) {
      console.log("Not present");
    }
    if (user) userId = user._id.toString();

    const existingPostLike = await PostLike.findOne({ postId, userId });

    if (existingPostLike) {
      throw new Error("Post is already liked");
    }

    await PostLike.create({
      postId,
      userId,
    });

    post.likeCount = (await PostLike.find({ postId })).length;

    await post.save();

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { username } = req.body;
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post does not exist");
    }

    let user, userId;
    try {
      user = await User.findOne({ username: username });
    } catch (err) {
      console.log("Not present");
    }

    if (user) userId = user._id.toString();

    const existingPostLike = await PostLike.findOne({ postId, userId });

    if (!existingPostLike) {
      throw new Error("Post is already not liked");
    }

    await existingPostLike.deleteOne();

    post.likeCount = (await PostLike.find({ postId })).length;

    await post.save();

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const setLiked = async (posts, userId) => {
  let searchCondition = {};
  if (userId) searchCondition = { userId };

  const userPostLikes = await PostLike.find(searchCondition); //userId needed

  posts.forEach((post) => {
    userPostLikes.forEach((userPostLike) => {
      if (userPostLike.postId.equals(post._id)) {
        post.liked = true;
        return;
      }
    });
  });
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  likePost,
  unlikePost,
  getUserLikedPosts,
};
