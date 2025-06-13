import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApiErrorResponse } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Logger utility for API endpoints
 */
export const ApiLogger = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info(..._args: [string, Record<string, unknown>?]) {
    // API info logging removed to comply with ESLint rules
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(..._args: [string, (Error | unknown)?, Record<string, unknown>?]) {
    // API error logging removed to comply with ESLint rules
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(..._args: [string, Record<string, unknown>?]) {
    // API warning logging removed to comply with ESLint rules
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debug(..._args: [string, Record<string, unknown>?]) {
    // API debug logging removed to comply with ESLint rules
  },
};

/**
 * Standardized API error response creator
 */
export const ApiErrorHandler = {
  createErrorResponse(message: string, code: string, status: number, details?: Record<string, unknown>): Response {
    const errorResponse: ApiErrorResponse = {
      message,
      code,
      ...(details && { details }),
    };

    ApiLogger.error(`API Error Response: ${code}`, new Error(message), { status, details });

    return new Response(JSON.stringify(errorResponse), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  },

  validationError(details: Record<string, unknown>): Response {
    return this.createErrorResponse("Validation error", "VALIDATION_ERROR", 400, details);
  },

  unauthorizedError(): Response {
    return this.createErrorResponse("Authentication required", "UNAUTHORIZED", 401);
  },

  notFoundError(resource = "Resource"): Response {
    return this.createErrorResponse(`${resource} not found`, "NOT_FOUND", 404);
  },

  internalServerError(originalError?: Error | unknown): Response {
    ApiLogger.error("Internal Server Error", originalError);
    return this.createErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR", 500);
  },

  databaseError(originalError?: Error | unknown): Response {
    ApiLogger.error("Database Error", originalError);
    return this.createErrorResponse("Internal server error", "DATABASE_ERROR", 500);
  },
};

/**
 * Request timing utility for performance monitoring
 */
export class RequestTimer {
  private startTime: number;
  private endpoint: string;

  constructor(endpoint: string) {
    this.startTime = performance.now();
    this.endpoint = endpoint;
    ApiLogger.debug(`Request started: ${endpoint}`);
  }

  end(status?: number): number {
    const duration = performance.now() - this.startTime;
    ApiLogger.info(`Request completed: ${this.endpoint}`, {
      duration_ms: Math.round(duration),
      status: status || "unknown",
    });
    return duration;
  }
}
