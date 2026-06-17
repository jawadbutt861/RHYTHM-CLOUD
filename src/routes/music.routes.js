import express from 'express';
import { createMusic, createAlbum, getAllMusics, getAllAlbums, getAlbumById } from "../controllers/music.controller.js"
import { authArtist, authUser } from "../middlewares/auth.middleware.js"
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage()
})

const router = express.Router();


router.post("/upload", authArtist, upload.single("music"), createMusic)

router.post("/album", authArtist, createAlbum)


router.get("/", authUser, getAllMusics)
router.get("/albums", authUser, getAllAlbums)

router.get("/albums/:albumId", authUser, getAlbumById)



export default router;