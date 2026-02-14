const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = ['activities.js', 'listings.js', 'materials.js', 'orders.js', 'groups.js', 'projects.js', 'chat.js', 'ai.js'];

files.forEach(filename => {
  const filePath = path.join(routesDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. 替换路由处理函数，添加 async
  content = content.replace(/router\.(get|post|put|delete)\('([^']+)', (auth|optionalAuth), \(/g,
    'router.$1(\'$2\', $3, async (');

  // 2. 替换 db.prepare 调用，添加 await
  // 首先处理 const xxx = db.prepare(...)
  content = content.replace(/const ([a-zA-Z_]+) = db\.prepare\(/g, 'const $1 = await db.prepare(');

  // 处理其他 db.prepare 调用
  content = content.replace(/([^a-zA-Z0-9_])db\.prepare\(/g, '$1await db.prepare(');

  fs.writeFileSync(filePath, content);
  console.log(`${filename} 修复完成`);
});

console.log('所有文件修复完成！');
