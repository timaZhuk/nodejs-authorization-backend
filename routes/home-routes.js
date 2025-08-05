const express = require("express");
const authMiddleware = require("../middleware/auth-middleware.js");

const router = express.Router();

router.get("/welcome", authMiddleware, (req, res) => {
  //from authMiddleware can get userInfo object
  const { username, userId, role } = req.userInfo;
  res.json({
    message: "Welcome to the home page",
    user: {
      _id: userId,
      username,
      role,
    },
  });
});

module.exports = router;
