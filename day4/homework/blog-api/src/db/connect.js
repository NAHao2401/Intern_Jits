/**
 * MongoDB connection setup
 * Gọi connectDB() một lần duy nhất trong index.js trước khi start server
 */

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err; // bubble up -> index.js xử lý và exit
  }

  // Connection events
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Reconnecting...");
  });

  // Graceful shutdown khi process bị kill
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed (process exit)");
    process.exit(0);
  });
}

module.exports = connectDB;
