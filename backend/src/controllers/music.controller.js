import { z } from "zod";
import musicModel from "../models/music.model.js";
import albumModel from "../models/album.model.js";
import userModel from "../models/user.model.js";
import { uploadFile } from "../services/storage.service.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

// Validation Schemas
export const createMusicSchema = {
    body: z.object({
        title: z.string().min(1, "Title is required").max(100),
    })
};

export const updateMusicSchema = {
    body: z.object({
        title: z.string().min(1, "Title cannot be empty").max(100).optional(),
    })
};

export const createAlbumSchema = {
    body: z.object({
        title: z.string().min(1, "Title is required").max(100),
        musics: z.array(z.string()).optional(),
    })
};

export const updateAlbumSchema = {
    body: z.object({
        title: z.string().min(1, "Title cannot be empty").max(100).optional(),
        musics: z.array(z.string()).optional(),
    })
};

// Generic Pagination Helper
const paginateQuery = async (model, filter = {}, page = 1, limit = 10, populateFields = [], selectFields = "") => {
    const skip = (page - 1) * limit;
    const total = await model.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    let query = model.find(filter).skip(skip).limit(limit);
    if (selectFields) {
        query = query.select(selectFields);
    }
    populateFields.forEach(p => {
        if (typeof p === "string") {
            query = query.populate(p);
        } else {
            query = query.populate(p.path, p.select);
        }
    });

    const docs = await query;
    return {
        docs,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

// Controllers
const createMusic = catchAsync(async (req, res) => {
    const { title } = req.body;
    const file = req.file;

    if (!file) {
        throw new ApiError(400, "Music file is required for upload");
    }

    const result = await uploadFile(file.buffer.toString('base64'));

    const music = await musicModel.create({
        uri: result.url,
        title,
        artist: req.user.id,
    });

    res.status(201).json({
        success: true,
        message: "Music created successfully",
        music: {
            id: music._id,
            uri: music.uri,
            title: music.title,
            artist: music.artist,
        }
    });
});

const getMusicById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const music = await musicModel.findById(id).populate("artist", "username email");

    if (!music) {
        throw new ApiError(404, "Song not found");
    }

    res.status(200).json({
        success: true,
        message: "Song details fetched successfully",
        music
    });
});

const updateMusic = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const music = await musicModel.findById(id);
    if (!music) {
        throw new ApiError(404, "Song not found");
    }

    // Authorization: only artist who uploaded it (or admin) can update it
    if (music.artist.toString() !== req.user.id && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to update this song");
    }

    if (title) music.title = title;
    
    if (req.file) {
        const result = await uploadFile(req.file.buffer.toString('base64'));
        music.uri = result.url;
    }

    await music.save();

    res.status(200).json({
        success: true,
        message: "Song updated successfully",
        music
    });
});

const deleteMusic = catchAsync(async (req, res) => {
    const { id } = req.params;

    const music = await musicModel.findById(id);
    if (!music) {
        throw new ApiError(404, "Song not found");
    }

    // Authorization: only artist who uploaded it (or admin) can delete it
    if (music.artist.toString() !== req.user.id && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to delete this song");
    }

    await musicModel.findByIdAndDelete(id);

    // Clean up referenced album entries containing this music
    await albumModel.updateMany({ musics: id }, { $pull: { musics: id } });

    // Clean up favorites lists containing this music
    await userModel.updateMany({ favorites: id }, { $pull: { favorites: id } });

    res.status(200).json({
        success: true,
        message: "Song deleted successfully"
    });
});

const searchMusics = catchAsync(async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;
    const pNum = parseInt(page, 10) || 1;
    const lNum = parseInt(limit, 10) || 10;

    let filter = {};
    if (q) {
        // Find matching artist user IDs
        const matchedArtists = await userModel.find({
            username: { $regex: q, $options: "i" }
        }).select("_id");

        const artistIds = matchedArtists.map(u => u._id);

        filter = {
            $or: [
                { title: { $regex: q, $options: "i" } },
                { artist: { $in: artistIds } }
            ]
        };
    }

    const { docs: musics, pagination } = await paginateQuery(
        musicModel,
        filter,
        pNum,
        lNum,
        [{ path: "artist", select: "username email" }]
    );

    res.status(200).json({
        success: true,
        message: "Search results fetched successfully",
        pagination,
        musics
    });
});

const createAlbum = catchAsync(async (req, res) => {
    const { title, musics = [] } = req.body;

    const album = await albumModel.create({
        title,
        artist: req.user.id,
        musics: musics,
    });

    res.status(201).json({
        success: true,
        message: "Album created successfully",
        album: {
            id: album._id,
            title: album.title,
            artist: album.artist,
            musics: album.musics,
        }
    });
});

const updateAlbum = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, musics } = req.body;

    const album = await albumModel.findById(id);
    if (!album) {
        throw new ApiError(404, "Album not found");
    }

    // Authorization: only album artist (or admin) can update
    if (album.artist.toString() !== req.user.id && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to update this album");
    }

    if (title) album.title = title;
    if (musics) album.musics = musics;

    await album.save();

    res.status(200).json({
        success: true,
        message: "Album updated successfully",
        album
    });
});

const deleteAlbum = catchAsync(async (req, res) => {
    const { id } = req.params;

    const album = await albumModel.findById(id);
    if (!album) {
        throw new ApiError(404, "Album not found");
    }

    // Authorization: only album artist (or admin) can delete
    if (album.artist.toString() !== req.user.id && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to delete this album");
    }

    await albumModel.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: "Album deleted successfully"
    });
});

const getAllMusics = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { docs: musics, pagination } = await paginateQuery(
        musicModel,
        {},
        page,
        limit,
        [{ path: "artist", select: "username email" }]
    );

    res.status(200).json({
        success: true,
        message: "Musics fetched successfully",
        pagination,
        musics
    });
});

const getAllAlbums = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { docs: albums, pagination } = await paginateQuery(
        albumModel,
        {},
        page,
        limit,
        [{ path: "artist", select: "username email" }],
        "title artist"
    );

    res.status(200).json({
        success: true,
        message: "Albums fetched successfully",
        pagination,
        albums
    });
});

const getAlbumById = catchAsync(async (req, res) => {
    const albumId = req.params.albumId;

    const album = await albumModel.findById(albumId)
        .populate("artist", "username email")
        .populate("musics");

    if (!album) {
        throw new ApiError(404, "Album not found");
    }

    res.status(200).json({
        success: true,
        message: "Album fetched successfully",
        album
    });
});

export {
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
};