const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  getDatabase,
} = require("../config/database");

// ==========================================
// LOGIN USER
// POST /api/auth/login
// ==========================================

const loginUser = async (req, res) => {
  try {
    const {
      username,
      password,
    } = req.body;

    // --------------------------------------
    // Validate fields
    // --------------------------------------

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Username and password are required.",
      });
    }

    const database = getDatabase();

    const usersCollection =
      database.collection("users");

    // --------------------------------------
    // Find user
    // --------------------------------------

    const user = await usersCollection.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password.",
      });
    }

    // --------------------------------------
    // Check account status
    // --------------------------------------

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive. Please contact the administrator.",
      });
    }

    // --------------------------------------
    // Check password
    // --------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password.",
      });
    }

    // --------------------------------------
    // Generate JWT
    // --------------------------------------

    const token = jwt.sign(
      {
        id: user._id.toString(),
        userId: user.userId,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // --------------------------------------
    // Update last login
    // --------------------------------------

    await usersCollection.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // --------------------------------------
    // Return login result
    // --------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful.",

      token,

      mustChangePassword:
        user.mustChangePassword,

      user: {
        id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error. Please try again later.",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// ==========================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // --------------------------------------
    // Check empty fields
    // --------------------------------------

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All password fields are required.",
      });
    }

    // --------------------------------------
    // Check new passwords match
    // --------------------------------------

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match.",
      });
    }

    // --------------------------------------
    // Password strength
    // --------------------------------------

    const passwordRule =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRule.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, including uppercase, lowercase, number and special character.",
      });
    }

    // --------------------------------------
    // Get database
    // --------------------------------------

    const database = getDatabase();

    const usersCollection =
      database.collection("users");

    // req.user comes from authMiddleware
    const user = req.user;

    // --------------------------------------
    // Check current password
    // --------------------------------------

    const currentPasswordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!currentPasswordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    // --------------------------------------
    // Prevent same password
    // --------------------------------------

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your current password.",
      });
    }

    // --------------------------------------
    // Hash new password
    // --------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    // --------------------------------------
    // Update MongoDB
    // --------------------------------------

    await usersCollection.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: hashedPassword,

          mustChangePassword: false,

          passwordChangedAt:
            new Date(),

          updatedAt:
            new Date(),
        },
      }
    );

    console.log(
      `Password changed successfully: ${user.username}`
    );

    // --------------------------------------
    // Return response
    // --------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Password changed successfully.",

      mustChangePassword: false,

      user: {
        id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change password. Please try again.",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  loginUser,
  changePassword,
};