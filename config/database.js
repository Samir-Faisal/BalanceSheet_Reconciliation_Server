const { MongoClient } = require("mongodb");

let client;
let database;

const connectDatabase = async () => {
    try {
        client = new MongoClient(process.env.MONGO_URI);

        await client.connect();

        database = client.db(
            process.env.DB_NAME || "balance_reconciliation"
        );

        await database.command({ ping: 1 });

        console.log("MongoDB connected successfully!");
        console.log(
            `Database: ${process.env.DB_NAME || "balance_reconciliation"}`
        );
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);

        process.exit(1);
    }
};

const getDatabase = () => {
    if (!database) {
        throw new Error("Database has not been connected.");
    }

    return database;
};

const closeDatabase = async () => {
    if (client) {
        await client.close();
        console.log("MongoDB connection closed.");
    }
};

module.exports = {
    connectDatabase,
    getDatabase,
    closeDatabase,
};