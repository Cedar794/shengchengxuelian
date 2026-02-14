const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = ['activities.js', 'listings.js', 'materials.js', 'orders.js', 'groups.js', 'projects.js', 'chat.js', 'ai.js'];

files.forEach(filename => {
  const filePath = path.join(routesDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. 替换路由处理函数，添加 async (只替换一次)
  const patterns = [
    { regex: /router\.get\('\/', optionalAuth, \(req, res\) => \{/g, replacement: "router.get('/', optionalAuth, async (req, res) => {" },
    { regex: /router\.get\('\/:id', optionalAuth, \(req, res\) => \{/g, replacement: "router.get('/:id', optionalAuth, async (req, res) => {" },
    { regex: /router\.get\('\/recommended', auth, \(req, res\) => \{/g, replacement: "router.get('/recommended', auth, async (req, res) => {" },
    { regex: /router\.post\('\/', auth, \[/g, replacement: "router.post('/', auth, async (req, res) => {" },
    { regex: /router\.post\('\/:id\/register', auth, \(req, res\) => \{/g, replacement: "router.post('/:id/register', auth, async (req, res) => {" },
    { regex: /router\.delete\('\/:id\/register', auth, \(req, res\) => \{/g, replacement: "router.delete('/:id/register', auth, async (req, res) => {" },
    { regex: /router\.post\('\/:id\/posts', auth, \[/g, replacement: "router.post('/:id/posts', auth, async (req, res) => {" },
    { regex: /router\.get\('\/my\/[^']+', auth, \(req, res\) => \{/g, replacement: "router.get('/my/listings', auth, async (req, res) => {" },
  ];

  patterns.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  // 2. 为所有 db.prepare 调用添加 await (只添加一次)
  // 匹配 const xxx = db.prepare(...)
  content = content.replace(/const ([a-zA-Z_]+) = (await )?db\.prepare\(([^)]+)\)\.(all|get|run)\(([^)]*)\)/g,
    (match, varName, existingAwait, query, method, params) => {
      return `const ${varName} = await db.prepare(${query}).${method}(${params})`;
    });

  // 匹配其他直接的 db.prepare 调用
  content = content.replace(/([^a-zA-Z0-9_])(await )?db\.prepare\(([^)]+)\)\.(all|get|run)\(([^)]*)\)/g,
    (match, prefix, existingAwait, query, method, params) => {
      return `${prefix}await db.prepare(${query}).${method}(${params})`;
    });

  fs.writeFileSync(filePath, content);
  console.log(`${filename} 修复完成`);
});

console.log('所有文件修复完成！');
