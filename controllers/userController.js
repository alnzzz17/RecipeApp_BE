dotenv.config();
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Sequelize from "sequelize";
import User from "../models/userModel.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import fs from "fs";

// REGISTER NEW USER - TESTED
const postUser = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Cek apakah email dan username sudah ada di database
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email or Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      profilePicture: process.env.DEFAULT_PROFILE_PICTURE_URL,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.ACCESS_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Response
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        headline: newUser.headline,
        profilePicture: newUser.profilePicture,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error occurred",
      message: error.message,
    });
  }
};

// USER LOGIN - TESTED
const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({
      where: { email },
    });

    if (user) {
      // Konversi user ke object untuk menghilangkan data sensitif
      const userPlain = user.toJSON();
      const { password: _, refreshToken: __, ...safeUserData } = userPlain;

      // Cek apakah password sesuai
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Generate tokens
        const accessToken = jwt.sign(
          safeUserData,
          process.env.ACCESS_SECRET_KEY,
          { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
          safeUserData,
          process.env.REFRESH_SECRET_KEY,
          { expiresIn: "1d" }
        );

        // console.log('Refresh Token:', refreshToken);

        // Update refresh token di database
        await User.update({ refreshToken }, { where: { id: user.id } });

        // Set refresh token di cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: false,
          sameSite: "none",
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          status: "success",
          message: "Login successful",
          user: safeUserData,
          accessToken
        });
      } else {
        res.status(400).json({
          status: "Failed",
          message: "Password salah!",
        });
      }
    } else {
      res.status(400).json({
        status: "Failed",
        message: "Email salah",
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
};

// LOGOUT HANDLER
const logoutHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.sendStatus(204);

    const user = await User.findOne({
      where: { refreshToken },
    });

    if (!user) return res.sendStatus(204);

    // Clear refresh token di database
    await User.update(
      {
        refreshToken: null,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(200).json({
      status: "success",
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE USER ACCOUNT - TESTED
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user.id; // Dari verifyToken middleware

    // Memastikan user yang ingin dihapus adalah user yang sedang login
    if (parseInt(id) !== loggedInUserId) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You can only delete your own account",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Hapus gambar profil dari Cloudinary jika ada DAN bukan default
    if (user.profilePicture && !user.profilePicture.endsWith("default.jpg")) {
      const publicId = user.profilePicture.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`Recipe-App/Profile_Pictures/${publicId}`);
    }

    // Hapus user dari database
    await User.destroy({ where: { id } });

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// EDIT USER ACCOUNT - TESTED
const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUserId = req.user.id;

        // Verify user is editing their own account
        if (parseInt(id) !== loggedInUserId) {
            return res.status(403).json({
                status: "error",
                message: "Forbidden: You can only edit your own account",
            });
        }

        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        const { username, email, fullName, headline, password } = req.body;
        const file = req.file;

        let updatedFields = {};
        if (username !== undefined) updatedFields.username = username;
        if (email !== undefined) updatedFields.email = email;
        if (fullName !== undefined) updatedFields.fullName = fullName;
        if (headline !== undefined) updatedFields.headline = headline;
        
        if (password) {
            updatedFields.password = await bcrypt.hash(password, 10);
        }

        // Handle profile picture upload
        if (file) {
            try {
                // Delete old image if exists and not default
                if (userToUpdate.profilePicture && 
                    !userToUpdate.profilePicture.endsWith("default.jpg")) {
                    const publicId = userToUpdate.profilePicture
                        .split("/")
                        .pop()
                        .split(".")[0];
                    await cloudinary.uploader.destroy(
                        `Recipe-App/Profile_Pictures/${publicId}`
                    );
                }

                // Upload new image
                const uploadResult = await cloudinary.uploader.upload(file.path, {
                    folder: "Recipe-App/Profile_Pictures",
                    use_filename: true,
                    unique_filename: false,
                });
                updatedFields.profilePicture = uploadResult.secure_url;

                // Delete temp file
                fs.unlink(file.path, (err) => {
                    if (err) console.error("❌ Failed to delete temp file:", err.message);
                });
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to upload image to Cloudinary",
                });
            }
        }

          // Update user fields
    await userToUpdate.update(updatedFields);

    // Get updated user data without sensitive information
    const updatedUser = await User.findByPk(id, {
      attributes: [
        "id",
        "username",
        "email",
        "fullName",
        "headline",
        "profilePicture",
      ],
    });

    // Generate new refresh token
    const userPlain = updatedUser.toJSON();
    const { password: _, refreshToken: __, ...safeUserData } = userPlain;
    
    const newRefreshToken = jwt.sign(
      safeUserData,
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Update refresh token in database
    await User.update(
      { refreshToken: newRefreshToken },
      { where: { id } }
    );

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
      refreshToken: newRefreshToken,
    });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "username",
        "email",
        "fullName",
        "headline",
        "profilePicture",
        "createdAt",
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    // Ambil semua user dari database
    const users = await User.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "fullName",
        "headline",
        "profilePicture",
        "createdAt",
      ],
      order: [["id", "ASC"]], // Diurutkan berdasarkan ID
    });

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export {
  postUser,
  loginHandler,
  logoutHandler,
  deleteUser,
  editUser,
  getUserById,
  getAllUsers,
};
