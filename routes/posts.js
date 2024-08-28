const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.post("/", postController.createPost);
router.get("/", postController.getPosts);

router.get("/:id", postController.getPost);

router.post("/like/:id", postController.likePost);
router.delete("/like/:id", postController.unlikePost);
router.get("/liked/:id", postController.getUserLikedPosts);

module.exports = router;
