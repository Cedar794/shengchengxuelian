# AI Chat API Documentation

## Overview

The AI Chat API provides endpoints for AI-powered conversations with support for both regular and streaming responses (Server-Sent Events). The API integrates with Zhipu AI (智谱AI) or other LLM providers, and includes a fallback mode with pattern-matching responses when no API key is configured.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get a token by logging in at `/api/auth/login`.

---

## Endpoints

### 1. Send Chat Message (Regular)

**POST** `/api/ai/chat`

Send a message and receive a complete AI response.

**Request Body:**
```json
{
  "message": "Hello, what activities are available?",
  "sessionId": 1,          // Optional: existing session ID
  "context": {             // Optional: additional context
    "page": "activities"
  }
}
```

**Response:**
```json
{
  "response": "You can check the latest activities...",
  "sessionId": 1,
  "model": "glm-4-flash",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 50
  }
}
```

---

### 2. Send Chat Message (Streaming)

**POST** `/api/ai/chat/stream`

Send a message and receive streaming AI responses via Server-Sent Events (SSE).

**Request Body:** Same as regular chat endpoint.

**Response:** Server-Sent Events stream

```
data: {"type":"session","sessionId":1}

data: {"content":"You","done":false}

data: {"content":" can","done":false}

data: {"content":" check","done":false}

data: [DONE]
```

---

### 3. Get Chat History

**GET** `/api/ai/chat/history`

Retrieve message history for a session.

**Query Parameters:**
- `sessionId` (optional): Specific session ID
- `limit` (optional, default: 50): Maximum number of messages

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "session_id": 1,
      "role": "user",
      "content": "Hello",
      "created_at": "2026-02-12 10:00:00"
    },
    {
      "id": 2,
      "session_id": 1,
      "role": "assistant",
      "content": "Hi there!",
      "created_at": "2026-02-12 10:00:01"
    }
  ]
}
```

---

### 4. Get All Sessions

**GET** `/api/ai/chat/sessions`

Get all chat sessions for the current user.

**Response:**
```json
{
  "sessions": [
    {
      "id": 1,
      "user_id": 1,
      "context": null,
      "message_count": 10,
      "created_at": "2026-02-12 10:00:00",
      "updated_at": "2026-02-12 11:00:00"
    }
  ]
}
```

---

### 5. Create New Session

**POST** `/api/ai/chat/sessions`

Create a new chat session.

**Request Body:**
```json
{
  "context": {
    "page": "help"
  }
}
```

**Response:**
```json
{
  "session": {
    "id": 2,
    "user_id": 1,
    "context": "{\"page\":\"help\"}",
    "message_count": 0,
    "created_at": "2026-02-12 12:00:00"
  }
}
```

---

### 6. Clear Chat History

**DELETE** `/api/ai/chat/history`

Clear all messages in a session.

**Query Parameters:**
- `sessionId` (optional): Specific session ID, otherwise uses default

**Response:**
```json
{
  "message": "Chat history cleared"
}
```

---

### 7. Delete Session

**DELETE** `/api/ai/chat/sessions/:sessionId`

Delete a chat session and all its messages.

**Response:**
```json
{
  "message": "Session deleted"
}
```

---

### 8. Get AI Service Status

**GET** `/api/ai/status`

Check if the AI service is configured and which provider is being used.

**Response:**
```json
{
  "configured": true,
  "provider": "zhipu",
  "model": "glm-4-flash"
}
```

---

### 9. Get Recommendations

**GET** `/api/ai/recommendations`

Get personalized recommendations based on user profile.

**Query Parameters:**
- `type` (optional): Filter by type - `activities`, `groups`, `projects`

**Response:**
```json
{
  "recommendations": [
    {
      "id": 1,
      "title": "Activity Title",
      "type": "activity"
    }
  ]
}
```

---

### 10. Universal Chat Endpoint

**POST** `/api/chat`

Main chat endpoint using the `chats` table for conversation storage.

**Request Body:**
```json
{
  "message": "Tell me about the platform",
  "conversation_id": 1,    // Optional: existing conversation
  "stream": false          // Optional: enable streaming
}
```

**Response:**
```json
{
  "id": 1,
  "message": "AI response here...",
  "role": "assistant",
  "created_at": "2026-02-12T10:00:00.000Z"
}
```

---

### 11. Streaming Chat Endpoint

**POST** `/api/chat/stream`

Streaming version of the universal chat endpoint.

**Request Body:** Same as `/api/chat`

**Response:** Server-Sent Events stream

---

### 12. Get Conversations

**GET** `/api/chat/conversations`

Get all conversations for the current user.

**Response:**
```json
{
  "conversations": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Tell me about the platform...",
      "model": "glm-4-flash",
      "created_at": "2026-02-12 10:00:00",
      "updated_at": "2026-02-12 11:00:00",
      "last_message": "Last message content..."
    }
  ]
}
```

---

### 13. Get Conversation Details

**GET** `/api/chat/conversations/:id`

Get a specific conversation with all messages.

**Response:**
```json
{
  "conversation": {
    "id": 1,
    "user_id": 1,
    "title": "Conversation title",
    "model": "glm-4-flash",
    "created_at": "2026-02-12 10:00:00"
  },
  "messages": [
    {
      "id": 1,
      "chat_id": 1,
      "role": "user",
      "content": "Hello",
      "created_at": "2026-02-12 10:00:00"
    }
  ]
}
```

---

### 14. Delete Conversation

**DELETE** `/api/chat/conversations/:id`

Delete a conversation and all its messages.

**Response:**
```json
{
  "message": "Conversation deleted"
}
```

---

### 15. Clear Conversation Messages

**DELETE** `/api/chat/conversations/:id/messages`

Clear all messages in a conversation while keeping the conversation.

**Response:**
```json
{
  "message": "Messages cleared"
}
```

---

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# AI Configuration
AI_PROVIDER=zhipu
AI_API_KEY=your-zhipu-api-key-here
AI_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
AI_MODEL=glm-4-flash

# For OpenAI compatible APIs:
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-api-key
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-3.5-turbo
```

### Getting a Zhipu AI API Key

1. Visit https://open.bigmodel.cn/
2. Register and log in
3. Go to API Keys section
4. Create a new API key
5. Add it to your `.env` file

---

## Fallback Mode

When no API key is configured, the API uses a pattern-matching fallback system that responds to common queries about:
- Activities (活动)
- Venue reservations (预约)
- Second-hand trading (二手)
- Part-time jobs (兼职)
- Communities (社群)
- Projects (项目)
- Materials (资料)

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found (session/conversation not found)
- `500` - Internal Server Error

---

## Database Schema

### `chats` table
```sql
CREATE TABLE chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT,
  model TEXT DEFAULT 'glm-4-flash',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### `chat_messages` table
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);
```

### `ai_sessions` table
```sql
CREATE TABLE ai_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  context TEXT,
  message_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### `ai_messages` table
```sql
CREATE TABLE ai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES ai_sessions(id)
);
```
