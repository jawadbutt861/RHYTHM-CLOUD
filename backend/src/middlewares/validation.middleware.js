import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
    try {
        if (schema.body) {
            req.body = schema.body.parse(req.body);
        }
        if (schema.query) {
            req.query = schema.query.parse(req.query);
        }
        if (schema.params) {
            req.params = schema.params.parse(req.params);
        }
        return next();
    } catch (error) {
        const errors = error.errors ? error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        })) : [];
        return next(new ApiError(400, "Validation failed", errors));
    }
};

export default validate;
