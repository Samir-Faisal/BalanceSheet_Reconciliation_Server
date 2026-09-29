require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    connectDatabase,
} = require("./config/database");

const authRoutes =
    require("./routes/authRoutes");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

app.use(express.json());

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "Balance Reconciliation API is running.",
    });
});

// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);

// ==========================================
// 404
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message:
            "API route not found.",
    });
});

// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Server failed to start:"
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
};

startServer();