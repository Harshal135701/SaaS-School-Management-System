const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/systemSettingsController");

const protect = require("../middleware/authMiddleware");

router.get("/profile", protect, getProfile);

router.put("/change-password", protect, changePassword);
router.put("/profile", protect, updateProfile);

module.exports = router;