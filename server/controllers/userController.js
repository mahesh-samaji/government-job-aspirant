
const mongoose = require("mongoose");
const User = require("../models/user");

const ALLOWED_VALUES = {
  qualification: [
    "10th",
    "12th",
    "Diploma",
    "Graduate",
    "Post Graduate",
  ],
  preferredJob: [
    "SSC",
    "Banking",
    "Railway",
    "UPSC",
    "Defence",
    "State Government",
  ],
  preparationLevel: [
    "Beginner",
    "Intermediate",
    "Advanced",
  ],
  studyHours: [
    "1-2 Hours",
    "3-4 Hours",
    "5-6 Hours",
    "7+ Hours",
  ],
};

const getMyProfile = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.user?.userId)) {
      return res.status(401).json({
        message: "Invalid authentication. Please login again.",
      });
    }

    const user = await User.findById(req.user.userId)
      .select(
        "name email qualification preferredJob preparationLevel studyHours isEmailVerified role createdAt updatedAt"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully.",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.user?.userId)) {
      return res.status(401).json({
        message: "Invalid authentication. Please login again.",
      });
    }

    const {
      name,
      qualification,
      preferredJob,
      preparationLevel,
      studyHours,
    } = req.body || {};

    const allowedFields = [
      "name",
      "qualification",
      "preferredJob",
      "preparationLevel",
      "studyHours",
    ];

    const suppliedFields = Object.keys(req.body || {});

    if (suppliedFields.length === 0) {
      return res.status(400).json({
        message: "Provide at least one profile field to update.",
      });
    }

    const invalidFields = suppliedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `These fields cannot be updated here: ${invalidFields.join(", ")}.`,
      });
    }

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name is required.",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          message: "Name cannot exceed 100 characters.",
        });
      }

      updates.name = name.trim();
    }

    for (const field of [
      "qualification",
      "preferredJob",
      "preparationLevel",
      "studyHours",
    ]) {
      if (req.body[field] !== undefined) {
        const value = req.body[field];

        if (
          typeof value !== "string" ||
          !ALLOWED_VALUES[field].includes(value)
        ) {
          return res.status(400).json({
            message: `Invalid ${field} value.`,
          });
        }

        updates[field] = value;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        projection: {
          password: 0,
        },
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        qualification: user.qualification,
        preferredJob: user.preferredJob,
        preparationLevel: user.preparationLevel,
        studyHours: user.studyHours,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
