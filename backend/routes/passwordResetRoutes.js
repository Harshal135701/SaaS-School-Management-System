
const express = require("express");

const router = express.Router();

const {
  forgotPassword,
  verifyOTPController,
  resetPasswordController,
} = require("../controllers/passwordResetController");

// Step 1: Request OTP
router.post(
  "/forgot-password",
  forgotPassword
);

// Step 2: Verify OTP
router.post(
  "/verify-otp",
  verifyOTPController
);

// Step 3: Reset password
router.post(
  "/reset-password",
  resetPasswordController
);

module.exports = router;

