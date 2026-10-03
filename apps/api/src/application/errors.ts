export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INVALID_STATUS_TRANSITION"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly statusCode: number,
    message = code,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    if (error.message.includes("ALREADY_EXISTS")) return new AppError("CONFLICT", 409, error.message);
    if (error.message.includes("NOT_FOUND")) return new AppError("NOT_FOUND", 404, error.message);
    if (error.message.includes("INVALID_") && error.message.includes("TRANSITION")) {
      return new AppError("INVALID_STATUS_TRANSITION", 409, error.message);
    }
  }
  return new AppError("INTERNAL_ERROR", 500);
}
