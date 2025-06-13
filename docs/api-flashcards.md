# Flashcards API Documentation

## Overview

The Flashcards API allows authenticated users to manually create, manage, and organize flashcards for learning purposes. This API is part of the Fiszki AI application and provides RESTful endpoints for flashcard operations.

## Authentication

All flashcard endpoints require Supabase authentication. Users must have a valid session token to access these endpoints.

## Endpoints

### POST /api/flashcards

Creates a new flashcard manually by the authenticated user.

#### Description

This endpoint allows authenticated users to create flashcards manually. Flashcards can be created as standalone items or linked to a specific source text. All manually created flashcards have `creation_type: 'manual'` and are automatically accepted (`accepted: true`).

#### Request

**Method:** `POST`  
**URL:** `/api/flashcards`  
**Content-Type:** `application/json`  
**Authentication:** Required (Supabase session)

#### Request Body

```json
{
  "front_content": "string (1-2000 characters, required)",
  "back_content": "string (1-2000 characters, required)",
  "source_text_id": "uuid (optional)"
}
```

**Fields:**

- `front_content` - The content displayed on the front of the flashcard (required, 1-2000 characters)
- `back_content` - The content displayed on the back of the flashcard (required, 1-2000 characters)
- `source_text_id` - Optional UUID of a source text to link this flashcard to

#### Responses

##### Success (201 Created)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "source_text_id": "uuid | null",
  "front_content": "string",
  "back_content": "string",
  "creation_type": "manual",
  "accepted": true,
  "generation_time_ms": null,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

##### Error Responses

**400 Bad Request - Validation Error**

```json
{
  "message": "Validation error",
  "code": "VALIDATION_ERROR",
  "details": {
    "front_content": {
      "_errors": ["Front content is required and cannot be empty"]
    }
  }
}
```

**401 Unauthorized**

```json
{
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**404 Not Found - Source Text Not Found**

```json
{
  "message": "Source text not found",
  "code": "NOT_FOUND"
}
```

**500 Internal Server Error**

```json
{
  "message": "Internal server error",
  "code": "INTERNAL_SERVER_ERROR"
}
```

#### Examples

##### Create Standalone Flashcard

```javascript
const response = await fetch("/api/flashcards", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    front_content: "What is React?",
    back_content: "A JavaScript library for building user interfaces",
  }),
});

const flashcard = await response.json();
```

##### Create Flashcard Linked to Source Text

```javascript
const response = await fetch("/api/flashcards", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    front_content: "What is React?",
    back_content: "A JavaScript library for building user interfaces",
    source_text_id: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

const flashcard = await response.json();
```

## Business Rules

### Flashcard Creation

1. **Authentication Required**: All requests must include valid Supabase authentication
2. **User Isolation**: Users can only create flashcards for themselves
3. **Content Validation**: Both front and back content must be between 1-2000 characters
4. **Source Text Validation**: If `source_text_id` is provided, it must exist and belong to the authenticated user
5. **Automatic Acceptance**: Manually created flashcards are automatically set as accepted
6. **Creation Type**: All manually created flashcards have `creation_type: 'manual'`
7. **Generation Time**: Manual flashcards have `generation_time_ms: null`

### Data Integrity

- UUID validation for `source_text_id` parameter
- Row Level Security (RLS) ensures data isolation between users
- Database constraints prevent invalid data insertion

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting in production environments to prevent abuse.

## Error Handling

The API uses structured error responses with standardized error codes:

- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required or invalid
- `NOT_FOUND` - Requested resource not found
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_SERVER_ERROR` - Unexpected server error

All errors include descriptive messages and appropriate HTTP status codes.

## Performance Considerations

- Database queries are optimized with proper indexing on `user_id` and `source_text_id`
- Request timing is logged for monitoring and optimization
- Supabase connection pooling is utilized for database efficiency

## Security

- Row Level Security (RLS) enforces user data isolation
- Input validation prevents malicious data injection
- Source text ownership verification prevents unauthorized access
- Structured error responses avoid information leakage
