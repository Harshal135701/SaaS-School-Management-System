require("dotenv").config();

const { sendOTPEmail } = require("./services/emailService");

(async () => {
  try {
    await sendOTPEmail(
      process.env.EMAIL_USER,
      "123456"
    );

    console.log("✅ Test OTP email sent successfully");
  } catch (error) {
    console.error("❌ Email failed:", error.message);
  }
})();