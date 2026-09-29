const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const {
    getDatabase,
} = require("../config/database");

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

const protect = async (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required. Please login.",
            });
        }

        // Get token from:
        // Authorization: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Connect to database
        const database = getDatabase();

        const usersCollection =
            database.collection("users");

        // Find logged-in user
        const user = await usersCollection.findOne({
            _id: new ObjectId(decoded.id),
        });

        // User doesn't exist
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found.",
            });
        }

        // Check account status
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is inactive. Please contact the administrator.",
            });
        }

        // Add user information to request
        req.user = user;

        // Continue to controller
        next();
    } catch (error) {
        console.error(
            "Authentication error:",
            error.message
        );

        // JWT expired
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message:
                    "Your login session has expired. Please login again.",
            });
        }

        // Invalid JWT
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication token.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Authentication error. Please try again.",
        });
    }
};

module.exports = protect;