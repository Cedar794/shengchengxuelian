/**
 * Test script for Streaming Chat API (SSE)
 */

const http = require('http');

// Test configuration
const API_BASE = 'http://localhost:3000';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcwODcxNzQyLCJleHAiOjE3NzE0NzY1NDJ9.EboSrpLvNrFGJKeMXrblbDiyFSHMMWL-404Zo2H9A9o'; // Admin token

// Helper function to connect to SSE endpoint
function connectSSE(path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const postData = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': headers.Authorization || `Bearer ${AUTH_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);

      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          reject(new Error(`Server returned ${res.statusCode}: ${body}`));
        });
        return;
      }

      resolve(res);
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Test streaming response
async function testStreamChat() {
  console.log('=== Streaming Chat Test ===\n');

  try {
    console.log('Connecting to /api/ai/chat/stream...');
    const stream = await connectSSE('/api/ai/chat/stream', {
      message: '你好，请介绍一下申城学联平台的功能'
    });

    let buffer = '';
    let fullResponse = '';
    let sessionId = null;

    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            console.log('\n[Stream Complete]');
            stream.destroy();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'session') {
              sessionId = parsed.sessionId;
              console.log('Session ID:', sessionId);
            } else if (parsed.content) {
              process.stdout.write(parsed.content);
              fullResponse += parsed.content;
            } else if (parsed.error) {
              console.log('\nError:', parsed.error);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    });

    stream.on('end', () => {
      console.log('\n\n=== Stream Ended ===');
      console.log('Full response length:', fullResponse.length);
      console.log('Session ID:', sessionId);
    });

    stream.on('error', (err) => {
      console.error('\nStream error:', err.message);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      stream.destroy();
      console.log('\n[Timeout - Stream closed]');
    }, 10000);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run test
testStreamChat();
