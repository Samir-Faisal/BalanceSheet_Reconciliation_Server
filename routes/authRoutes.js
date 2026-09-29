const express = require("express");

const {
    loginUser,
    changePassword,
} = require("../controllers/authController");

const protect = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

router.post(
    "/login",
    loginUser
);

// ==========================================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// ==========================================

router.put(
    "/change-password",
    protect,
    changePassword
);

module.exports = router;