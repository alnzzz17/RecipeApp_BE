import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Static Files
// app.use(express.static(path.join(__dirname, '../client')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enhanced CORS Configuration
// Updated CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost", // Covers default ports (80, 443)
      "http://localhost:5000", // Common frontend port
      "http://127.0.0.1:5500", // Default Live Server port
      process.env.CLIENT_URL,
    ].filter(Boolean), // Removes any falsy values (like undefined CLIENT_URL)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle Preflight requests more specifically
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

// Default route - serve public_dashboard.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Import Routers
import userRouter from "./routes/userRoute.js";
import recipeRouter from "./routes/recipeRoute.js";
import commentRouter from "./routes/commentRoute.js";

// Mount Routers
app.use("/api/user", userRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/comments", commentRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
  });
});

// Start Server After Syncing DB Associations
import association from "./utils/dbAssoc.js";
const PORT = process.env.PORT || 5000;

association()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Client URL: ${process.env.CLIENT_URL || "http://localhost:5000"}`
      );
    });
  })
  .catch((err) => {
    console.error("DB Association Error:", err.message);
    process.exit(1);
  });
