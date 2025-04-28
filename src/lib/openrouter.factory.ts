/**
 * Factory for creating OpenRouter service with proper error handling
 */

import { OpenRouterService, OpenRouterAuthError } from './openrouter.services';

// Custom error for service unavailability
export class AIServiceUnavailableError extends Error {
  constructor(message: string) {
    super(`AI_SERVICE_UNAVAILABLE: ${message}`);
    this.name = 'AIServiceUnavailableError';
  }
}

/**
 * Creates an OpenRouter service instance with proper error handling
 * Wraps initialization errors in a standardized format
 */
export function createOpenRouterService(): OpenRouterService {
  try {
    return new OpenRouterService();
  } catch (error) {
    if (error instanceof OpenRouterAuthError) {
      throw new AIServiceUnavailableError('OpenRouter API key not configured');
    }
    
    // Rethrow other errors with consistent format
    if (error instanceof Error) {
      throw new AIServiceUnavailableError(error.message);
    }
    
    throw new AIServiceUnavailableError('Unknown error initializing OpenRouter service');
  }
}

// Get a singleton instance for the application
let openRouterInstance: OpenRouterService | null = null;

/**
 * Get a singleton instance of the OpenRouter service
 * Will return null if service cannot be initialized
 */
export function getOpenRouterService(): OpenRouterService | null {
  if (!openRouterInstance) {
    try {
      openRouterInstance = createOpenRouterService();
    } catch (error) {
      console.error('Failed to initialize OpenRouter service:', error);
      return null;
    }
  }
  return openRouterInstance;
}

/**
 * Check if the OpenRouter service is available
 */
export function isOpenRouterAvailable(): boolean {
  try {
    const service = createOpenRouterService();
    return !!service;
  } catch (error) {
    return false;
  }
} 