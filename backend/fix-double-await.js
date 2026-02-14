const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = ['activities.js', 'listings.js', 'materials.js', 'orders.js', 'groups.js', 'projects.js', 'chat.js', 'ai.js'];

console.log('🔧 修复双重 await 问题...\n');

files.forEach(filename => {
  const filePath = path.join(routesDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // 统计修复前
  const doubleAwaitBefore = (content.match(/await await/g) || []).length;

  // 移除双重 await，改为单个 await
  content = content.replace(/await await db\./g, 'await db.');

  // 确保所有 db.prepare 调用都有 await（但没有重复）
  // 匹配 const xxx = db.prepare(...)
  content = content.replace(/const ([a-zA-Z_]+) = db\.prepare\(([^)]+)\)\.(all|get|run)\(([^)]*)\)/g,
    (match, varName, query, method, params) => {
      // 检查是否已经有 await
      if (match.includes('await')) {
        // 如果有 await await，清理为单个 await
        return match.replace(/await\s+await/g, 'await');
      }
      return `const ${varName} = await db.prepare(${query}).${method}(${params})`;
    });

  // 匹配其他 db.prepare 调用
  content = content.replace(/([^a-zA-Z0-9_])db\.prepare\(([^)]+)\)\.(all|get|run)\(([^)]*)\)/g,
    (match, prefix, query, method, params) => {
      if (match.includes('await')) {
        return match.replace(/await\s+await/g, 'await');
      }
      return `${prefix}await db.prepare(${query}).${method}(${params})`;
    });

  fs.writeFileSync(filePath, content);

  const doubleAwaitAfter = (content.match(/await await/g) || []).length;
  const totalAwait = (content.match(/await db\./g) || []).length;

  console.log(`✅ ${filename.padEnd(20)} 双重await: ${doubleAwaitBefore}→${doubleAwaitAfter}  总await: ${totalAwait}`);
});

console.log('\n✨ 修复完成！');
console.log('\n📝 测试服务器:');
console.log('   cd /Users/cedar794/Desktop/10000/backend');
console.log('   npm start');
console.log('   curl http://localhost:3000/api/venues');
