/**
 * Test script for AI Chat API
 * Tests both /api/chat and /api/ai endpoints
 */

const http = require('http');

// Test configuration
const API_BASE = 'http://localhost:3000';
const TEST_USER = {
  student_id: 'test_user_' + Date.now(),
  password: 'test123',
  nickname: '测试用户',
  school: '上海海关学院',
  major: '计算机',
  grade: '大一'
};

let authToken = '';
let sessionId = '';

// Helper function to make HTTP requests
function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, rawBody: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test steps
async function runTests() {
  console.log('=== AI Chat API Test Suite ===\n');

  // Test 1: Register and Login
  console.log('Test 1: Registering user...');
  const registerResult = await request('POST', '/api/auth/register', TEST_USER);
  console.log('Register status:', registerResult.status);

  console.log('\nTest 2: Logging in...');
  const loginResult = await request('POST', '/api/auth/login', {
    student_id: TEST_USER.student_id,
    password: TEST_USER.password
  });
  console.log('Login status:', loginResult.status);

  if (loginResult.data && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log('Auth token obtained');
  } else {
    console.error('Failed to get auth token');
    return;
  }

  const authHeaders = { 'Authorization': `Bearer ${authToken}` };

  // Test 3: Check AI status
  console.log('\nTest 3: Checking AI service status...');
  const statusResult = await request('GET', '/api/ai/status', null, authHeaders);
  console.log('AI Status:', statusResult.data);

  // Test 4: Send chat message via /api/ai/chat
  console.log('\nTest 4: Sending message via /api/ai/chat...');
  const chatResult = await request('POST', '/api/ai/chat', {
    message: '你好，请问有什么活动可以参加？'
  }, authHeaders);
  console.log('Chat response:', chatResult.status);
  console.log('Response:', chatResult.data ? chatResult.data.response?.substring(0, 100) + '...' : 'No data');

  if (chatResult.data && chatResult.data.sessionId) {
    sessionId = chatResult.data.sessionId;
    console.log('Session ID:', sessionId);
  }

  // Test 5: Get chat history
  console.log('\nTest 5: Getting chat history...');
  const historyResult = await request('GET', '/api/ai/chat/history', null, authHeaders);
  console.log('History count:', historyResult.data?.messages?.length || 0);

  // Test 6: Create new chat session
  console.log('\nTest 6: Creating new session...');
  const newSessionResult = await request('POST', '/api/ai/chat/sessions', {
    context: { page: 'help' }
  }, authHeaders);
  console.log('New session:', newSessionResult.status);

  // Test 7: Get all sessions
  console.log('\nTest 7: Getting all sessions...');
  const sessionsResult = await request('GET', '/api/ai/chat/sessions', null, authHeaders);
  console.log('Sessions count:', sessionsResult.data?.sessions?.length || 0);

  // Test 8: Send message via /api/chat (new endpoint)
  console.log('\nTest 8: Sending message via /api/chat...');
  const chatApiResult = await request('POST', '/api/chat', {
    message: '我想了解一下二手交易'
  }, authHeaders);
  console.log('Chat API response:', chatApiResult.status);
  console.log('Response:', chatApiResult.data?.message?.substring(0, 100) + '...' || 'No data');

  // Test 9: Get conversations
  console.log('\nTest 9: Getting conversations...');
  const conversationsResult = await request('GET', '/api/chat/conversations', null, authHeaders);
  console.log('Conversations count:', conversationsResult.data?.conversations?.length || 0);

  // Test 10: Get recommendations
  console.log('\nTest 10: Getting recommendations...');
  const recResult = await request('GET', '/api/ai/recommendations', null, authHeaders);
  console.log('Recommendations count:', recResult.data?.recommendations?.length || 0);

  console.log('\n=== Tests Complete ===');
}

// Run tests
runTests().catch(console.error);
