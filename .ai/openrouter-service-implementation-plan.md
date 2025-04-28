# OpenRouter Service Implementation Plan

## 1. Service Description

The OpenRouter service will provide a TypeScript interface for interacting with the OpenRouter.ai API, enabling the application to leverage various LLM models for AI-driven features. This service will handle all aspects of communication with the API, including request formatting, response parsing, error handling, and configuration management.

## 2. Constructor

```typescript
export class OpenRouterService {
  constructor(
    private readonly apiKey: string = import.meta.env.OPENROUTER_API_KEY,
    private options: OpenRouterOptions = DEFAULT_OPTIONS
  ) {
    // Validate API key
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is required');
    }
  }
}
```

Where `OpenRouterOptions` is defined as:

```typescript
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

const DEFAULT_OPTIONS: OpenRouterOptions = {
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
```

## 3. Public Methods and Properties

### Configuration Methods

```typescript
public setDefaultModel(model: string): void
public setDefaultParameters(params: Partial<OpenRouterOptions['defaultParams']>): void
public setTimeout(timeoutMs: number): void
public setRetries(count: number): void
```

### Core Functionality

```typescript
public async chat(
  input: string | ChatMessage[],
  options?: ChatOptions
): Promise<ChatResponse>

public async generateFlashcards(
  text: string,
  count: number = 5,
  options?: FlashcardGenerationOptions
): Promise<GeneratedFlashcard[]>

public async createJsonSchema<T>(
  name: string,
  schema: Record<string, unknown>
): ResponseFormat
```

Where the types are defined as:

```typescript
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
```

## 4. Private Methods and Properties

```typescript
private async makeRequest<T>(
  endpoint: string,
  data: Record<string, unknown>,
  options?: RequestOptions
): Promise<T>

private formatMessages(
  input: string | ChatMessage[],
  systemMessage?: string
): ChatMessage[]

private handleError(error: unknown): never

private buildRequestBody(
  messages: ChatMessage[],
  options?: ChatOptions
): Record<string, unknown>

private createFlashcardPrompt(
  text: string,
  count: number,
  customPrompt?: string
): string

private parseFlashcardResponse(
  response: ChatResponse
): GeneratedFlashcard[]
```

## 5. Error Handling

The service will implement comprehensive error handling for the following scenarios:

1. **Authentication Errors**:
   - Handle invalid or expired API keys
   - Implement automatic key validation at service initialization

2. **Rate Limiting and Quota Management**:
   - Detect rate limit errors from API responses
   - Implement exponential backoff strategy
   - Provide clear error messages about quota exhaustion

3. **Network Errors**:
   - Implement retry mechanism for transient network issues
   - Set appropriate timeouts for requests
   - Provide detailed error information for debugging

4. **Validation Errors**:
   - Validate input parameters before making API requests
   - Handle malformed JSON responses
   - Provide helpful error messages for invalid inputs

5. **Content Moderation**:
   - Handle content filtering rejections from the API
   - Provide alternative suggestion prompts when content is flagged

6. **Service Availability**:
   - Detect and handle service outages
   - Implement circuit breaker pattern for repeated failures

All errors will follow the pattern established in the existing codebase, with prefix identifiers for error types:

```typescript
throw new Error(`OPENROUTER_AUTH_ERROR: ${detailedMessage}`);
throw new Error(`OPENROUTER_RATE_LIMIT: ${detailedMessage}`);
throw new Error(`OPENROUTER_NETWORK_ERROR: ${detailedMessage}`);
```

## 6. Security Considerations

1. **API Key Management**:
   - Store API key in environment variables, never in code
   - Validate presence of API key at service initialization
   - Consider implementing API key rotation capabilities

2. **Content Validation**:
   - Sanitize all user inputs before sending to API
   - Implement content filtering for sensitive information
   - Log potential security issues without exposing sensitive data

3. **Rate Limiting**:
   - Implement client-side rate limiting to prevent abuse
   - Add monitoring for unusual usage patterns

4. **Response Handling**:
   - Validate and sanitize all API responses
   - Handle unexpected response formats gracefully
   - Prevent injection attacks from model outputs

## 7. Implementation Plan

### Step 1: Create Service File Structure

Create the following files:

```
src/lib/services/openrouter.service.ts
src/lib/services/openrouter.types.ts
```

### Step 2: Define Types

In `openrouter.types.ts`, define all the interfaces and types needed for the service.

### Step 3: Implement the Service Base

1. Create the `OpenRouterService` class with constructor and configuration methods
2. Implement the private utility methods for request handling and error management
3. Add basic error handling and logging

### Step 4: Implement Core Functionality

1. Implement the `chat` method for basic LLM interaction
2. Add support for system messages, user messages, and response formats
3. Implement model parameters and configuration options

### Step 5: Implement Flashcard Generation

1. Create specialized methods for flashcard generation
2. Implement the JSON schema response format for structured flashcard data
3. Integrate with existing flashcard services

### Step 6: Implement Error Handling

1. Add comprehensive error handling for all API interactions
2. Implement retry mechanisms and circuit breakers
3. Create user-friendly error messages

## Example Implementation for Flashcard Generation

Here's a concrete example of how the final implementation would look for generating flashcards:

```typescript
import { OpenRouterService } from '../lib/services/openrouter.service';

// Initialize the service
const openRouterService = new OpenRouterService();

// Define a JSON schema for flashcard responses
const flashcardSchema = openRouterService.createJsonSchema('flashcards', {
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
        required: ['front_content', 'back_content']
      }
    }
  },
  required: ['flashcards']
});

// Generate flashcards from text
try {
  const flashcards = await openRouterService.generateFlashcards(
    'Text content to generate flashcards from...',
    5,
    {
      model: 'anthropic/claude-3-haiku',
      responseFormat: flashcardSchema,
      temperature: 0.3
    }
  );
  
  console.log(`Generated ${flashcards.length} flashcards`);
} catch (error) {
  console.error('Failed to generate flashcards:', error);
}
```

This implementation plan provides a comprehensive roadmap for creating the OpenRouter service while maintaining consistency with the existing codebase architecture and coding practices. 