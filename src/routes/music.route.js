import express from "express"
import multer from "multer"
import musicController from "../controllers/music.controller.js"
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

const uploadFiles = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'song', maxCount: 1 }
])



router.post('/create', authMiddleware.authArtist, uploadFiles, musicController.createMusic)
router.post('/album',authMiddleware.authArtist, musicController.createAlbum)
router.get('/',authMiddleware.authUser,musicController.getAllmusic)
router.get('/search',authMiddleware.authUser,musicController.getAllmusic)
router.get('/albums',authMiddleware.authUser,musicController.getAllalbums)
router.get('/albums/:id',authMiddleware.authUser,musicController.getAlbumMusic)
router.get('/artist/:id',authMiddleware.authUser,musicController.getArtistSongs)
router.get('/:id',authMiddleware.authUser,musicController.getMusicDetails)
router.put('/:id',authMiddleware.authArtist,upload.single('thumbnail'),musicController.updateMusic)
router.delete('/:id',authMiddleware.authArtist,musicController.deleteMusic)
router.put('/albums/:id',authMiddleware.authArtist,musicController.updateAlbum)
router.delete('/albums/:id',authMiddleware.authArtist,musicController.deleteAlbum)

export default router