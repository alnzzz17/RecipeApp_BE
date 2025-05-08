import express from 'express';
const router = express.Router();
import verifyToken from '../middlewares/verifyToken.js';
import upload from '../middlewares/fileUpload.js';

import {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getAllRecipes,
    getRecipesByUser,
    getRecipeById
} from '../controllers/recipeController.js';

// GET ALL RECIPES
router.get('/all', getAllRecipes);

// GET RECIPES BY USER ID
router.get('/user/:userId', getRecipesByUser);

// GET RECIPE BY ID
router.get('/:id', getRecipeById);

// CREATE NEW RECIPE (with file upload)
router.post('/new', verifyToken, upload.single('imageUrl'), createRecipe);

// UPDATE RECIPE (with file upload)
router.put('/edit/:id', verifyToken, upload.single('imageUrl'), updateRecipe);

// DELETE RECIPE
router.delete('/delete/:id', verifyToken, deleteRecipe);

export default router;