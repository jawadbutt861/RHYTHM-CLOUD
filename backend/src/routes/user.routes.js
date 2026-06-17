import express from 'express';
import { 
    getUserProfile, 
    updateUserProfile, 
    toggleFavoriteSong, 
    getFavoriteSongs, 
    getArtistSongs 
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import { updateProfileSchema } from "../controllers/user.controller.js";

const router = express.Router();

// Protected user profile routes
router.get('/profile', authenticate, getUserProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), updateUserProfile);

// Favorites routes
router.post('/favorites/:songId', authenticate, toggleFavoriteSong);
router.get('/favorites', authenticate, getFavoriteSongs);

// Artist specific routes (publicly viewable)
router.get('/artist/:artistId/songs', getArtistSongs);

export default router;
