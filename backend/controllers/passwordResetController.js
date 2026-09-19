
const {
  SystemAdmin,
  FranchiseAdmin,
  Teacher,
  Parent,
} = require("../models");

const allowedUserTypes = [
  "SYSTEM_ADMIN",
  "FRANCHISE_ADMIN",
  "TEACHER",
  "PARENT",
];

const {
  createOTP,
  verifyOTP,
  resetPassword,
} = require("../services/passwordResetService");

const {
  sendOTPEmail,
} = require("../services/emailService");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = null;
    let userType = null;

    // System Admin
    user = await SystemAdmin.findOne({
      where: { email: normalizedEmail },
    });

    if (user) {
      userType = "SYSTEM_ADMIN";
    }

    // Franchise Admin
    if (!user) {
      user = await FranchiseAdmin.findOne({
        where: { email: normalizedEmail },
      });

      if (user) {
        userType = "FRANCHISE_ADMIN";
      }
    }

    // Teacher
    if (!user) {
      user = await Teacher.findOne({
        where: { email: normalizedEmail },
      });

      if (user) {
        userType = "TEACHER";
      }
    }

    // Parent
    if (!user) {
      user = await Parent.findOne({
        where: { email: normalizedEmail },
      });

      if (user) {
        userType = "PARENT";
      }
    }

    // Prevent email/account enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent.",
      });
    }

    const otp = await createOTP(
      normalizedEmail,
      userType
    );

    await sendOTPEmail(
      normalizedEmail,
      otp
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, an OTP has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

const verifyOTPController = async (req, res) => {
  try {
    const {
      email,
      otp,
      userType,
    } = req.body;


    if (!email || !otp || !userType) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and user type are required.",
      });
    }

    if (!allowedUserTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type.",
      });
    }

    const result = await verifyOTP(
      email,
      otp,
      userType
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully.",
      resetToken: result.resetToken,
    });
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const {
      email,
      userType,
      resetToken,
      newPassword,
    } = req.body;

    if (
      !email ||
      !userType ||
      !resetToken ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, user type, reset token and new password are required.",
      });
    }

    if (!allowedUserTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long.",
      });
    }

    const result = await resetPassword(
      email,
      userType,
      resetToken,
      newPassword
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong. Please try again later.",
    });
  }
};

module.exports = {
  forgotPassword,
  verifyOTPController,
  resetPasswordController,
};



