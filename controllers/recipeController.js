import Recipe from '../models/recipeModel.js';
import User from '../models/userModel.js';
import Comment from '../models/commentModel.js';
import cloudinary from '../utils/cloudinaryConfig.js';
import fs from 'fs';

// CREATE RECIPE - TESTED
const createRecipe = async (req, res) => {
    try {
        const { title, description, ingredients, instructions } = req.body;
        const userId = req.user.id; // Dari middleware verifyToken
        const file = req.file;

        // Cek field yang masih kosong
        if (!title || !description || !ingredients || !instructions) {
            return res.status(400).json({
                status: "error",
                message: "All fields (title, description, ingredients, instructions) are required"
            });
        }

        let imageUrl = null;
        if (file) {
            // Upload gambar ke Cloudinary
            const uploadResult = await cloudinary.uploader.upload(file.path, {
                folder: 'Recipe-App/Recipe_Images/',
                use_filename: true,
                unique_filename: false
            });
            imageUrl = uploadResult.secure_url;
            
            // Hapus file di temp
            fs.unlink(file.path, (err) => {
                if (err) console.error("Failed to delete temp file:", err);
            });
        }

        // Buat resep baru
        const newRecipe = await Recipe.create({
            userId,
            title,
            description,
            ingredients,
            instructions,
            imageUrl
        });

        res.status(201).json({
            status: "success",
            message: "Recipe created successfully",
            data: newRecipe
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// UPDATE RECIPE - TESTED
const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Untuk FormData, gunakan req.body untuk text fields
        const { 
            judul: title, 
            deskripsi: description, 
            bahan_bahan: ingredients, 
            cara_pembuatan: instructions,
            gambarLama: oldImage 
        } = req.body;

        const file = req.file;
        
        const recipe = await Recipe.findByPk(id);
        if (!recipe) {
            return res.status(404).json({
                status: "error",
                message: "Recipe not found"
            });
        }

        if (recipe.userId !== userId) {
            return res.status(403).json({
                status: "error",
                message: "You can only update your own recipes"
            });
        }

        let updatedFields = {
            title: title || recipe.title,
            description: description || recipe.description,
            ingredients: ingredients || recipe.ingredients,
            instructions: instructions || recipe.instructions
        };

        if (file) {
            if (recipe.imageUrl) {
                const publicId = recipe.imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`Recipe-App/Recipe_Images/${publicId}`);
            }

            const uploadResult = await cloudinary.uploader.upload(file.path, {
                folder: "Recipe-App/Recipe_Images",
                use_filename: true,
                unique_filename: false
            });
            updatedFields.imageUrl = uploadResult.secure_url;
            
            fs.unlink(file.path, (err) => {
                if (err) console.error("Failed to delete temp file:", err);
            });
        }

        await recipe.update(updatedFields);

        res.status(200).json({
            status: "success",
            message: "Recipe updated successfully",
            data: await Recipe.findByPk(id, {
                include: [{
                    model: User,
                    attributes: ['id', 'username', 'profilePicture']
                }]
            })
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// DELETE RECIPE - TESTED
const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Dari middleware verifyToken

        // Cari resep
        const recipe = await Recipe.findByPk(id);
        if (!recipe) {
            return res.status(404).json({
                status: "error",
                message: "Recipe not found"
            });
        }

        // Cek apakah pengguna yang sedang login yang memiliki resep tersebut
        if (recipe.userId !== userId) {
            return res.status(403).json({
                status: "error",
                message: "You can only delete your own recipes"
            });
        }

        // Hapus gambar dari Cloudinary jika ada
        if (recipe.imageUrl) {
            const publicId = recipe.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`Recipe-App/Recipe_Images/${publicId}`);
        }

        // Hapus resep
        await recipe.destroy();

        res.status(200).json({
            status: "success",
            message: "Recipe deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// GET ALL RECIPES - TESTED
const getAllRecipes = async (req, res) => {
    try {

        // Ambil semua resep dengan relasi dengan tabel User
        const recipes = await Recipe.findAll({
            include: [{
                model: User,
                attributes: ['id', 'username', 'profilePicture']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            status: "success",
            results: recipes.length,
            data: recipes
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// GET RECIPES BY USER - TESTED
const getRecipesByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        const recipes = await Recipe.findAll({
            where: { userId },
            include: [{
                model: User,
                attributes: ['id', 'username', 'profilePicture']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            status: "success",
            results: recipes.length,
            data: recipes
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// GET RECIPE BY ID - TESTED
const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Cari resep berdasarkan ID dan sertakan relasi dengan User dan Comment
        const recipe = await Recipe.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'profilePicture']
                },
                {
                    model: Comment,
                    include: [{
                        model: User,
                        attributes: ['id', 'username', 'profilePicture', 'headline']
                    }],
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (!recipe) {
            return res.status(404).json({
                status: "error",
                message: "Recipe not found"
            });
        }

        res.status(200).json({
            status: "success",
            data: recipe
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

export {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getAllRecipes,
    getRecipesByUser,
    getRecipeById
};