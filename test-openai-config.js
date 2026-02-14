// Test script to verify OpenAI configuration
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, 'backend/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...rest] = line.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim().replace(/['"]/g, '');
      }
    }
  });
}

const aiService = require('./backend/src/services/aiService');

console.log('=== OpenAI Configuration Test ===');
console.log('AI_PROVIDER:', process.env.AI_PROVIDER);
console.log('AI_API_URL:', process.env.AI_API_URL);
console.log('AI_MODEL:', process.env.AI_MODEL);
console.log('AI_API_KEY configured:', aiService.isConfigured());
console.log('API Key present:', !!process.env.AI_API_KEY);
console.log('\n');

// Test if the service responds with fallback (no actual API call)
console.log('=== Testing AI Service Response ===');
aiService.generateResponse([{ role: 'user', content: 'Hello' }])
  .then(response => {
    console.log('✅ AI Service responded successfully');
    console.log('Response content:', response.content.substring(0, 100) + '...');
    console.log('Model used:', response.model);
    console.log('Usage:', response.usage);
  })
  .catch(error => {
    console.error('❌ AI Service error:', error.message);
  });