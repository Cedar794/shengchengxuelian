const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = ['activities.js', 'listings.js', 'materials.js', 'orders.js', 'groups.js', 'projects.js', 'chat.js', 'ai.js'];

console.log('🔧 开始修复 async/await 问题...\n');

files.forEach(filename => {
  const filePath = path.join(routesDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  const asyncBefore = (content.match(/async \(/g) || []).length;
  const awaitBefore = (content.match(/await db\./g) || []).length;

  // 1. 在 router.get/post/put/delete 行添加 async
  const lines = content.split('\n');
  const fixedLines = lines.map(line => {
    // 匹配 router.xxx('path', middleware, (req, res) => {
    if (line.match(/router\.(get|post|put|delete)\(/) && line.includes('(req, res) =>') && !line.includes('async')) {
      return line.replace('(req, res) =>', 'async (req, res) =>');
    }
    // 匹配 router.xxx('path', auth, [验证器], (req, res) => {
    if (line.match(/router\.(get|post)\(/) && line.includes(', [') && !line.includes('async')) {
      // 这种情况需要特殊处理，跳过
      return line;
    }
    return line;
  });

  content = fixedLines.join('\n');

  // 处理验证器的情况 - router.post('/', auth, [验证器], (req, res) => {
  content = content.replace(
    /router\.(get|post|put|delete)\('([^']+)', (auth|optionalAuth), \[\s*\n[^}]*\],\s*\n\s*\(req, res\) => \{/g,
    (match) => match.replace('(req, res) =>', 'async (req, res) =>')
  );

  // 2. 为所有 db.prepare 调用添加 await
  content = content.replace(/const ([a-zA-Z_]+) = db\.prepare\(/g, 'const $1 = await db.prepare(');
  content = content.replace(/([^a-zA-Z0-9_])db\.prepare\(/g, '$1await db.prepare(');

  fs.writeFileSync(filePath, content);

  const asyncAfter = (content.match(/async \(/g) || []).length;
  const awaitAfter = (content.match(/await db\./g) || []).length;

  console.log(`✅ ${filename.padEnd(20)} async: ${asyncBefore}→${asyncAfter}  await: ${awaitBefore}→${awaitAfter}`);
});

console.log('\n✨ 所有文件修复完成！');
console.log('\n📝 下一步:');
console.log('   1. npm start');
console.log('   2. curl http://localhost:3000/api/venues');
console.log('   3. curl http://localhost:3000/api/activities');
