const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"GovPrep" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your GovPrep OTP",
      text: `Your GovPrep OTP is ${otp}. This OTP will expire soon. Do not share it with anyone.`,
    });

    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error(
      "Error sending OTP email:",
      error.message
    );

    throw new Error("Failed to send OTP email.");
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    await transporter.sendMail({
      from: `"GovPrep" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your GovPrep Password",

      text: `You requested to reset your GovPrep password.

Click the link below to reset your password:

${resetUrl}

This link will expire in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

Do not share this link with anyone.`,
    });

    console.log(
      `Password reset email sent to ${email}`
    );
  } catch (error) {
    console.error(
      "Error sending password reset email:",
      error.message
    );

    throw new Error(
      "Failed to send password reset email."
    );
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};