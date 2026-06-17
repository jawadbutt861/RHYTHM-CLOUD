import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import userModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";
import { sendMail } from "../services/email.service.js";

// Validation Schemas
export const registerSchema = {
    body: z.object({
        username: z.string().min(3, "Username must be at least 3 characters").max(30),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        role: z.enum(["user", "artist"]).optional()
    })
};

export const loginSchema = {
    body: z.object({
        username: z.string().optional(),
        email: z.string().optional(),
        password: z.string().min(1, "Password is required")
    })
};

export const forgotPasswordSchema = {
    body: z.object({
        email: z.string().email("Invalid email format")
    })
};

export const resetPasswordSchema = {
    body: z.object({
        password: z.string().min(6, "Password must be at least 6 characters")
    })
};

// Cookie Configuration
const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge
});

const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 mins
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper functions for tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
};

const registerUser = catchAsync(async (req, res) => {
    const { username, email, password, role = "user" } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
        throw new ApiError(409, "User with this username or email already exists");
    }

    const hash = await bcrypt.hash(password, 10);

    // Email verification token generation
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await userModel.create({
        username,
        email,
        password: hash,
        role,
        isVerified: false,
        verificationToken,
        verificationTokenExpires
    });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/api/auth/verify-email/${verificationToken}`;
    await sendMail({
        to: user.email,
        subject: "Verify Your Email - Rhythm Cloud",
        text: `Welcome to Rhythm Cloud! Please verify your email by clicking the link: ${verificationLink}`,
        html: `<p>Welcome to Rhythm Cloud!</p><p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`
    });

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY));
    res.cookie("token", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));

    res.status(201).json({
        success: true,
        message: "User registered successfully. Verification email sent.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }
    });
});

const verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.params;

    const user = await userModel.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired email verification token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Email verified successfully. You can now use all platform features."
    });
});

const loginUser = catchAsync(async (req, res) => {
    const { username, email, password } = req.body;

    const query = {};
    if (email) {
        query.email = email;
    } else if (username) {
        query.$or = [{ username }, { email: username }];
    } else {
        throw new ApiError(400, "Username or Email is required");
    }

    const user = await userModel.findOne(query);

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));
    res.cookie("refreshToken", refreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY));
    res.cookie("token", accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));

    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }
    });
});

const logoutUser = catchAsync(async (req, res) => {
    const token = req.cookies.accessToken || req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            await userModel.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
        } catch (err) {
            // Ignore token verification errors on logout
        }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("token");

    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });
});

const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(200).json({
            success: true,
            message: "If that email exists in our records, a password reset link has been sent."
        });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    await sendMail({
        to: user.email,
        subject: "Password Reset Request - Rhythm Cloud",
        text: `You requested a password reset. Please click this link to reset your password: ${resetLink}. This link is valid for 1 hour.`,
        html: `<p>You requested a password reset.</p><p>Please click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    });

    res.status(200).json({
        success: true,
        message: "If that email exists in our records, a password reset link has been sent."
    });
});

const resetPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await userModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined; // invalidate current sessions on password change
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successful. You can now log in with your new password."
    });
});

const refreshAccessToken = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token missing");
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userModel.findById(decoded.id).select("+refreshToken");
    if (!user) {
        throw new ApiError(401, "User not found");
    }
    if (user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Refresh token mismatch — please log in again");
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie("accessToken", tokens.accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));
    res.cookie("refreshToken", tokens.refreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY));
    res.cookie("token", tokens.accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY));

    res.status(200).json({
        success: true,
        message: "Access token refreshed successfully"
    });
});

export {
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    refreshAccessToken
};