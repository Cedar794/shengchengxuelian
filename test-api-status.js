const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(express.json());

// 模拟数据库连接
const db = new sqlite3.Database('./backend/data/database.db');

// 模拟后端的状态处理逻辑
const statusMapping = {
  'AVAILABLE': 'active',
  'RESERVED': 'inactive',
  'SOLD': 'sold',
  'REMOVED': 'completed'
};

// 模拟 POST /api/listings 路由的状态处理
app.post('/api/listings', (req, res) => {
  const { type, title, status, price } = req.body;

  console.log('接收到的数据:', req.body);

  // 转换前端大写状态值为数据库小写状态值
  const finalStatus = status ? statusMapping[status] || status : 'active';

  console.log('处理后的状态:', finalStatus);

  // 模拟数据库插入
  const query = `
    INSERT INTO listings (type, title, price, status)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [type, title, price, finalStatus], function(err) {
    if (err) {
      console.error('数据库错误:', err);
      return res.status(500).json({ error: '创建失败' });
    }

    // 返回创建的数据（包括转换后的状态）
    const newListing = {
      id: this.lastID,
      type,
      title,
      price,
      status: statusMapping[finalStatus] || finalStatus // 转换回大写
    };

    res.status(201).json({
      message: 'Listing created successfully',
      listing: newListing
    });
  });
});

// 测试端点
app.post('/test-status', (req, res) => {
  const { status } = req.body;
  const finalStatus = status ? statusMapping[status] || status : 'active';

  res.json({
    input: status,
    output: finalStatus,
    database_value: finalStatus
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
  console.log('\n测试用例:');

  // 测试各种状态输入
  const testCases = [
    { status: 'AVAILABLE' },
    { status: 'RESERVED' },
    { status: 'SOLD' },
    { status: 'REMOVED' },
    { status: '' },
    { status: null },
    { status: undefined },
    { status: 'invalid' }
  ];

  testCases.forEach((testCase, index) => {
    setTimeout(() => {
      fetch(`http://localhost:${PORT}/test-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
      })
        .then(res => res.json())
        .then(data => {
          console.log(`测试 ${index + 1}:`, data);
        });
    }, index * 500);
  });
});