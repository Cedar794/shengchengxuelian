# 申城学联 Backend API

后端API服务，基于 Node.js + Express + SQLite 构建。

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web框架
- **SQLite** - 数据库 (better-sqlite3)
- **JWT** - 身份验证
- **bcrypt** - 密码加密

## 项目结构

```
backend/
├── src/
│   ├── server.js           # 主服务器文件
│   ├── database/
│   │   ├── index.js        # 数据库连接
│   │   └── init.js         # 数据库初始化脚本
│   ├── middleware/
│   │   ├── auth.js         # JWT认证中间件
│   │   └── errorHandler.js # 错误处理中间件
│   └── routes/
│       ├── auth.js         # 用户认证
│       ├── users.js        # 用户管理
│       ├── activities.js   # 活动公告
│       ├── collaborations.js # 部门协作
│       ├── venues.js       # 场馆预约
│       ├── materials.js    # 资料分享
│       ├── tips.js         # 校园贴士
│       ├── listings.js     # 商品/服务
│       ├── orders.js       # 订单管理
│       ├── groups.js       # 社群管理
│       ├── projects.js     # 项目协作
│       ├── chat.js         # 匿名私聊
│       └── ai.js           # AI助手
├── data/                   # 数据库文件目录（自动创建）
├── uploads/                # 上传文件目录（自动创建）
├── package.json
└── README.md
```

## 安装和运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 初始化数据库

```bash
npm run init-db
```

这将创建 `data/database.db` 文件并初始化所有数据表和示例数据。

**默认管理员账号：**
- 学号: `admin001`
- 密码: `admin123`

### 3. 启动服务器

