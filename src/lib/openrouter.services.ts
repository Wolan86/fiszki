/**
 * OpenRouter service for interacting with the OpenRouter.ai API
 * Provides interfaces for chat completions and specialized AI functions
 */

import type {
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ResponseFormat,
  FlashcardGenerationOptions,
  GeneratedFlashcard,
  OpenRouterOptions,
  RequestOptions
} from './openrouter.types';
import { DEFAULT_OPTIONS } from './openrouter.types';

// Error types for specific OpenRouter errors
export class OpenRouterError extends Error {
  constructor(message: string, public readonly code: string) {
    super(`${code}: ${message}`);
    this.name = 'OpenRouterError';
  }
}

export class OpenRouterAuthError extends OpenRouterError {
  constructor(message: string) {
    super(message, 'OPENROUTER_AUTH_ERROR');
    this.name = 'OpenRouterAuthError';
  }
}

export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string, public readonly retryAfter?: number) {
    super(message, 'OPENROUTER_RATE_LIMIT');
    this.name = 'OpenRouterRateLimitError';
  }
}

export class OpenRouterNetworkError extends OpenRouterError {
  constructor(message: string) {
    super(message, 'OPENROUTER_NETWORK_ERROR');
    this.name = 'OpenRouterNetworkError';
  }
}

export class OpenRouterValidationError extends OpenRouterError {
  constructor(message: string) {
    super(message, 'OPENROUTER_VALIDATION_ERROR');
    this.name = 'OpenRouterValidationError';
  }
}

export class OpenRouterContentFilterError extends OpenRouterError {
  constructor(message: string) {
    super(message, 'OPENROUTER_CONTENT_FILTER');
    this.name = 'OpenRouterContentFilterError';
  }
}

// Get API key with fallback mechanisms
function getApiKey(): string {
  // Try different possible environment variable formats
  let apiKey = 
    // Astro standard env
    import.meta.env.OPENROUTER_API_KEY || 
    // Alternative naming
    import.meta.env.VITE_OPENROUTER_API_KEY ||
    // For Astro server endpoints
    process.env.OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY ||
    // Additional environment variable formats that might be used
    import.meta.env.PUBLIC_OPENROUTER_API_KEY ||
    process.env.PUBLIC_OPENROUTER_API_KEY ||
    '';
  
  // Log all environment variables in development (helps with debugging)
  if (import.meta.env.DEV) {
    if (!apiKey) {
      console.warn('OpenRouter API key not found in any environment variable.');
      // List all available environment variables (safely without revealing values)
      console.log('Available env vars:', 
        [...Object.keys(import.meta.env || {}), ...Object.keys(process.env || {})]
          .filter(key => !key.includes('_'))
          .filter(key => key !== 'npm_config_registry') // Filter out noisy npm variables
      );
    } else {
      console.log('OpenRouter API key found with length:', apiKey.length);
    }
  }
  
  // Clean up the API key if needed
  apiKey = apiKey.trim();
  
  return apiKey;
}

export class OpenRouterService {
  // Tracks service health for circuit breaker pattern
  private consecutiveFailures = 0;
  private readonly maxConsecutiveFailures = 5;
  private serviceDisabled = false;
  private serviceDisabledUntil = 0;

  constructor(
    private readonly apiKey: string = getApiKey(),
    private options: OpenRouterOptions = DEFAULT_OPTIONS
  ) {
    // Validate API key
    if (!this.apiKey) {
      throw new OpenRouterAuthError(
        'OpenRouter API key not found. Please set OPENROUTER_API_KEY in your environment variables. ' +
        'Copy .env.example to .env and add your API key from https://openrouter.ai/'
      );
    }
  }

  // Configuration Methods
  public setDefaultModel(model: string): void {
    if (!model || typeof model !== 'string') {
      throw new OpenRouterValidationError('Invalid model specified');
    }
    this.options.defaultModel = model;
  }

  public setDefaultParameters(params: Partial<OpenRouterOptions['defaultParams']>): void {
    this.options.defaultParams = {
      ...this.options.defaultParams,
      ...params
    };
  }

