import express from 'express'
import userController from '../controllers/user.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/me',authMiddleware.requireRole(),userController.getProfile)
router.put('/me',authMiddleware.requireRole(),userController.updateProfile)
router.post('/favorites/:id',authMiddleware.requireRole(),userController.toggleFavorite)
router.get('/favorites',authMiddleware.requireRole(),userController.getFavorites)
router.get('/artist/:id/songs',authMiddleware.requireRole(),userController.getArtistSongs)

export default router
