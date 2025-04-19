# REST API Plan

## 1. Resources
- **Users** - Managed by Supabase Auth
- **Source Texts** - Text sources for flashcard generation (maps to `source_texts` table)
- **Flashcards** - Learning cards created from source texts or manually (maps to `flashcards` table)

## 2. Endpoints

### 2.1 Source Texts

#### Create a new source text
- **Method**: POST
- **Path**: `/api/source-texts`
- **Description**: Creates a new source text
- **Request Body**:
  ```json
  {
    "content": "string (1000-10000 characters)"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "content": "string",
    "created_at": "timestamp"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 
  - 400 Bad Request (validation errors)
  - 401 Unauthorized

#### Get all source texts
- **Method**: GET
- **Path**: `/api/source-texts`
- **Description**: Retrieves all source texts for the authenticated user
- **Query Parameters**:
  - `limit`: Maximum number of items to return (default: 10)
  - `offset`: Number of items to skip (default: 0)
  - `sort`: Field to sort by (default: created_at)
  - `order`: Sort order, 'asc' or 'desc' (default: desc)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "content": "string",
        "created_at": "timestamp"
      }
    ],
    "pagination": {
      "total": "number",
      "limit": "number",
      "offset": "number"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized

#### Get a source text
- **Method**: GET
- **Path**: `/api/source-texts/{id}`
- **Description**: Retrieves a specific source text
- **Response**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "content": "string",
    "created_at": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized
  - 404 Not Found

#### Update a source text
- **Method**: PUT
- **Path**: `/api/source-texts/{id}`
- **Description**: Updates a specific source text
- **Request Body**:
  ```json
  {
    "content": "string (1000-10000 characters)"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "content": "string",
    "created_at": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 400 Bad Request (validation errors)
  - 401 Unauthorized
  - 404 Not Found

#### Delete a source text
- **Method**: DELETE
- **Path**: `/api/source-texts/{id}`
- **Description**: Deletes a specific source text
- **Response**: No content
- **Success Codes**: 204 No Content
- **Error Codes**: 
  - 401 Unauthorized
  - 404 Not Found

#### Generate flashcards from a source text
- **Method**: POST
- **Path**: `/api/source-texts/{id}/generate-flashcards`
- **Description**: Generates AI flashcards from a source text
- **Request Body**:
  ```json
  {
    "count": "number (optional, default: 5)"
  }
  ```
- **Response**:
  ```json
  {
    "flashcards": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "source_text_id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "creation_type": "ai_generated",
        "accepted": false,
        "generation_time_ms": "number",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "generation_stats": {
      "requested_count": "number",
      "generated_count": "number",
      "total_time_ms": "number"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized
  - 404 Not Found
  - 422 Unprocessable Entity (AI generation failed)
  - 503 Service Unavailable (AI service unavailable)

### 2.2 Flashcards

#### Create a new flashcard
- **Method**: POST
- **Path**: `/api/flashcards`
- **Description**: Creates a new flashcard manually
- **Request Body**:
  ```json
  {
    "front_content": "string (non-empty)",
    "back_content": "string (non-empty)",
    "source_text_id": "uuid (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "source_text_id": "uuid or null",
    "front_content": "string",
    "back_content": "string",
    "creation_type": "manual",
    "accepted": true,
    "generation_time_ms": null,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 
  - 400 Bad Request (validation errors)
  - 401 Unauthorized

#### Get all flashcards
- **Method**: GET
- **Path**: `/api/flashcards`
- **Description**: Retrieves all flashcards for the authenticated user
- **Query Parameters**:
  - `limit`: Maximum number of items to return (default: 10)
  - `offset`: Number of items to skip (default: 0)
  - `sort`: Field to sort by (default: created_at)
  - `order`: Sort order, 'asc' or 'desc' (default: desc)
  - `source_text_id`: Filter by source text ID (optional)
  - `creation_type`: Filter by creation type (optional)
  - `accepted`: Filter by acceptance status (optional)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "source_text_id": "uuid or null",
        "front_content": "string",
        "back_content": "string",
        "creation_type": "string",
        "accepted": "boolean",
        "generation_time_ms": "number or null",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "total": "number",
      "limit": "number",
      "offset": "number"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized

#### Get flashcards for learning
- **Method**: GET
- **Path**: `/api/flashcards/learning`
- **Description**: Retrieves flashcards in random order for learning
- **Query Parameters**:
  - `limit`: Maximum number of items to return (default: 10)
  - `source_text_id`: Filter by source text ID (optional)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "source_text_id": "uuid or null",
        "front_content": "string",
        "back_content": "string",
        "creation_type": "string",
        "accepted": true,
        "generation_time_ms": "number or null",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "total": "number"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized

#### Get a flashcard
- **Method**: GET
- **Path**: `/api/flashcards/{id}`
- **Description**: Retrieves a specific flashcard
- **Response**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "source_text_id": "uuid or null",
    "front_content": "string",
    "back_content": "string",
    "creation_type": "string",
    "accepted": "boolean",
    "generation_time_ms": "number or null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized
  - 404 Not Found

#### Update a flashcard
- **Method**: PUT
- **Path**: `/api/flashcards/{id}`
- **Description**: Updates a specific flashcard
- **Request Body**:
  ```json
  {
    "front_content": "string (non-empty, optional)",
    "back_content": "string (non-empty, optional)",
    "accepted": "boolean (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "source_text_id": "uuid or null",
    "front_content": "string",
    "back_content": "string",
    "creation_type": "string",
    "accepted": "boolean",
    "generation_time_ms": "number or null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 400 Bad Request (validation errors)
  - 401 Unauthorized
  - 404 Not Found

#### Delete a flashcard
- **Method**: DELETE
- **Path**: `/api/flashcards/{id}`
- **Description**: Deletes a specific flashcard
- **Response**: No content
- **Success Codes**: 204 No Content
- **Error Codes**: 
  - 401 Unauthorized
  - 404 Not Found

#### Regenerate a flashcard
- **Method**: POST
- **Path**: `/api/flashcards/{id}/regenerate`
- **Description**: Regenerates an existing flashcard using AI
- **Response**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "source_text_id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "creation_type": "ai_generated",
    "accepted": false,
    "generation_time_ms": "number",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized
  - 404 Not Found
  - 422 Unprocessable Entity (AI generation failed)
  - 503 Service Unavailable (AI service unavailable)

## 3. Authentication and Authorization

### Authentication
- Supabase Auth will be used for authentication
- JWT tokens will be used to authenticate API requests
- Each request must include the JWT token in the `Authorization` header:
  ```
  Authorization: Bearer {jwt_token}
  ```

### Authorization
- Row Level Security (RLS) in Supabase will ensure users can only access their own data
- The API will enforce the same authorization rules before processing requests
- All resources are private to the user who created them

## 4. Validation and Business Logic

### Source Texts
- **Validation**:
  - Content must be between 1000 and 10000 characters
  - User must be authenticated
- **Business Logic**:
  - Source texts are tied to a single user
  - Source texts can have multiple associated flashcards
  - Deleting a source text doesn't delete associated flashcards (they will have source_text_id set to NULL)

### Flashcards
- **Validation**:
  - Front content must not be empty
  - Back content must not be empty
  - If creation_type is 'ai_generated' or 'ai_edited', source_text_id and generation_time_ms must be provided
  - If creation_type is 'manual', generation_time_ms must be NULL
  - User must be authenticated
- **Business Logic**:
  - Flashcards are tied to a single user
  - AI-generated flashcards are initially set as not accepted (accepted = false)
  - Manually created flashcards are automatically accepted (accepted = true)
  - AI regeneration is only available for flashcards with a valid source_text_id
  - Flashcards in learning mode are randomly ordered and only include accepted flashcards

### AI Generation
- **Validation**:
  - Source text must exist and belong to the requesting user
  - User must be authenticated
- **Business Logic**:
  - AI generation should produce at least 5 flashcards per source text
  - AI generation should complete within 30 seconds
  - Generation time is tracked and stored for performance monitoring
  - AI regeneration should produce a new flashcard distinct from the one being replaced