  public setTimeout(timeoutMs: number): void {
    if (timeoutMs <= 0 || !Number.isInteger(timeoutMs)) {
      throw new OpenRouterValidationError('Timeout must be a positive integer');
    }
    this.options.timeout = timeoutMs;
  }

  public setRetries(count: number): void {
    if (count < 0 || !Number.isInteger(count)) {
      throw new OpenRouterValidationError('Retry count must be a non-negative integer');
    }
    this.options.retries = count;
  }

  /**
   * Create a chat completion using the OpenRouter API
   * @param input A string prompt or array of chat messages
   * @param options Optional configuration for the request
   * @returns A structured response with content and metadata
   */
  public async chat(
    input: string | ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatResponse> {
    try {
      // Security: Validate input before proceeding
      this.validateInput(input);
      
      // Check circuit breaker
      this.checkServiceAvailability();
      
      // Format messages based on input
      const messages = this.formatMessages(input, options?.systemMessage);
      
      // Build request body with parameters
      const requestBody = this.buildRequestBody(messages, options);
      
      // Make the API request
      const response = await this.makeRequest<any>(
        '/chat/completions',
        requestBody
      );
      
      // Reset failure count on success
      this.consecutiveFailures = 0;
      
      // Extract relevant data from response
      const content = response?.choices?.[0]?.message?.content || '';
      
      return {
        id: response?.id || '',
        model: response?.model || '',
        content,
        rawResponse: response
      };
    } catch (error) {
      // Track failures for circuit breaker
      this.trackFailure();
      
      if (error instanceof OpenRouterError) {
        throw error;
      }
      return this.handleError(error);
    }
  }

  /**
   * Create a JSON schema response format for structured outputs
   * @param name Name for the schema
   * @param schema The JSON schema definition
   * @returns A formatted response format object for API requests
   */
  public createJsonSchema<T>(
    name: string,
    schema: Record<string, unknown>
  ): ResponseFormat {
    if (!name || typeof name !== 'string') {
      throw new OpenRouterValidationError('Schema name is required');
    }
    
    if (!schema || typeof schema !== 'object') {
      throw new OpenRouterValidationError('Valid schema object is required');
    }
    
    return {
      type: 'json_schema',
      json_schema: {
        name,
        strict: true,
        schema
      }
    };
  }

  /**
   * Generate flashcards from provided text content
   * @param text The source text to generate flashcards from
   * @param count Number of flashcards to generate
   * @param options Additional options for generation
   * @returns Array of generated flashcards
   */
  public async generateFlashcards(
    text: string,
    count: number = 5,
    options?: FlashcardGenerationOptions
  ): Promise<GeneratedFlashcard[]> {
    try {
      console.log('Starting flashcard generation', { count, textLength: text?.length });
      
      if (!text || typeof text !== 'string') {
        throw new OpenRouterValidationError('Valid text input is required');
      }
      
      // Security: Sanitize input text
      const sanitizedText = this.sanitizeContent(text);
      console.log('Sanitized text for flashcard generation', { 
        originalLength: text.length, 
        sanitizedLength: sanitizedText.length 
      });
      
      // Limit count to reasonable range
      const safeCount = Math.min(Math.max(1, count), 20);
      
      // Create flashcard schema for structured output
      const flashcardSchema = this.createJsonSchema('flashcards', {
        type: 'object',
        properties: {
          flashcards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                front_content: { type: 'string' },
                back_content: { type: 'string' }
              },
              required: ['front_content', 'back_content'],
              additionalProperties: false
            }
          }
        },
        required: ['flashcards'],
        additionalProperties: false
      });
      