```bash
# 生产模式
npm start

# 开发模式（需要 nodemon）
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## API 文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

### 通用格式

**成功响应：**
```json
{
  "message": "Success message",
  "data": { ... }
}
```

**错误响应：**
```json
{
  "error": "Error message"
}
```

---

## 1. 用户认证 (/api/auth)

### 注册
```
POST /api/auth/register
```

**请求体：**
```json
{
  "student_id": "2026001",
  "password": "password123",
  "nickname": "张三",
  "school": "上海海关学院",
  "major": "计算机科学",
  "grade": "大一",
  "tags": ["编程", "运动"]
}
```

**响应：**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 登录
```
POST /api/auth/login
```

**请求体：**
```json
{
  "student_id": "2026001",
  "password": "password123"
}
```

### 获取当前用户
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

---

## 2. 用户管理 (/api/users)

### 获取用户资料
```
GET /api/users/:id
```

### 更新个人资料
```
PUT /api/users/profile
```

### 记录用户行为（推荐系统）
```
POST /api/users/behavior
```

**请求体：**
```json
{
  "page": "campus",
  "action": "view",
  "target_id": 1,
  "target_type": "activity"
}
```

### 获取用户统计
```
GET /api/users/:id/stats
```

---

## 3. 活动公告 (/api/activities)

### 获取所有活动
```
GET /api/activities?type=sports&status=open&page=1&limit=20
```

### 获取推荐活动
```
GET /api/activities/recommended
```

### 获取单个活动
```
GET /api/activities/:id
```

### 创建活动
```
POST /api/activities
```

**请求体：**
```json
{
  "title": "活动标题",
  "description": "活动描述",
  "type": "sports",
  "location": "体育场",
  "event_time": "2026-04-25 09:00:00",
  "registration_deadline": "2026-04-20 23:59:59",
  "max_participants": 100,
  "target_schools": ["all"],
  "target_tags": ["运动", "健康"]
}
```

### 报名活动
```
POST /api/activities/:id/register
```

### 取消报名
```
DELETE /api/activities/:id/register
```

---

## 4. 部门协作 (/api/collaborations)

### 获取所有协作
```
GET /api/collaborations?status=active&department=学工部
```

### 获取单个协作
```
GET /api/collaborations/:id
```

### 创建协作
```
POST /api/collaborations
```

### 添加任务
```
POST /api/collaborations/:id/tasks
```

### 更新任务状态
```
PUT /api/collaborations/:collaborationId/tasks/:taskId
```

### 获取我的任务
```
GET /api/collaborations/my-tasks
```

---

## 5. 场馆预约 (/api/venues)

### 获取所有场馆
```
GET /api/venues?type=sports
```

### 获取场馆可用时间
```
GET /api/venues/:id/availability?date=2026-03-20
```

### 创建预约
```
POST /api/venues/reservations
```

**请求体：**
```json
{
  "venue_id": 1,
  "reservation_date": "2026-03-20",
  "start_time": "09:00",
  "end_time": "10:00",
  "purpose": "篮球比赛",
  "participants": 10
}
```

### 获取我的预约
```
GET /api/venues/reservations/my?status=confirmed
```

### 取消预约
```
DELETE /api/venues/reservations/:id
```

---

## 6. 资料分享 (/api/materials)

### 获取所有资料
```
GET /api/materials?category=guide&type=pdf&page=1&limit=20
```

### 获取单个资料
```
GET /api/materials/:id
```

### 上传资料
```
POST /api/materials
```

**请求体：**
```json
{
  "title": "挑战杯全流程指南",
  "description": "涵盖选题、组队、申报、答辩全环节",
  "type": "pdf",
  "file_url": "/uploads/guide.pdf",
  "file_size": 1024000,
  "category": "竞赛",
  "tags": ["挑战杯", "创业"]
}
```

### 记录下载
```
POST /api/materials/:id/download
```

### 更新资料
```
PUT /api/materials/:id
```

### 删除资料
```
DELETE /api/materials/:id
```

---

## 7. 校园贴士 (/api/tips)

### 获取所有贴士
```
GET /api/tips?category=study&page=1&limit=20
```

### 获取单个贴士
```
GET /api/tips/:id
```

### 创建贴士
```
POST /api/tips
```

**请求体：**
```json
{
  "title": "自习室开放时间",
  "content": "图书馆：周一至周日 8:00-22:00",
  "category": "facility"
}
```

### 更新贴士（Wiki式）
```
PUT /api/tips/:id
```

**请求体：**
```json
{
  "content": "更新后的内容"
}
```

### 删除贴士（管理员）
```
DELETE /api/tips/:id
```

---

## 8. 商品/服务 (/api/listings)

### 获取所有商品
```
GET /api/listings?type=secondhand&category=books&school=上海海关学院&page=1&limit=20
```

**类型：**
- `secondhand` - 二手交易
- `delivery` - 外卖代取
- `creative` - 文创交易
- `lostfound` - 失物招领
- `parttime` - 兼职平台

### 获取单个商品
```
GET /api/listings/:id
```

### 发布商品
```
POST /api/listings
```

**请求体：**
```json
{
  "type": "secondhand",
  "title": "九成新管理学教材",
  "description": "无笔记，保存完好",
  "price": 30,
  "category": "books",
  "condition": "good",
  "images": ["image1.jpg", "image2.jpg"],
  "location": "图书馆门口",
  "tags": ["教材", "管理学"]
}
```

### 更新商品
```
PUT /api/listings/:id
```

### 删除商品
```
DELETE /api/listings/:id
```

### 获取我的商品
```
GET /api/listings/my/listings?status=active
```

---

## 9. 订单管理 (/api/orders)

### 创建订单
```
POST /api/orders
```

**请求体：**
```json
{
  "listing_id": 1,
  "amount": 30,
  "notes": "周末交易"
}
```

### 获取订单详情
```
GET /api/orders/:id
```

### 获取我的订单
```
GET /api/orders/my/orders?role=buyer&status=pending
```

**角色：** `buyer`（买方）或 `seller`（卖方）

### 更新订单状态
```
PUT /api/orders/:id/status
```

**状态：**
- `pending` - 待付款
- `paid` - 已付款
- `shipped` - 已发货
- `completed` - 已完成
- `cancelled` - 已取消

### 取消订单
```
DELETE /api/orders/:id
```

---

## 10. 社群管理 (/api/groups)

### 获取所有社群
```
GET /api/groups?type=public&school=上海海关学院&page=1&limit=20
```

### 获取单个社群
```
GET /api/groups/:id
```

### 创建社群
```
POST /api/groups
```

**请求体：**
```json
{
  "name": "Python数据分析学习小组",
  "description": "一起学习数据分析",
  "tags": ["编程", "数据科学"],
  "type": "public",
  "max_members": 200
}
```

### 加入社群
```
POST /api/groups/:id/join
```

### 退出社群
```
DELETE /api/groups/:id/leave
```

### 发布帖子
```
POST /api/groups/:id/posts
```

**请求体：**
```json
{
  "title": "分享一个好用的数据分析工具",
  "content": "Pandas很强大...",
  "images": ["screenshot.png"]
}
```

### 获取推荐社群
```
GET /api/groups/recommended/list
```

---

## 11. 项目协作 (/api/projects)

### 获取所有项目
```
GET /api/projects?status=recruiting&page=1&limit=20
```

### 获取单个项目
```
GET /api/projects/:id
```

### 创建项目
```
POST /api/projects
```

**请求体：**
```json
{
  "title": "校园碳中和调研项目",
  "description": "需要环境专业、数据可视化、文案人才",
  "required_skills": ["环境科学", "数据分析", "文案写作"],
  "required_roles": ["调研员", "数据分析师", "文案"],
  "max_members": 6,
  "deadline": "2026-05-01",
  "tags": ["环保", "调研"]
}
```

### 申请加入项目
```
POST /api/projects/:id/apply
```

**请求体：**
```json
{
  "role": "数据分析师",
  "message": "我有数据分析经验，想加入项目"
}
```

### 接受申请
```
POST /api/projects/:projectId/applications/:applicationId/accept
```

### 拒绝申请
```
POST /api/projects/:projectId/applications/:applicationId/reject
```

### 获取我的项目
```
GET /api/projects/my/projects?status=recruiting
```

---

## 12. 匿名私聊 (/api/chat)

### 随机匹配
```
POST /api/chat/random-match
```

**请求体：**
```json
{
  "tags": ["考研", "跨专业"]
}
```

### 获取会话消息
```
GET /api/chat/sessions/:sessionId/messages
```

### 发送消息
```
POST /api/chat/sessions/:sessionId/messages
```

**请求体：**
```json
{
  "content": "你好，想交流一下考研经验"
}
```

### 交换联系方式
```
POST /api/chat/sessions/:sessionId/exchange-contact
```

### 结束会话
```
POST /api/chat/sessions/:sessionId/end
```

### 获取我的会话
```
GET /api/chat/sessions/my
```

---

## 13. AI助手 (/api/ai)

### AI对话
```
POST /api/ai/chat
```

**请求体：**
```json
{
  "message": "有什么近期活动吗？",
  "context": {
    "page": "campus",
    "userId": 1
  }
}
```

### 获取对话历史
```
GET /api/ai/chat/history
```

### 清除对话历史
```
DELETE /api/ai/chat/history
```

### 获取推荐内容
```
GET /api/ai/recommendations?type=activities
```

**类型：** `activities`, `groups`, `projects` 或不指定获取混合推荐

---

## 数据库表结构

### 主要表：

1. **users** - 用户表
2. **user_behaviors** - 用户行为记录（用于推荐）
3. **activities** - 活动公告
4. **activity_registrations** - 活动报名
5. **collaborations** - 部门协作
6. **collaboration_tasks** - 协作任务
7. **venues** - 场馆
8. **reservations** - 预约记录
9. **materials** - 资料分享
10. **tips** - 校园贴士
11. **tip_edits** - 贴士编辑历史
12. **listings** - 商品/服务
13. **orders** - 订单
14. **groups** - 社群
15. **group_members** - 社群成员
16. **group_posts** - 社群帖子
17. **projects** - 项目
18. **project_applications** - 项目申请
19. **project_members** - 项目成员
20. **chat_sessions** - 聊天会话
21. **messages** - 聊天消息
22. **ai_sessions** - AI对话会话
23. **ai_messages** - AI对话消息
24. **notifications** - 通知

详细表结构请参考 `src/database/init.js`

---

## 开发说明

### 添加新功能

1. 在 `src/routes/` 创建新的路由文件
2. 在 `src/server.js` 中注册路由
3. 如需数据库变更，更新 `src/database/init.js`

### 中间件

- **auth** - 需要登录认证
- **adminAuth** - 需要管理员权限
- **optionalAuth** - 可选认证（匿名访问也可以）

### 错误处理

所有错误通过 `errorHandler` 中间件统一处理返回。

### JWT Secret

生产环境请设置环境变量 `JWT_SECRET`

```bash
export JWT_SECRET=your-secret-key
```

---

## 部署

### 生产环境配置

1. 设置环境变量
2. 使用 PM2 或类似工具管理进程
3. 配置反向代理（Nginx）
4. 启用 HTTPS
5. 定期备份数据库

### PM2 示例

```bash
npm install -g pm2
pm2 start src/server.js --name shencheng-api
pm2 save
pm2 startup
```

---

## 常见问题

### 数据库文件在哪里？

数据库文件位于 `data/database.db`，首次运行 `npm run init-db` 后创建。

### 如何重置数据库？

删除 `data/database.db` 文件，然后重新运行 `npm run init-db`。

### 如何修改端口？

设置环境变量 `PORT` 或修改 `src/server.js` 中的 PORT 常量。

```bash
export PORT=8080
npm start
```

---

## 联系方式

如有问题请联系开发团队。
