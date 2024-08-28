const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.post("/:id", commentController.createComment);
router.get("/post/:id", commentController.getPostComments);
router.get("/user/:id", commentController.getUserComments);

module.exports = router;
