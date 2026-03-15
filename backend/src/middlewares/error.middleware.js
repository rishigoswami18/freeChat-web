/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
};
