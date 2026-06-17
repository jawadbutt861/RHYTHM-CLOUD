import express from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    verifyEmail, 
    forgotPassword, 
    resetPassword, 
    refreshAccessToken 
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import { 
    registerSchema, 
    loginSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
} from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh', refreshAccessToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', authenticate, logoutUser);

export default router;