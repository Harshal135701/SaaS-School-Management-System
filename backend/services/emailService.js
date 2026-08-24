const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"EduSphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP - EduSphere",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Password Reset</h2>

        <p>We received a request to reset your password.</p>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing: 8px;">${otp}</h1>

        <p>This OTP will expire in <strong>5 minutes</strong>.</p>

        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
};