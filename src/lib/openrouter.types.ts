/**
 * Type definitions for OpenRouter service
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  systemMessage?: string;
  responseFormat?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatResponse {
  id: string;
  model: string;
  content: string;
  rawResponse: any;
}

export interface ResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

export interface FlashcardGenerationOptions extends Partial<ChatOptions> {
  customPrompt?: string;
}

export interface GeneratedFlashcard {
  front_content: string;
  back_content: string;
}

export interface OpenRouterOptions {
  defaultModel: string;
  baseUrl: string;
  defaultParams: {
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  };
  timeout: number;
  retries: number;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
}

export const DEFAULT_OPTIONS: OpenRouterOptions = {
  defaultModel: 'openai/gpt-4o-mini',
  baseUrl: 'https://openrouter.ai/api/v1',
  defaultParams: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  },
  timeout: 60000,
  retries: 3
}; 