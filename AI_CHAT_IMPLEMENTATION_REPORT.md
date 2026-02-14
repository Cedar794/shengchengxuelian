# AI Chat API Implementation Report

## Summary

Successfully implemented a complete AI chat API backend for the 申城学联 (Shencheng Student Union) platform. The implementation includes support for both regular and streaming responses (Server-Sent Events), integration with Zhipu AI (智谱AI), JWT authentication, and comprehensive chat history storage.

---

## Files Created/Modified

### New Files Created

1. **`/backend/src/services/aiService.js`**
   - AI service module for LLM integration
   - Supports Zhipu AI API (with OpenAI compatibility)
   - Implements fallback mode with pattern-matching responses
   - Handles both regular and streaming responses

2. **`/backend/src/services/chatService.js`**
   - Chat session management service
   - Handles message storage and retrieval
   - Manages AI session lifecycle

3. **`/backend/src/routes/chatApi.js`**
   - Universal chat API endpoints
   - Uses `chats` and `chat_messages` tables
   - Supports both regular and streaming responses

### Modified Files

1. **`/backend/src/routes/ai.js`**
   - Completely rewritten to use new services
   - Added streaming endpoint `/api/ai/chat/stream`
   - Added session management endpoints
   - Added AI status endpoint

2. **`/backend/src/server.js`**
   - Added new chat API routes
   - Updated route configuration

3. **`/backend/src/database/init.js`**
   - Added `chats` table for conversation storage
   - Added `chat_messages` table for message storage
   - Added indexes for better query performance

4. **`/backend/.env`**
   - Added AI configuration variables
   - Includes examples for both Zhipu AI and OpenAI

---

## API Endpoints Implemented

### `/api/ai/*` Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Send message, get AI response |
| POST | `/api/ai/chat/stream` | Send message, get streaming response (SSE) |
| GET | `/api/ai/chat/history` | Get chat history |
| GET | `/api/ai/chat/sessions` | Get all sessions |
| POST | `/api/ai/chat/sessions` | Create new session |
| DELETE | `/api/ai/chat/history` | Clear chat history |
| DELETE | `/api/ai/chat/sessions/:id` | Delete session |
| GET | `/api/ai/status` | Check AI service status |
| GET | `/api/ai/recommendations` | Get recommendations |

### `/api/chat/*` Endpoints (Universal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get response |
| POST | `/api/chat/stream` | Send message, get streaming response (SSE) |
| GET | `/api/chat/conversations` | Get all conversations |
| GET | `/api/chat/conversations/:id` | Get conversation with messages |
| DELETE | `/api/chat/conversations/:id` | Delete conversation |
| DELETE | `/api/chat/conversations/:id/messages` | Clear messages |

---

## Database Schema

### New Tables

```sql
-- Chats table (for AI conversations)
CREATE TABLE chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT,
  model TEXT DEFAULT 'glm-4-flash',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat messages table
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);
```

### Existing Tables Used

- `ai_sessions` - AI chat sessions
- `ai_messages` - AI chat messages

---

## Features Implemented

### 1. Regular Chat (Non-Streaming)
- Send message and receive complete AI response
- Automatic session creation
- Chat history persistence
- Context-aware responses

### 2. Streaming Chat (SSE)
- Server-Sent Events for real-time response streaming
- Proper SSE headers (`Content-Type: text/event-stream`)
- Chunked response delivery
- Complete response saved after stream ends

### 3. Session Management
- Create, list, and delete sessions
- Automatic session creation on first message
- Session context storage
- Message count tracking

### 4. AI Integration
- Zhipu AI (智谱AI) primary support
- OpenAI-compatible API support
- Fallback mode when API key not configured
- Pattern-matching responses for common queries

### 5. Authentication
- JWT token verification
- User isolation (each user sees only their own data)
- Error handling for invalid tokens

---

## Configuration

### Environment Variables

Add to `.env`:

```env
# AI Configuration
AI_PROVIDER=zhipu
AI_API_KEY=your-zhipu-api-key-here
AI_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
AI_MODEL=glm-4-flash
```

### Getting Zhipu AI API Key

1. Visit https://open.bigmodel.cn/
2. Register and verify account
3. Navigate to API Keys section
4. Create new API key
5. Add to `.env` file

---

## Testing

### Test Scripts Created

1. **`/test-chat-api.js`**
   - Tests all API endpoints
   - Covers authentication, messaging, history
   - Runs automatically with `node test-chat-api.js`

2. **`/test-stream-chat.js`**
   - Tests streaming endpoint
   - Demonstrates SSE connection
   - Shows real-time response delivery

### Test Results

All tests passing:
- User registration and authentication
- Message sending and receiving
- Chat history retrieval
- Session management
- Conversation management

---

## Usage Examples

### JavaScript (Fetch)

```javascript
// Regular chat
const response = await fetch('http://localhost:3000/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'What activities are available?'
  })
});

const data = await response.json();
console.log(data.response);
```

### JavaScript (EventSource for Streaming)

```javascript
const eventSource = new EventSource('http://localhost:3000/api/ai/chat/stream', {
  headers: { 'Authorization': `Bearer ${token}` }
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.content) {
    console.log(data.content);
  }
};
```

---

## Dependencies Installed

```bash
npm install axios
```

- `axios` - HTTP client for AI API requests

---

## Next Steps

To enable real AI responses:

1. Get an API key from https://open.bigmodel.cn/
2. Add `AI_API_KEY=your-key-here` to `.env`
3. Restart the server
4. The API will automatically use real AI instead of fallback mode

---

## Error Handling

The API includes comprehensive error handling:

- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (session/conversation not found)
- `500` - Internal Server Error (with details for debugging)

All errors return JSON format:
```json
{
  "error": "Error message",
  "details": "Additional details"
}
```

---

## Documentation

Full API documentation available at:
- `/backend/AI_CHAT_API_DOCUMENTATION.md`
