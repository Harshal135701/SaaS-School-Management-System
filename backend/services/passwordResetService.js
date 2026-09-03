const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { PasswordResetOTP } = require("../models");

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const createOTP = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Invalidate any previous OTP
  await PasswordResetOTP.update(
    { isUsed: true },
    {
      where: {
        email: normalizedEmail,
        isUsed: false,
      },
    }
  );

  // Generate 6-digit OTP
  const otp = generateOTP();

  // Hash OTP before storing
  const otpHash = await bcrypt.hash(otp, 10);

  // OTP expires after 5 minutes
  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await PasswordResetOTP.create({
    email: normalizedEmail,
    otpHash,
    expiresAt,
    attempts: 0,
    isUsed: false,
  });

  return otp;
};

const verifyOTP = async (email, otp) => {
  const normalizedEmail = email.trim().toLowerCase();

  const record = await PasswordResetOTP.findOne({
    where: {
      email: normalizedEmail,
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

  const isValid = await bcrypt.compare(otp, record.otpHash);

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

  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetTokenExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  record.resetTokenHash = resetTokenHash;
  record.resetTokenExpiresAt = resetTokenExpiresAt;

  // OTP cannot be used again
  record.isUsed = true;

  await record.save();

  return {
    success: true,
    resetToken,
  };
};

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
};