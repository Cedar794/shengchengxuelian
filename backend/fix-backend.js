const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = ['activities.js', 'listings.js', 'materials.js', 'orders.js', 'groups.js', 'projects.js', 'chat.js', 'ai.js'];

console.log('开始修复 async/await 问题...\n');

files.forEach(filename => {
  const filePath = path.join(routesDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // 统计修复前的状态
  const asyncBefore = (content.match(/async \(/g) || []).length;
  const awaitBefore = (content.match(/await db\./g) || []).length;

  // 1. 替换路由处理函数，添加 async 关键字
  // router.get('/', optionalAuth, (req, res) => {
  const patterns = [
    [/router\.get\('\/', optionalAuth, \(req, res\) => \{/g, "router.get('/', optionalAuth, async (req, res) => {"],
    [/router\.get\('\/:id', optionalAuth, \(req, res\) => \{/g, "router.get('/:id', optionalAuth, async (req, res) => {"],
    [/router\.get\('\/recommended', auth, \(req, res\) => \{/g, "router.get('/recommended', auth, async (req, res) => {"],
    [/router\.post\('\/', auth, \[/g, "router.post('/', auth, async (req, res) => {"],
    [/router\.post\('\/:id\/register', auth, \(req, res\) => \{/g, "router.post('/:id/register', auth, async (req, res) => {"],
    [/router\.delete\('\/:id\/register', auth, \(req, res\) => \{/g, "router.delete('/:id/register', auth, async (req, res) => {"],
    [/router\.post\('\/:id\/join', auth, \(req, res\) => \{/g, "router.post('/:id/join', auth, async (req, res) => {"],
    [/router\.delete\('\/:id\/leave', auth, \(req, res\) => \{/g, "router.delete('/:id/leave', auth, async (req, res) => {"],
    [/router\.post\('\/:id\/posts', auth, \[/g, "router.post('/:id/posts', auth, async (req, res) => {"],
    [/router\.get\('\/:id', (req, res\) => \{/g, "router.get('/:id', async (req, res) => {"],
    [/router\.post\('\/', auth, \(req, res\) => \{/g, "router.post('/', auth, async (req, res) => {"],
    [/router\.put\('\/:id', auth, \(req, res\) => \{/g, "router.put('/:id', auth, async (req, res) => {"],
    [/router\.delete\('\/:id', auth, \(req, res\) => \{/g, "router.delete('/:id', auth, async (req, res) => {"],
    [/router\.get\('\/my\/listings', auth, \(req, res\) => \{/g, "router.get('/my/listings', auth, async (req, res) => {"],
    [/router\.post\('\/:id\/apply', auth, \[/g, "router.post('/:id/apply', auth, async (req, res) => {"],
    [/router\.post\('\/random-match', auth, \(req, res\) => \{/g, "router.post('/random-match', auth, async (req, res) => {"],
    [/router\.get\('\/sessions\/:sessionId\/messages', auth, \(req, res\) => \{/g, "router.get('/sessions/:sessionId/messages', auth, async (req, res) => {"],
    [/router\.post\('\/sessions\/:sessionId\/messages', auth, \(req, res\) => \{/g, "router.post('/sessions/:sessionId/messages', auth, async (req, res) => {"],
    [/router\.post\('\/sessions\/:sessionId\/exchange-contact', auth, \(req, res\) => \{/g, "router.post('/sessions/:sessionId/exchange-contact', auth, async (req, res) => {"],
    [/router\.post\('\/sessions\/:sessionId\/end', auth, \(req, res\) => \{/g, "router.post('/sessions/:sessionId/end', auth, async (req, res) => {"],
    [/router\.get\('\/sessions\/my', auth, \(req, res\) => \{/g, "router.get('/sessions/my', auth, async (req, res) => {"],
    [/router\.post\('\/chat', auth, \(req, res\) => \{/g, "router.post('/chat', auth, async (req, res) => {"],
    [/router\.get\('\/chat\/history', auth, \(req, res\) => \{/g, "router.get('/chat/history', auth, async (req, res) => {"],
    [/router\.delete\('\/chat\/history', auth, \(req, res\) => \{/g, "router.delete('/chat/history', auth, async (req, res) => {"],
    [/router\.get\('\/recommendations', auth, \(req, res\) => \{/g, "router.get('/recommendations', auth, async (req, res) => {"],
    [/router\.get\('\/my\/projects', auth, \(req, res\) => \{/g, "router.get('/my/projects', auth, async (req, res) => {"],
    [/router\.get\('\/my\/orders', auth, \(req, res\) => \{/g, "router.get('/my/orders', auth, async (req, res) => {"],
    [/router\.get\('\/my\/tasks', auth, \(req, res\) => \{/g, "router.get('/my/tasks', auth, async (req, res) => {"],
    [/router\.post\('\/:id\/tasks', auth, \[/g, "router.post('/:id/tasks', auth, async (req, res) => {"],
    [/router\.put\('\/:collaborationId\/tasks\/:taskId', auth, \(req, res\) => \{/g, "router.put('/:collaborationId/tasks/:taskId', auth, async (req, res) => {"],
    [/router\.post\('\/:id\/download', auth, \(req, res\) => \{/g, "router.post('/:id/download', auth, async (req, res) => {"],
    [/router\.get\('\/:id\/availability', (req, res\) => \{/g, "router.get('/:id/availability', async (req, res) => {"],
    [/router\.post\('\/reservations', auth, \[/g, "router.post('/reservations', auth, async (req, res) => {"],
    [/router\.get\('\/reservations\/my', auth, \(req, res\) => \{/g, "router.get('/reservations/my', auth, async (req, res) => {"],
    [/router\.delete\('\/reservations\/:id', auth, \(req, res\) => \{/g, "router.delete('/reservations/:id', auth, async (req, res) => {"],
    [/router\.post\('\/:projectId\/applications\/:applicationId\/accept', auth, \(req, res\) => \{/g, "router.post('/:projectId/applications/:applicationId/accept', auth, async (req, res) => {"],
    [/router\.post\('\/:projectId\/applications\/:applicationId\/reject', auth, \(req, res\) => \{/g, "router.post('/:projectId/applications/:applicationId/reject', auth, async (req, res) => {"],
    [/router\.get\('\/recommended\/list', auth, \(req, res\) => \{/g, "router.get('/recommended/list', auth, async (req, res) => {"],
    [/router\.get\('\/my', auth, \(req, res\) => \{/g, "router.get('/my', auth, async (req, res) => {"],
    [/router\.delete\('\/:id', auth, \(req, res\) => \{/g, "router.delete('/:id', auth, async (req, res) => {"],
    [/router\.put\('\/:id\/status', auth, \(req, res\) => \{/g, "router.put('/:id/status', auth, async (req, res) => {"],
    [/router\.get\('\/:id', auth, \(req, res\) => \{/g, "router.get('/:id', auth, async (req, res) => {"],
    [/router\.put\('\/profile', auth, \(req, res\) => \{/g, "router.put('/profile', auth, async (req, res) => {"],
    [/router\.post\('\/behavior', auth, \(req, res\) => \{/g, "router.post('/behavior', auth, async (req, res) => {"],
    [/router\.get\('\/:id\/stats', (req, res\) => \{/g, "router.get('/:id/stats', async (req, res) => {"],
    [/router\.get\('\/:id', (req, res\) => \{/g, "router.get('/:id', async (req, res) => {"],
  ];

  patterns.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });

  // 2. 为所有 db.prepare 调用添加 await
  // 处理 const xxx = db.prepare(...)
  content = content.replace(/const ([a-zA-Z_]+) = (await )?db\.prepare\(([^)]+)\)\.(all|get|run)\(([^)]*)\)/g,
    (match, varName, existingAwait, query, method, params) => {
      return `const ${varName} = await db.prepare(${query}).${method}(${params})`;
    });

  // 处理其他 db.prepare 调用
  content = content.replace(/([^a-zA-Z0-9_])(await )?db\.prepare\(([^)]+)\)\.(all|get|run)\(([^)]*)\)/g,
    (match, prefix, existingAwait, query, method, params) => {
      // 如果前面已经有 await，跳过
      if (existingAwait) return match;
      return `${prefix}await db.prepare(${query}).${method}(${params})`;
    });

  fs.writeFileSync(filePath, content);

  // 统计修复后的状态
  const asyncAfter = (content.match(/async \(/g) || []).length;
  const awaitAfter = (content.match(/await db\./g) || []).length;

  console.log(`✅ ${filename}`);
  console.log(`   async: ${asyncBefore} → ${asyncAfter}`);
  console.log(`   await: ${awaitBefore} → ${awaitAfter}\n`);
});

console.log('✨ 所有文件修复完成！');
console.log('\n请测试服务器:');
console.log('  npm start');
console.log('  curl http://localhost:3000/api/venues');
