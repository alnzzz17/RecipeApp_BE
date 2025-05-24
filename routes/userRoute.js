import express from "express";
const router = express.Router();
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../middlewares/fileUpload.js";
import refreshToken from "../controllers/refreshToken.js";
import {
  postUser,
  loginHandler,
  logoutHandler,
  deleteUser,
  editUser,
  getUserById,
  getAllUsers,
} from "../controllers/userController.js";

// REGISTER USER
router.post("/register", postUser);

// USER LOGIN
router.post("/login", loginHandler);

// GET ALL USERS
router.get("/all", getAllUsers);

// USER LOGOUT
router.post("/logout", verifyToken, logoutHandler);

// ENDPOINT TOKEN REFRESH
router.get('/refresh', refreshToken);

// GET USER BY ID
router.get("/:id", getUserById);

// EDIT USER PROFILE (with optional file upload)
router.put("/edit/:id", verifyToken, upload.single("profilePicture"), editUser);

// DELETE USER
router.delete("/delete/:id", verifyToken, deleteUser);

export default router;
