export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, details);
  }

  static notFound(message: string, details?: unknown) {
    return new ApiError(404, message, details);
  }

  static tooLarge(message: string, details?: unknown) {
    return new ApiError(413, message, details);
  }

  static unprocessable(message: string, details?: unknown) {
    return new ApiError(422, message, details);
  }

  static internal(message: string, details?: unknown) {
    return new ApiError(500, message, details);
  }

  static badGateway(message: string, details?: unknown) {
    return new ApiError(502, message, details);
  }
}
