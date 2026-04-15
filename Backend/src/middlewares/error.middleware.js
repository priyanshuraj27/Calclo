import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, _req, res, _next) => {
  const statusCode =
    err instanceof ApiError ? err.statusCode : err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err instanceof ApiError ? err.errors : err.errors || [];

  res.status(statusCode).json({
    statusCode,
    message,
    success: false,
    errors,
  });
};
