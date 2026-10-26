const User = require("../models/user");
const OTP = require("../models/OTP");
const RegistrationVerification = require("../models/RegistrationVerification");
const PasswordResetToken = require("../models/PasswordResetToken");
const generateOTP = require("../utils/generateOTP");
const {
  sendOTPEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");
const validatePassword = require("../utils/passwordValidator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==========================================
// REGISTER USER / SEND OTP
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    // 1. Check required fields
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    // 4. Check if email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    // 5. Generate OTP
    const otp = generateOTP();

    // 6. Hash OTP before storing
    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // 7. Delete previous OTP
    await OTP.deleteMany({
      email: normalizedEmail,
      purpose: "registration",
    });

    // 8. Save OTP
    await OTP.create({
      email: normalizedEmail,
      otpHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      purpose: "registration",
    });

    // 9. Send OTP email
    await sendOTPEmail(normalizedEmail, otp);

    // 10. Response
    return res.status(200).json({
      message: "OTP sent successfully. Please check your email.",
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};


// ==========================================
// VERIFY OTP
// ==========================================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Check required fields
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find OTP
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      purpose: "registration",
    });

    // 4. OTP not found
    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // 5. Check expiration
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // 6. Check maximum attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({
        _id: otpRecord._id,
      });

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // 7. Hash entered OTP
    const enteredOtpHash = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    // 8. Compare OTP
    if (enteredOtpHash !== otpRecord.otpHash) {
      otpRecord.attempts += 1;

      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    // 9. OTP verified
    await OTP.deleteOne({ _id: otpRecord._id });

// Generate a temporary verification token
const verificationToken = crypto.randomBytes(32).toString("hex");

// Hash the token before storing it in MongoDB
const tokenHash = crypto
  .createHash("sha256")
  .update(verificationToken)
  .digest("hex");

// Remove any previous verification record for this email
await RegistrationVerification.deleteMany({
  email: normalizedEmail,
});

// Store the hashed token for 10 minutes
await RegistrationVerification.create({
  email: normalizedEmail,
  tokenHash,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000),
});

return res.status(200).json({
  message: "OTP verified successfully.",
  verificationToken,
});

  } catch (error) {
    console.error("OTP verification error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};


// ==========================================
// SET PASSWORD / CREATE USER
// ==========================================

const setPassword = async (req, res) => {
  try {
    const {
        name,
        email,
        password,
        verificationToken,
        qualification,
        preferredJob,
        preparationLevel,
        studyHours,
        } = req.body;

    if (!name || !email || !password || !verificationToken) {
      return res.status(400).json({
        message:
          "Name, email, password and verification token are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate password
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Hash the verification token received from frontend
    const tokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Find the temporary verification record
    const verificationRecord =
      await RegistrationVerification.findOne({
        email: normalizedEmail,
        tokenHash,
      });

    // Token doesn't exist
    if (!verificationRecord) {
      return res.status(400).json({
        message:
          "Email verification is invalid or expired. Please verify your email again.",
      });
    }

    // Check token expiration
    if (verificationRecord.expiresAt < new Date()) {
      await RegistrationVerification.deleteOne({
        _id: verificationRecord._id,
      });

      return res.status(400).json({
        message:
          "Email verification has expired. Please verify your email again.",
      });
    }

    // Check whether user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      await RegistrationVerification.deleteOne({
        _id: verificationRecord._id,
      });

      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,

        qualification: qualification || "",
        preferredJob: preferredJob || "",
        preparationLevel: preparationLevel || "",
        studyHours: studyHours || "",

        isEmailVerified: true,
        role: "candidate",
        });

    // Delete verification token after successful account creation
    await RegistrationVerification.deleteOne({
      _id: verificationRecord._id,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(
      "Set password error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Server error. Please try again later.",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // 4. User not found
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 5. Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 6. Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // 7. Login successful
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the user exists
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address.",
      });
    }

    // Remove any previous reset tokens
    await PasswordResetToken.deleteMany({
      email: normalizedEmail,
    });

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash in MongoDB
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 10 minutes
    await PasswordResetToken.create({
      email: normalizedEmail,
      tokenHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Create password reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await sendPasswordResetEmail(
      normalizedEmail,
      resetUrl
    );

    return res.status(200).json({
      message:
        "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Server error. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Reset token and password are required.",
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(password);

    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    // Hash the reset token
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find reset token
    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
    });

    if (!resetRecord) {
      return res.status(400).json({
        message:
          "Password reset link is invalid or has expired.",
      });
    }

    // Check expiration
    if (resetRecord.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({
        _id: resetRecord._id,
      });

      return res.status(400).json({
        message:
          "Password reset link has expired. Please request a new one.",
      });
    }

    // Find user
    const user = await User.findOne({
      email: resetRecord.email,
    });

    if (!user) {
      await PasswordResetToken.deleteOne({
        _id: resetRecord._id,
      });

      return res.status(404).json({
        message: "User account not found.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // Update password
    user.password = hashedPassword;

    await user.save();

    // Delete used reset token
    await PasswordResetToken.deleteOne({
      _id: resetRecord._id,
    });

    return res.status(200).json({
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Server error. Please try again later.",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  registerUser,
  verifyOTP,
  setPassword,
  loginUser,
  forgotPassword,
  resetPassword,
};