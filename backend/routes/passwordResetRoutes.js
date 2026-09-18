const express = require("express");

const router = express.Router();

const {
  forgotPassword,
  verifyOTPController,
  resetPasswordController,
} = require("../controllers/passwordResetController");

const {
  passwordResetLimiter,
} = require("../middleware/rateLimiter");

router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPassword
);

router.post(
  "/verify-otp",
  passwordResetLimiter,
  verifyOTPController
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPasswordController
);

module.exports = router;