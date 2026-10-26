const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  registerUser,
  verifyOTP,
  setPassword,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Registration
router.post("/register", registerUser);

// OTP verification
router.post("/verify-otp", verifyOTP);

// Create password and account
router.post("/set-password", setPassword);

// Login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password/:token", resetPassword);

// Protected test route
router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Authentication successful.",
    user: req.user,
  });
});

module.exports = router;