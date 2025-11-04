const express = require("express");
const router = express.Router();
const { signup, login } = require("../../controllers/authController");
const verifyToken = require("../../middleware/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route example
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully!",
    user_id: req.user.id,
  });
});

module.exports = router;
