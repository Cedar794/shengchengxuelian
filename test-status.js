// 测试状态处理逻辑
const statusMapping = {
  'AVAILABLE': 'active',
  'RESERVED': 'inactive',
  'SOLD': 'sold',
  'REMOVED': 'completed'
};

// 测试各种输入情况
const testCases = [
  { input: 'AVAILABLE', expected: 'active', description: '正常输入 AVAILABLE' },
  { input: 'RESERVED', expected: 'inactive', description: '正常输入 RESERVED' },
  { input: 'sold', expected: 'sold', description: '直接输入数据库值' },
  { input: '', expected: 'active', description: '空字符串' },
  { input: null, expected: 'active', description: 'null 值' },
  { input: undefined, expected: 'active', description: 'undefined' },
  { input: 'invalid', expected: 'invalid', description: '无效值会保留原样' }
];

console.log('=== 测试后端状态处理逻辑 ===');
testCases.forEach(test => {
  const finalStatus = test.input ? statusMapping[test.input] || test.input : 'active';
  console.log(`${test.description}:`);
  console.log(`  输入: ${test.input}`);
  console.log(`  预期: ${test.expected}`);
  console.log(`  实际: ${finalStatus}`);
  console.log(`  结果: ${finalStatus === test.expected ? '✅ 正确' : '❌ 错误'}\n`);
});

// 测试前端 select 的默认值逻辑
console.log('=== 测试前端默认值逻辑 ===');
const fieldOptions = [
  { value: 'AVAILABLE', label: '可交易' },
  { value: 'RESERVED', label: '已预订' },
  { value: 'SOLD', label: '已售出' },
  { value: 'REMOVED', label: '已下架' }
];

// 模拟用户没有选择的情况
const formData = {
  // status 字段不存在
};

const selectedValue = formData.status ?? fieldOptions[0].value;
console.log(`前端默认值: ${selectedValue}`);
console.log(`数据库存储: ${statusMapping[selectedValue] || selectedValue}`);