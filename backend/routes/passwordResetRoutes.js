const express = require("express");

const router = express.Router();

const {
  forgotPassword,
  verifyOTPController,
} = require("../controllers/passwordResetController");

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOTPController);

module.exports = router;