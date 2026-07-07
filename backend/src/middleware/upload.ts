import multer from "multer";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  "text/csv",
  "application/vnd.ms-excel",
  "application/csv",
  "text/plain",
]);

export const csvUpload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const isCsvExtension = file.originalname.toLowerCase().endsWith(".csv");
    const isCsvMime = ALLOWED_MIME_TYPES.has(file.mimetype);

    if (!isCsvExtension && !isCsvMime) {
      callback(ApiError.badRequest("Only .csv files are supported"));
      return;
    }
    callback(null, true);
  },
});
