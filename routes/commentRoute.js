import express from 'express';
const router = express.Router();
import verifyToken from '../middlewares/verifyToken.js';

import {
    createComment,
    editComment,
    deleteComment,
    getCommentsByRecipe,
    getCommentById
} from '../controllers/commentController.js';

// GET ALL COMMENTS BY RECIPE
router.get('/recipe/:recipeId', getCommentsByRecipe);

// GET COMMENT BY ID
router.get('/:id', getCommentById);

// CREATE NEW COMMENT
router.post('/new/:recipeId', verifyToken, createComment);

// UPDATE COMMENT
router.put('/edit/:id', verifyToken, editComment);

// DELETE COMMENT
router.delete('/delete/:id', verifyToken, deleteComment);

export default router;