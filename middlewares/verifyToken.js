import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const verifyToken = async (req, res, next) => {
    try {
        // Check for Authorization header
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: No token provided"
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
        
        // Check if user still exists
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'fullName', 'username', 'email', 'headline', 'profilePicture']
        });
        
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: User no longer exists"
            });
        }

        // Attach user information to request object
        req.user = {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            headline: user.headline,
            profilePicture: user.profilePicture
        };

        next();
    } catch (error) {
        // Handle token errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: Token expired"
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: Invalid token"
            });
        }

        res.status(500).json({
            status: "error",
            message: "Internal server error during authentication"
        });
    }
};

export default verifyToken;