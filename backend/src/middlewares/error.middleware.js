import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

function errorHandler(err, req, res, next) {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, err.errors || [], err.stack);
    }

    // Log the error
    logger.error(`${req.method} ${req.originalUrl} - Status: ${error.statusCode} - Message: ${error.message}\nStack: ${error.stack}`);

    const response = {
        success: false,
        message: error.message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    res.status(error.statusCode).json(response);
}

export default errorHandler;
