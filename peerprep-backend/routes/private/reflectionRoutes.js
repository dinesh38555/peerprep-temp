const express = require("express");
const router = express.Router();
const reflectionController = require("../../controllers/reflectionController");
const verifyToken = require("../../middleware/authMiddleware");

// Add new reflection (requires auth)
router.post("/add", verifyToken, reflectionController.addReflection);

// Get all reflections for logged-in user
router.get("/user/:user_id", verifyToken, reflectionController.getUserReflections);

// Get reflection for a specific problem (for logged-in user)
router.get("/user/:user_id/:problem_id", verifyToken, reflectionController.getProblemReflection);

// Update reflection for a specific problem (for logged-in user)
router.put("/user/:user_id/:problem_id", verifyToken, reflectionController.updateReflection);

// Delete reflection for a specific problem (for logged-in user)
router.delete("/user/:user_id/:problem_id", verifyToken, reflectionController.deleteReflection);

module.exports = router;
