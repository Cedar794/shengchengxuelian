const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.db');
const db = new sqlite3.Database(dbPath);

// 社群测试数据
const groups = [
  {
    name: 'Python数据分析学习小组',
    description: '一起学习Python数据分析，分享实战案例，包括爬虫、数据可视化、机器学习等',
    category: 'academic',
    owner_id: 1,
    avatar: null,
    member_count: 127,
    tags: JSON.stringify(['编程', '数据科学', 'Python'])
  },
  {
    name: '跨校篮球爱好者联盟',
    description: '每周组织线上战术讨论，每月一场跨校友谊赛。热爱篮球的同学一起来！',
    category: 'sports',
    owner_id: 1,
    avatar: null,
    member_count: 89,
    tags: JSON.stringify(['体育', '篮球', '运动'])
  },
  {
    name: '申城高校摄影俱乐部',
    description: '用镜头记录校园生活，分享摄影技巧，定期组织外拍活动',
    category: 'culture',
    owner_id: 1,
    avatar: null,
    member_count: 156,
    tags: JSON.stringify(['摄影', '艺术', '创作'])
  },
  {
    name: '考研互助交流群',
    description: '分享考研资料、复习经验，一起为目标院校努力！',
    category: 'academic',
    owner_id: 1,
    avatar: null,
    member_count: 234,
    tags: JSON.stringify(['考研', '学习', '互助'])
  },
  {
    name: '校园创业项目组',
    description: '寻找创业伙伴，分享创业资源，交流项目想法',
    category: 'career',
    owner_id: 1,
    avatar: null,
    member_count: 78,
    tags: JSON.stringify(['创业', '项目', '商业'])
  },
  {
    name: '吉他音乐爱好者',
    description: '吉他技术交流，原创音乐分享，定期举办小型音乐会',
    category: 'culture',
    owner_id: 1,
    avatar: null,
    member_count: 145,
    tags: JSON.stringify(['音乐', '吉他', '艺术'])
  },
  {
    name: 'AI技术研讨社',
    description: '探讨人工智能前沿技术，包括大模型、深度学习、NLP等',
    category: 'academic',
    owner_id: 1,
    avatar: null,
    member_count: 198,
    tags: JSON.stringify(['AI', '人工智能', '技术'])
  },
  {
    name: '读书分享会',
    description: '每月共读一本好书，分享阅读感悟，拓展思维边界',
    category: 'culture',
    owner_id: 1,
    avatar: null,
    member_count: 167,
    tags: JSON.stringify(['阅读', '书籍', '分享'])
  }
];

function seedGroups() {
  console.log('开始添加社群数据...');

  const insertGroup = db.prepare(`
    INSERT INTO groups (name, description, category, owner_id, avatar, member_count, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  let count = 0;
  groups.forEach(group => {
    insertGroup.run(
      group.name,
      group.description,
      group.category,
      group.owner_id,
      group.avatar,
      group.member_count,
      group.tags,
      function(err) {
        if (err) {
          console.error('插入失败:', err);
        } else {
          count++;
          console.log(`✓ 添加社群: ${group.name} (ID: ${this.lastID})`);
        }
      }
    );
  });

  insertGroup.finalize((err) => {
    if (err) {
      console.error('❌ 社群数据添加失败:', err);
    } else {
      console.log(`\n✅ 成功添加 ${count} 个社群！`);
    }

    // 查询验证
    db.all('SELECT id, name, member_count FROM groups', [], (err, rows) => {
      if (err) {
        console.error('查询失败:', err);
      } else {
        console.log('\n当前社群列表:');
        rows.forEach(row => {
          console.log(`  - ${row.name} (${row.member_count}成员)`);
        });
      }

      db.close();
    });
  });
}

// 运行种子脚本
seedGroups();
