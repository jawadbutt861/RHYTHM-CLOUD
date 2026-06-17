import { z } from "zod";
import userModel from "../models/user.model.js";
import musicModel from "../models/music.model.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

// Validation Schemas
export const updateProfileSchema = {
    body: z.object({
        username: z.string().min(3, "Username must be at least 3 characters").max(30).optional(),
        email: z.string().email("Invalid email format").optional(),
    }).refine(data => data.username || data.email, {
        message: "At least one field (username or email) must be provided for update",
        path: ["username"]
    })
};

const getUserProfile = catchAsync(async (req, res) => {
    // req.user is already loaded by the authenticate middleware, but we can query it to populate details if needed
    const user = await userModel.findById(req.user.id).select("-password").populate("favorites", "title uri artist");
    
    res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        user
    });
});

const updateUserProfile = catchAsync(async (req, res) => {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Check if new username or email is already taken
    if (username && username !== req.user.username) {
        const usernameExists = await userModel.findOne({ username });
        if (usernameExists) {
            throw new ApiError(409, "Username is already taken");
        }
    }

    if (email && email !== req.user.email) {
        const emailExists = await userModel.findOne({ email });
        if (emailExists) {
            throw new ApiError(409, "Email is already registered by another user");
        }
    }

    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        {
            ...(username && { username }),
            ...(email && { email, isVerified: false }) // reset verification if email changes
        },
        { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
        success: true,
        message: "Profile updated successfully" + (email && email !== req.user.email ? ". Verification required for new email." : ""),
        user: updatedUser
    });
});

const toggleFavoriteSong = catchAsync(async (req, res) => {
    const { songId } = req.params;
    const userId = req.user.id;

    // Check if music exists
    const music = await musicModel.findById(songId);
    if (!music) {
        throw new ApiError(404, "Song not found");
    }

    const user = await userModel.findById(userId);
    const isFavorited = user.favorites.includes(songId);

    let message = "";
    if (isFavorited) {
        user.favorites.pull(songId);
        message = "Song removed from favorites";
    } else {
        user.favorites.push(songId);
        message = "Song added to favorites";
    }

    await user.save();

    res.status(200).json({
        success: true,
        message,
        favoritesCount: user.favorites.length
    });
});

const getFavoriteSongs = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const user = await userModel.findById(req.user.id);
    const favoriteIds = user.favorites || [];

    const total = favoriteIds.length;
    const totalPages = Math.ceil(total / limit);

    // Paginate by querying the music database
    const favorites = await musicModel.find({ _id: { $in: favoriteIds } })
        .populate("artist", "username email")
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        message: "Favorite songs fetched successfully",
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        },
        musics: favorites
    });
});

const getArtistSongs = catchAsync(async (req, res) => {
    const { artistId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Optional check: verify if the target user is an artist
    const artistUser = await userModel.findById(artistId);
    if (!artistUser) {
        throw new ApiError(404, "Artist not found");
    }

    const total = await musicModel.countDocuments({ artist: artistId });
    const totalPages = Math.ceil(total / limit);

    const songs = await musicModel.find({ artist: artistId })
        .populate("artist", "username email")
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        message: "Artist songs fetched successfully",
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        },
        musics: songs
    });
});

export {
    getUserProfile,
    updateUserProfile,
    toggleFavoriteSong,
    getFavoriteSongs,
    getArtistSongs
};