      // Create prompt for flashcard generation
      const prompt = this.createFlashcardPrompt(sanitizedText, safeCount, options?.customPrompt);
      console.log('Generated flashcard prompt', { 
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 200) + '...' 
      });
      
      // Make the API request with structured output format
      const chatOptions = {
        ...(options || {}),
        // Use a reliable model for flashcard generation if not specified
        model: options?.model || 'openai/gpt-4o-mini',
        responseFormat: flashcardSchema,
        // Lower temperature for more deterministic flashcard generation
        temperature: options?.temperature ?? 0.3,
        // Ensure enough tokens for response
        max_tokens: options?.max_tokens ?? 2000
      };
      
      console.log('Flashcard generation options:', {
        model: chatOptions.model,
        temperature: chatOptions.temperature,
        max_tokens: chatOptions.max_tokens,
        responseFormat: 'JSON schema (flashcards)'
      });
      
      const response = await this.chat(prompt, chatOptions);
      
      // Log the raw response content
      console.log('Flashcard raw response:', {
        id: response.id,
        model: response.model,
        contentType: typeof response.content,
        contentLength: typeof response.content === 'string' ? response.content.length : 'N/A',
        contentPreview: typeof response.content === 'string' 
          ? (response.content.length > 100 
              ? response.content.substring(0, 100) + '...' 
              : response.content)
          : 'non-string content'
      });
      
      // Parse and return the flashcards
      const flashcards = this.parseFlashcardResponse(response);
      console.log('Parsed flashcards result:', { 
        count: flashcards.length,
        flashcards: flashcards.map(card => ({
          front: card.front_content.substring(0, 30) + (card.front_content.length > 30 ? '...' : ''),
          back: card.back_content.substring(0, 30) + (card.back_content.length > 30 ? '...' : '')
        }))
      });
      
      return flashcards;
    } catch (error) {
      console.error('Flashcard generation error:', error);
      if (error instanceof OpenRouterError) {
        throw error;
      }
      return this.handleError(error);
    }
  }

  // Private utility methods
  private formatMessages(
    input: string | ChatMessage[],
    systemMessage?: string
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];
    
    // Add system message if provided
    if (systemMessage) {
      messages.push({
        role: 'system',
        content: this.sanitizeContent(systemMessage)
      });
    }

    // Handle string input by converting to user message
    if (typeof input === 'string') {
      messages.push({
        role: 'user',
        content: this.sanitizeContent(input)
      });
    } else {
      // Add all provided messages with sanitized content
      messages.push(...input.map(msg => ({
        ...msg,
        content: this.sanitizeContent(msg.content)
      })));
    }

    return messages;
  }

  private buildRequestBody(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Record<string, unknown> {
    const model = options?.model || this.options.defaultModel;
    
    const requestBody: Record<string, unknown> = {
      model,
      messages,
      temperature: options?.temperature ?? this.options.defaultParams.temperature,
      max_tokens: options?.max_tokens ?? this.options.defaultParams.max_tokens,
      top_p: options?.top_p ?? this.options.defaultParams.top_p,
      frequency_penalty: options?.frequency_penalty ?? this.options.defaultParams.frequency_penalty,
      presence_penalty: options?.presence_penalty ?? this.options.defaultParams.presence_penalty
    };

    // Add response format if specified
    if (options?.responseFormat) {
      requestBody.response_format = options.responseFormat;
    }

    return requestBody;
  }

  /**
   * Creates a prompt for flashcard generation
   */
  private createFlashcardPrompt(
    text: string,
    count: number,
    customPrompt?: string
  ): string {
    if (customPrompt) {
      return customPrompt.replace('{text}', text).replace('{count}', count.toString());
    }
    
    return `
      You are a flashcard generation assistant. Create ${count} high-quality flashcards from the following text.
      Each flashcard should have a concise question or concept on the front and a clear, comprehensive answer on the back.
      
      TEXT TO PROCESS:
      ${text}
      
      INSTRUCTIONS:
      1. Focus on key concepts, definitions, facts, and relationships in the text
      2. Make each flashcard self-contained and clear
      3. Ensure questions are specific and answers are complete
      4. Cover diverse topics from the text rather than focusing on one area
      5. Use clear, concise language
      6. Format questions to test recall, understanding, or application
      
      RESPONSE FORMAT:
      You MUST format your response as a valid JSON object with the following structure:
      {
        "flashcards": [
          {
            "front_content": "Question or concept goes here?", 
            "back_content": "Answer or explanation goes here."
          },
          ...more flashcards...
        ]
      }

      The response MUST be valid JSON with no other text, comments, or explanations outside the JSON structure.
      Each flashcard MUST have front_content and back_content fields as strings.
    `;
  }

  /**
   * Parses flashcard response from the API
   */
  private parseFlashcardResponse(response: ChatResponse): GeneratedFlashcard[] {
    try {
      // Parse the JSON content from the response
      if (!response?.content) {
        console.warn('Empty response content received from OpenRouter API', {
          id: response?.id,
          model: response?.model 
        });
        
        // Check if we have raw response data that might contain the flashcards
        if (response?.rawResponse?.choices?.[0]?.message?.content) {
          console.log('Found content in rawResponse, attempting to use that instead');
          const rawContent = response.rawResponse.choices[0].message.content;
          response = { ...response, content: rawContent };
        } else {
          // Log available response properties to help debug
          console.error('Response object inspection:', {
            responseKeys: response ? Object.keys(response) : 'null response',
            rawResponseKeys: response?.rawResponse ? Object.keys(response.rawResponse) : 'no rawResponse',
            choicesAvailable: !!response?.rawResponse?.choices,
            choicesLength: response?.rawResponse?.choices?.length
          });
          
          // Emergency fallback: return a single error flashcard
          return [{
            front_content: "Error generating flashcards",
            back_content: "The AI service was unable to generate flashcards from your text. Please try again or use a different text."
          }];
        }
      }
      
      let parsedContent: any;
      let parsingMethod = 'direct';
      
      // Handle string content by attempting to parse as JSON
      if (typeof response.content === 'string') {
        try {
          // Try to parse as JSON
          parsedContent = JSON.parse(response.content);
          parsingMethod = 'json_parse';
        } catch (parseError) {
          console.warn('Failed to parse response as JSON, attempting fallback extraction', parseError);
          
          // If JSON parsing fails, try to extract JSON-like structure from text response
          // This handles cases where the model returns markdown or additional text around the JSON
          const jsonMatch = response.content.match(/```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*})/);
          if (jsonMatch && (jsonMatch[1] || jsonMatch[2])) {
            try {
              const extractedJson = jsonMatch[1] || jsonMatch[2];
              parsedContent = JSON.parse(extractedJson);
              parsingMethod = 'json_extract_and_parse';
            } catch (fallbackError) {
              console.error('Fallback JSON extraction failed', { 
                error: fallbackError, 
                extractedText: jsonMatch[1] || jsonMatch[2]
              });
              
              // If extraction failed, log the full content to help debug
              console.log('Full response content:', response.content);
              
              // If no JSON-like structure was found, this might be a free-form response
              // Create a simple parsing fallback that looks for question/answer pairs
              const cards = this.extractFlashcardsFromText(response.content);
              if (cards.length > 0) {
                console.log('Successfully extracted flashcards from text', { count: cards.length });
                return cards;
              }
              throw new Error('Could not extract flashcards from response');
            }
          } else {
            console.log('No JSON structure found in response, attempting text extraction');
            // If no JSON-like structure was found, this might be a free-form response
            // Create a simple parsing fallback that looks for question/answer pairs
            const cards = this.extractFlashcardsFromText(response.content);
            if (cards.length > 0) {
              console.log('Successfully extracted flashcards from text', { count: cards.length });
              return cards;
            }
            
            // Log the complete response content for debugging
            console.error('Text extraction failed. Complete response:', response.content);
            throw new Error('Could not extract flashcards from response');
          }
        }
      } else {
        // If content is already an object, use it directly
        parsedContent = response.content;
        parsingMethod = 'object_content';
      }
      
      console.log('Content parsed successfully using method:', parsingMethod);
      
      // Handle different response formats
      let flashcards: any[] = [];
      let structureType = 'unknown';
      
      // Try to find flashcards array in the response
      if (Array.isArray(parsedContent)) {
        // Direct array of flashcards
        flashcards = parsedContent;
        structureType = 'direct_array';
      } else if (parsedContent.flashcards && Array.isArray(parsedContent.flashcards)) {
        // Object with flashcards property
        flashcards = parsedContent.flashcards;
        structureType = 'flashcards_property';
      } else if (parsedContent.data && Array.isArray(parsedContent.data)) {
        // Object with data property containing flashcards
        flashcards = parsedContent.data;
        structureType = 'data_property';
      } else if (parsedContent.results && Array.isArray(parsedContent.results)) {
        // Object with results property
        flashcards = parsedContent.results;
        structureType = 'results_property';
      } else {
        // If we didn't find an array structure but have an object, check if it's a single flashcard
        if (parsedContent.front_content && parsedContent.back_content) {
          flashcards = [parsedContent];
          structureType = 'single_flashcard';
        } else {
          console.log('Attempting to extract from object properties, available keys:', Object.keys(parsedContent));
          // Try to create flashcards from object properties
          const extractedCards = Object.entries(parsedContent)
            .filter(([key, value]) => typeof value === 'object' && value !== null)
            .map(([key, value]: [string, any]) => {
              if (value.front_content && value.back_content) {
                return value;
              } else if (value.front && value.back) {
                return {
                  front_content: value.front,
                  back_content: value.back
                };
              } else if (value.question && value.answer) {
                return {
                  front_content: value.question,
                  back_content: value.answer
                };
              }
              return null;
            })
            .filter(Boolean);
            
          if (extractedCards.length > 0) {
            flashcards = extractedCards;
            structureType = 'object_properties';
          } else {
            console.error('Failed to find flashcards in structure:', parsedContent);
            structureType = 'no_structure_found';
          }
        }
      }
      
      console.log('Found flashcard structure:', { 
        type: structureType, 
        rawCount: flashcards.length
      });
      
      // Validate and standardize flashcard format
      const result = flashcards
        .filter((card: any) => card && (
          // Standard format
          (typeof card.front_content === 'string' && typeof card.back_content === 'string') ||
          // Alternative formats
          (typeof card.front === 'string' && typeof card.back === 'string') ||
          (typeof card.question === 'string' && typeof card.answer === 'string')
        ))
        .map((card: any) => ({
          front_content: card.front_content || card.front || card.question || '',
          back_content: card.back_content || card.back || card.answer || ''
        }));
        
      console.log('Filtered flashcards:', { 
        before: flashcards.length,
        after: result.length
      });
      
      return result;
    } catch (error) {
      console.error('Failed to parse flashcard response:', error);
      
      // Create an error flashcard as fallback
      return [{
        front_content: "Error generating flashcards",
        back_content: "The AI service was unable to generate flashcards from your text. Please try again with different text or settings. Error: " + (error instanceof Error ? error.message : String(error))
      }];
    }
  }
  
  /**
   * Fallback method to extract flashcards from text when JSON parsing fails
   */
  private extractFlashcardsFromText(text: string): GeneratedFlashcard[] {
    try {
      const cards: GeneratedFlashcard[] = [];
      
      // Look for numbered flashcards (e.g., "1. Q: What is...? A: It is...")
      const numberedPattern = /\d+\s*[\.\)]\s*(?:Q:|Question:|Front:)?\s*([^\n?]+\??)\s*(?:A:|Answer:|Back:)?\s*([^\n]+)/gi;
      let match: RegExpExecArray | null;
      
      while ((match = numberedPattern.exec(text)) !== null) {
        if (match[1] && match[2]) {
          cards.push({
            front_content: match[1].trim(),
            back_content: match[2].trim()
          });
        }
      }
      
      // If we found numbered flashcards, return them
      if (cards.length > 0) {
        return cards;
      }
      
      // Otherwise, try to find Q/A or Front/Back patterns
      const qaPattern = /(?:Q:|Question:|Front:)\s*([^\n?]+\??)\s*(?:A:|Answer:|Back:)\s*([^\n]+)/gi;
      while ((match = qaPattern.exec(text)) !== null) {
        if (match[1] && match[2]) {
          cards.push({
            front_content: match[1].trim(),
            back_content: match[2].trim()
          });
        }
      }
      
      return cards;
    } catch (error) {
      console.warn('Text extraction fallback failed:', error);
      return [];
    }
  }

  /**
   * Circuit breaker pattern: check if service is available
   */
  private checkServiceAvailability(): void {
    const now = Date.now();
    
    if (this.serviceDisabled && now < this.serviceDisabledUntil) {
      throw new OpenRouterNetworkError('Service temporarily disabled due to repeated failures');
    }
    
    if (this.serviceDisabled && now >= this.serviceDisabledUntil) {
      // Reset service status after cool-down period
      this.serviceDisabled = false;
      this.consecutiveFailures = 0;
    }
  }
  
  /**
   * Track failure for circuit breaker pattern
   */
  private trackFailure(): void {
    this.consecutiveFailures++;
    
    if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
      this.serviceDisabled = true;
      // Disable for 30 seconds
      this.serviceDisabledUntil = Date.now() + 30000;
    }
  }

  /**
   * Sanitize content for security
   */
  private sanitizeContent(content: string): string {
    if (!content) return '';
    
    // Basic sanitization to prevent injection or malicious inputs
    return content
      // Remove potential HTML/script tags
      .replace(/<\/?[^>]+(>|$)/g, '')
      // Limit length
      .slice(0, 32000);
  }

  /**
   * Validate input to prevent potential issues
   */
  private validateInput(input: string | ChatMessage[]): void {
    if (!input) {
      throw new OpenRouterValidationError('Input is required');
    }
    
    if (typeof input === 'string') {
      if (input.length === 0) {
        throw new OpenRouterValidationError('Input string cannot be empty');
      }
      return;
    }
    
    if (!Array.isArray(input) || input.length === 0) {
      throw new OpenRouterValidationError('Messages array cannot be empty');
    }
    
    // Validate each message in the array
    for (const message of input) {
      if (!message || typeof message !== 'object') {
        throw new OpenRouterValidationError('Invalid message format');
      }
      
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        throw new OpenRouterValidationError('Invalid message role');
      }
      
      if (typeof message.content !== 'string' || message.content.length === 0) {
        throw new OpenRouterValidationError('Message content cannot be empty');
      }
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      // Content filtering errors
      if (error.message.includes('content_filter') || 
          error.message.includes('moderation') ||
          error.message.includes('inappropriate')) {
        throw new OpenRouterContentFilterError('Content was flagged by the content filter');
      }
      
      // Authentication errors
      if (error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('authentication') ||
          error.message.includes('auth')) {
        throw new OpenRouterAuthError('Authentication failed');
      }
      
      // Rate limit errors
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        const retryAfter = this.extractRetryAfter(error.message);
        throw new OpenRouterRateLimitError('Rate limit exceeded', retryAfter);
      }
      
      // Network errors
      if (error.message.includes('timeout') || 
          error.message.includes('network') ||
          error.message.includes('abort') ||
          error.message.includes('socket') ||
          error.message.includes('connection')) {
        throw new OpenRouterNetworkError('Network issue occurred');
      }
      
      // Model not available errors
      if (error.message.includes('model') && error.message.includes('not available')) {
        throw new OpenRouterError('Requested model is not available', 'OPENROUTER_MODEL_ERROR');
      }
      
      // Validation errors
      if (error.message.includes('invalid') || 
          error.message.includes('required') ||
          error.message.includes('parameter')) {
        throw new OpenRouterValidationError('Invalid parameters provided');
      }
      
      // Generic error handling
      throw new OpenRouterError(error.message, 'OPENROUTER_ERROR');
    }
    
    // Unknown error type
    throw new OpenRouterError('Unknown error occurred', 'OPENROUTER_ERROR');
  }

  /**
   * Extract retry-after value from error messages
   */
  private extractRetryAfter(errorMessage: string): number | undefined {
    try {
      const match = errorMessage.match(/retry[ -]after:?\s*(\d+)/i);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
      
      // Try to extract retry from parsed JSON
      const jsonMatch = errorMessage.match(/{.*}/);
      if (jsonMatch) {
        const json = JSON.parse(jsonMatch[0]);
        return json.retry_after || json.retryAfter || undefined;
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    data: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<T> {
    const requestUrl = `${this.options.baseUrl}${endpoint}`;
    const timeout = options?.timeout ?? this.options.timeout;
    const maxRetries = options?.retries ?? this.options.retries;
    
    // Add detailed request logging
    console.log('OpenRouter Request:', {
      url: requestUrl,
      endpoint,
      method: 'POST',
      // Log body but redact any sensitive content
      data: {
        ...data,
        messages: data.messages ? 
          `[${(data.messages as any[]).length} messages]` : undefined,
        // Include model info which is helpful for debugging
        model: data.model
      }
    });
    
    let retries = 0;
    
    while (true) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        // Use the API key directly without any modification
        // According to OpenRouter docs: https://openrouter.ai/docs/quickstart
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          // Check if running in browser environment before accessing window/document
          ...( typeof window !== 'undefined' ? {
            'HTTP-Referer': window.location.origin,
            'X-Title': document.title,
          } : {
            // Provide fallback values for server-side rendering
            'HTTP-Referer': 'https://fiszki-app.vercel.app', // Replace with your actual domain
            'X-Title': 'Fiszki - Flashcard Generator', // Replace with your app name
          }),
          // Add version header for tracking
          'X-Application-Version': import.meta.env.APP_VERSION || '1.0.0'
        };
        
        console.log('OpenRouter Headers:', {
          ...headers,
          // Redact API key for security but show first/last few chars for debugging
          'Authorization': this.apiKey ? 
            `Bearer ${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)}` : 
            'Bearer [MISSING]'
        });
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Log response status and headers
        console.log('OpenRouter Response Status:', response.status);
        console.log('OpenRouter Response Headers:', Object.fromEntries([...response.headers.entries()]));
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('OpenRouter Error Response:', errorData);
          
          // Check for rate limiting
          if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after');
            const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined;
            
            // If we have retries left and retry-after header, wait and retry
            if (retries < maxRetries && retryMs) {
              console.log(`OpenRouter Rate Limited, retrying in ${retryMs}ms (retry ${retries + 1}/${maxRetries})`);
              retries++;
              await new Promise(resolve => setTimeout(resolve, retryMs));
              continue;
            }
            
            throw new OpenRouterRateLimitError(
              `Rate limit exceeded: ${JSON.stringify(errorData)}`,
              retryMs ? Math.ceil(retryMs / 1000) : undefined
            );
          }
          
          // Handle specific error status codes
          if (response.status === 401 || response.status === 403) {
            throw new OpenRouterAuthError(`Authentication failed: ${JSON.stringify(errorData)}`);
          }
          
          throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        const responseData = await response.json();
        console.log('OpenRouter Response Data:', {
          id: responseData.id,
          model: responseData.model,
          object: responseData.object,
          // Log response structure but limit content size
          choices: responseData.choices ? 
            responseData.choices.map((c: any) => ({ 
              index: c.index,
              message: c.message ? {
                role: c.message.role,
                content: c.message.content ? 
                  (typeof c.message.content === 'string' ? 
                    `${c.message.content.substring(0, 100)}${c.message.content.length > 100 ? '...' : ''}` : 
                    'non-string content')
                  : null
              } : null,
              finish_reason: c.finish_reason
            })) : 
            null,
          usage: responseData.usage
        });
        
        // Validate that we got a proper response with choices
        if (!responseData.choices || !responseData.choices.length) {
          console.error('OpenRouter returned empty choices array or invalid response structure', responseData);
          
          // If there's an error object in the response, throw it
          if (responseData.error) {
            throw new Error(`API Error: ${responseData.error.message || JSON.stringify(responseData.error)}`);
          }
          
          throw new Error('Invalid response from OpenRouter API: No choices returned');
        }
        
        return responseData as T;
      } catch (error) {
        console.error('OpenRouter Request Failed:', error);
        
        if (error instanceof OpenRouterError) {
          throw error;
        }
        
        retries++;
        if (retries >= maxRetries) {
          return this.handleError(error);
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * 2 ** retries, 10000);
        console.log(`OpenRouter Retrying in ${delay}ms (retry ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
} 