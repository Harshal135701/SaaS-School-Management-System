
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const {
  PasswordResetOTP,
  SystemAdmin,
  FranchiseAdmin,
  Teacher,
  Parent,
} = require("../models");

const OTP_EXPIRY_MINUTES = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const createOTP = async (email, userType) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Invalidate previous unused OTPs for this email + user type
  await PasswordResetOTP.update(
    { isUsed: true },
    {
      where: {
        email: normalizedEmail,
        userType,
        isUsed: false,
      },
    }
  );

  const otp = generateOTP();

  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await PasswordResetOTP.create({
    email: normalizedEmail,
    userType,
    otpHash,
    expiresAt,
    attempts: 0,
    isUsed: false,
  });

  return otp;
};

const verifyOTP = async (email, otp, userType) => {
  const normalizedEmail = email.trim().toLowerCase();

  const record = await PasswordResetOTP.findOne({
    where: {
      email: normalizedEmail,
      userType,
      isUsed: false,
    },
    order: [["createdAt", "DESC"]],
  });

  if (!record) {
    return {
      success: false,
      message: "Invalid or expired OTP.",
    };
  }

  if (new Date() > record.expiresAt) {
    record.isUsed = true;
    await record.save();

    return {
      success: false,
      message: "OTP has expired.",
    };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    record.isUsed = true;
    await record.save();

    return {
      success: false,
      message: "Too many incorrect attempts.",
    };
  }

  const isValid = await bcrypt.compare(
    otp,
    record.otpHash
  );

  if (!isValid) {
    record.attempts += 1;

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      record.isUsed = true;
    }

    await record.save();

    return {
      success: false,
      message: "Invalid OTP.",
    };
  }

  // Generate secure one-time reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenHash = hashResetToken(resetToken);

  const resetTokenExpiresAt = new Date(
    Date.now() +
      RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
  );

  record.resetTokenHash = resetTokenHash;
  record.resetTokenExpiresAt = resetTokenExpiresAt;
  record.isUsed = true;

  await record.save();

  return {
    success: true,
    resetToken,
  };
};

const resetPassword = async (
  email,
  userType,
  resetToken,
  newPassword
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const resetTokenHash = hashResetToken(resetToken);

  const record = await PasswordResetOTP.findOne({
    where: {
      email: normalizedEmail,
      userType,
      resetTokenHash,
    },
    order: [["createdAt", "DESC"]],
  });

  if (!record) {
    return {
      success: false,
      message: "Invalid or expired reset token.",
    };
  }

  if (
    !record.resetTokenExpiresAt ||
    new Date() > record.resetTokenExpiresAt
  ) {
    return {
      success: false,
      message: "Reset token has expired.",
    };
  }

  let UserModel;

  switch (userType) {
    case "SYSTEM_ADMIN":
      UserModel = SystemAdmin;
      break;

    case "FRANCHISE_ADMIN":
      UserModel = FranchiseAdmin;
      break;

    case "TEACHER":
      UserModel = Teacher;
      break;

    case "PARENT":
      UserModel = Parent;
      break;

    default:
      return {
        success: false,
        message: "Invalid user type.",
      };
  }

  const user = await UserModel.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Account not found.",
    };
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  user.password = hashedPassword;

  await user.save();

  // Invalidate reset token immediately after successful reset
  record.resetTokenHash = null;
  record.resetTokenExpiresAt = null;

  await record.save();

  return {
    success: true,
    message: "Password reset successfully.",
  };
};

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  resetPassword,
};

