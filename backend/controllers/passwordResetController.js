const {
  SystemAdmin,
  FranchiseAdmin,
} = require("../models");

const {
  createOTP,
  verifyOTP,
} = require("../services/passwordResetService");

const {
  sendOTPEmail,
} = require("../services/emailService");

const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const result = await verifyOTP(email, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetToken: result.resetToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

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

    // Check System Admin
    let user = await SystemAdmin.findOne({
      where: { email: normalizedEmail },
    });

    let userType = "SYSTEM_ADMIN";

    // If not System Admin, check Franchise Admin
    if (!user) {
      user = await FranchiseAdmin.findOne({
        where: { email: normalizedEmail },
      });

      userType = "FRANCHISE_ADMIN";
    }

    /*
     * Security:
     * Don't reveal whether an email exists.
     */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent.",
      });
    }

    const otp = await createOTP(normalizedEmail);

    await sendOTPEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = {
  forgotPassword,verifyOTPController
};