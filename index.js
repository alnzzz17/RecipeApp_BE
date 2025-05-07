require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Serve Static Files
// app.use(express.static(path.join(__dirname, '../client')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enhanced CORS Configuration
app.use(cors({
    origin: ['http://localhost:5000', process.env.CLIENT_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle Preflight (OPTIONS)
app.options('*', cors());

// Default route - serve public_dashboard.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Import Routers
const userRouter = require("./routes/userRoute.js");
const recipeRouter = require("./routes/recipeRoute.js");
const commentRouter = require("./routes/commentRoute.js");

// Mount Routers
app.use("/api/user", userRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/comments", commentRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        status: "error",
        message: "Internal Server Error" 
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        status: "error",
        message: "Endpoint not found" 
    });
});

// Start Server After Syncing DB Associations
const association = require('./utils/dbAssoc');
const PORT = process.env.PORT || 5000;

association()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5000'}`);
        });
    })
    .catch((err) => {
        console.error("DB Association Error:", err.message);
        process.exit(1);
    });