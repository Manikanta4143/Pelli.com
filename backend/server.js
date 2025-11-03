// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express(); // ✅ initialize app BEFORE using it

app.use(express.json());
app.use(cors());

// Default route for testing
app.get("/", (req, res) => {
  res.send("Backend server is running successfully!");
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "your_fallback_mongo_connection_string";
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
