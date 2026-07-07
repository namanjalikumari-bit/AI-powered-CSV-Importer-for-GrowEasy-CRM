import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import { sendError } from "../utils/ApiResponse";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    logger.warn({ err, path: req.path }, err.message);
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Please upload a smaller CSV file."
        : err.message;
    logger.warn({ err, path: req.path }, "Multer upload error");
    sendError(res, message, 400);
    return;
  }

  logger.error({ err, path: req.path }, "Unhandled error");
  sendError(res, "Internal server error", 500);
}
