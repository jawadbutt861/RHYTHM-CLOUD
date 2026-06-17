import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

const authenticate = catchAsync(async (req, res, next) => {
    let token = req.cookies.accessToken || req.cookies.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        throw new ApiError(401, "Authentication token missing or invalid");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await userModel.findById(decoded.id).select("-password");
        if (!user) {
            throw new ApiError(401, "User associated with this token no longer exists");
        }

        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401, "Unauthorized: Invalid or expired token");
    }
});

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized: Please log in first"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, `Forbidden: Role '${req.user.role}' is not authorized to access this resource`));
        }
        next();
    };
};

const requireVerified = (req, res, next) => {
    if (!req.user) {
        return next(new ApiError(401, "Unauthorized: Please log in first"));
    }
    if (!req.user.isVerified) {
        return next(new ApiError(403, "Forbidden: Email verification required"));
    }
    next();
};

export { authenticate, authorizeRoles, requireVerified };