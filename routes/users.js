const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userController");

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.get("/random", userControllers.getRandomUsers);
router.get("/:username", userControllers.getUser);

module.exports = router;
