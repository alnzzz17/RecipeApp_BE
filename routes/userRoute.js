import express from 'express';
const router = express.Router();
import verifyToken from '../middlewares/verifyToken.js';
import upload from '../utils/fileUpload.js';

import {
    postUser,
    loginHandler,
    logoutHandler,
    deleteUser,
    editUser,
    getUserById,
} from '../controllers/userController.js';

// REGISTER USER
router.post('/register', postUser);

// USER LOGIN
router.post('/login', loginHandler);

// USER LOGOUT
router.post('/logout', verifyToken, logoutHandler);

// GET USER BY ID
router.get('/:id', verifyToken, getUserById);

// EDIT USER PROFILE (with optional file upload)
router.put('/edit', verifyToken, upload.single('profilePicture'), editUser);

// DELETE USER
router.delete('/delete/:id', verifyToken, deleteUser); 

export default router;