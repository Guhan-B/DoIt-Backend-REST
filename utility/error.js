module.exports = (error, req, res, next) => {
    const message = error.message;
    const statusCode = error.statusCode || 500;
    const errors = error.errors || [];
    res.status(statusCode).json({
        message: message,
        errors: errors,
        isError: true
    });
}