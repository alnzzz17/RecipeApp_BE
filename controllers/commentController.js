import Comment from '../models/commentModel.js';
import Recipe from '../models/recipeModel.js';
import User from '../models/userModel.js';

// CREATE COMMENT - TESTED
const createComment = async (req, res) => {
    try {
        const { recipeId } = req.params; // ID resep dari params
        const { content } = req.body;    // Content dari req body
        const userId = req.user.id; // Dari middleware verifyToken

        // Cek apakah content ada (recipeId sudah didapat dari params)
        if (!content) {
            return res.status(400).json({
                status: "error",
                message: "content is required"
            });
        }

        // Cek apakah resep ada
        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            return res.status(404).json({
                status: "error",
                message: "Recipe not found"
            });
        }

        // Buat komentar baru
        const newComment = await Comment.create({
            userId,
            recipeId,
            content
        });

        // Fetch komentar dengan detail user
        const commentWithUser = await Comment.findByPk(newComment.id, {
            include: [{
                model: User,
                attributes: ['id', 'username', 'profilePicture']
            }]
        });

        res.status(201).json({
            status: "success",
            message: "Comment created successfully",
            data: commentWithUser
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// UPDATE COMMENT - TESTED
const editComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { content } = req.body;

        // Cek apakah content ada
        if (!content) {
            return res.status(400).json({
                status: "error",
                message: "Content is required"
            });
        }

        // Cari komentar berdasarkan ID
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({
                status: "error",
                message: "Comment not found"
            });
        }

        // Cek apakah userId yang mengupdate adalah pemilik komentar
        if (comment.userId !== userId) {
            return res.status(403).json({
                status: "error",
                message: "You can only update your own comments"
            });
        }

        // Update komentar
        await comment.update({ content });

        // Fetch komentar yang sudah diupdate dengan detail user
        const updatedComment = await Comment.findByPk(id, {
            include: [{
                model: User,
                attributes: ['id', 'username', 'profilePicture']
            }]
        });

        res.status(200).json({
            status: "success",
            message: "Comment updated successfully",
            data: updatedComment
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// DELETE COMMENT - TESTED
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Cari komentar berdasarkan ID
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({
                status: "error",
                message: "Comment not found"
            });
        }

        // Cek apakah userId yang menghapus adalah pemilik komentar (atau admin kalau ada)
        if (comment.userId !== userId) {
            return res.status(403).json({
                status: "error",
                message: "You can only delete your own comments"
            });
        }

        // Hapus komentar
        await comment.destroy();

        res.status(200).json({
            status: "success",
            message: "Comment deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// GET COMMENTS BY RECIPE - TESTED
const getCommentsByRecipe = async (req, res) => {
    try {
        const { recipeId } = req.params; // Ambil recipeId dari parameter URL

        // Cek apakah recipeId ada
        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            return res.status(404).json({
                status: "error",
                message: "Recipe not found"
            });
        }

        // Ambil semua komentar berdasarkan recipeId dan detail user
        const comments = await Comment.findAll({
            where: { recipeId },
            include: [{
                model: User,
                attributes: ['id', 'username', 'profilePicture']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            status: "success",
            results: comments.length,
            data: comments
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// GET COMMENT BY ID - TESTED
const getCommentById = async (req, res) => {
    try {
        const { id } = req.params; // Ambil id komentar dari parameter URL

        // Cek apakah komentar ada
        const comment = await Comment.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'profilePicture']
                },
                {
                    model: Recipe,
                    attributes: ['id', 'title']
                }
            ]
        });

        if (!comment) {
            return res.status(404).json({
                status: "error",
                message: "Comment not found"
            });
        }

        res.status(200).json({
            status: "success",
            data: comment
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

export {
    createComment,
    editComment,
    deleteComment,
    getCommentsByRecipe,
    getCommentById
};