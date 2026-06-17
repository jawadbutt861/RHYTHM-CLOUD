import express from 'express';
import { 
    createMusic, 
    getMusicById, 
    updateMusic, 
    deleteMusic, 
    searchMusics, 
    createAlbum, 
    updateAlbum, 
    deleteAlbum, 
    getAllMusics, 
    getAllAlbums, 
    getAlbumById 
} from "../controllers/music.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import { 
    createMusicSchema, 
    updateMusicSchema, 
    createAlbumSchema, 
    updateAlbumSchema 
} from "../controllers/music.controller.js";
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage()
});

const router = express.Router();

// Public / General Authenticated search and fetch routes
router.get("/search", authenticate, searchMusics);
router.get("/albums", authenticate, getAllAlbums);
router.get("/albums/:albumId", authenticate, getAlbumById);
router.get("/", authenticate, getAllMusics);
router.get("/:id", authenticate, getMusicById);

// Artist specific upload & create routes
router.post("/upload", authenticate, authorizeRoles('artist'), upload.single("music"), validate(createMusicSchema), createMusic);
router.post("/album", authenticate, authorizeRoles('artist'), validate(createAlbumSchema), createAlbum);

// Song management routes (owner artist only, validated inside controller or middleware)
router.patch("/:id", authenticate, authorizeRoles('artist'), upload.single("music"), validate(updateMusicSchema), updateMusic);
router.delete("/:id", authenticate, authorizeRoles('artist'), deleteMusic);

// Album management routes (owner artist only)
router.patch("/albums/:id", authenticate, authorizeRoles('artist'), validate(updateAlbumSchema), updateAlbum);
router.delete("/albums/:id", authenticate, authorizeRoles('artist'), deleteAlbum);

export default router;