import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ApiErrorResponse } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Logger utility for API endpoints
 */
export class ApiLogger {
  static info(message: string, data?: Record<string, unknown>) {
    console.log(`[API INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    console.error(`[API ERROR] ${message}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      data
    });
  }

  static warn(message: string, data?: Record<string, unknown>) {
    console.warn(`[API WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static debug(message: string, data?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.debug(`[API DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}

/**
 * Standardized API error response creator
 */
export class ApiErrorHandler {
  static createErrorResponse(
    message: string,
    code: string,
    status: number,
    details?: Record<string, unknown>
  ): Response {
    const errorResponse: ApiErrorResponse = {
      message,
      code,
      ...(details && { details })
    };

    ApiLogger.error(`API Error Response: ${code}`, new Error(message), { status, details });

    return new Response(JSON.stringify(errorResponse), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static validationError(details: Record<string, unknown>): Response {
    return this.createErrorResponse(
      'Validation error',
      'VALIDATION_ERROR',
      400,
      details
    );
  }

  static unauthorizedError(): Response {
    return this.createErrorResponse(
      'Authentication required',
      'UNAUTHORIZED',
      401
    );
  }

  static notFoundError(resource: string = 'Resource'): Response {
    return this.createErrorResponse(
      `${resource} not found`,
      'NOT_FOUND',
      404
    );
  }

  static internalServerError(originalError?: Error | unknown): Response {
    ApiLogger.error('Internal Server Error', originalError);
    return this.createErrorResponse(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }

  static databaseError(originalError?: Error | unknown): Response {
    ApiLogger.error('Database Error', originalError);
    return this.createErrorResponse(
      'Internal server error',
      'DATABASE_ERROR',
      500
    );
  }
}

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
      status: status || 'unknown'
    });
    return duration;
  }
}
