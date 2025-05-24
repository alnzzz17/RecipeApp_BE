import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config(); // hanya load .env saat local dev
}
import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";

// Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Serve Static Files
// app.use(express.static(path.join(__dirname, '../client')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: "https://recipe-app-dot-a-11-450504.uc.r.appspot.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ['Authorization']
  })
);

// Handle Preflight (OPTIONS)
app.options('*', cors());

// Import Routers
import userRouter from "./routes/userRoute.js";
import recipeRouter from "./routes/recipeRoute.js";
import commentRouter from "./routes/commentRoute.js";

// Mount Routers
app.use("/api/user", userRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/comments", commentRouter);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Hello from backend service" });
});


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
        `Client URL: "https://recipe-app-dot-a-11-450504.uc.r.appspot.com" || "http://localhost:5000"`
      );
    });
  })
  .catch((err) => {
    console.error("DB Association Error:", err.message);
    process.exit(1);
  });
