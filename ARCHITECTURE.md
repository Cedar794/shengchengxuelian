# 申城学联校园综合服务平台 - 系统架构设计

## 项目概述
- **项目名称**: 申城学联
- **项目类型**: 校园综合服务平台（演示项目）
- **用户规模**: 4-5人（小规模演示）
- **设计原则**: 简单、快速、可扩展

---

## 一、整体系统架构

### 1.1 架构模式
采用**前后端分离架构**，简化部署流程

```
┌─────────────────────────────────────────────────────────┐
│                      用户层                              │
├──────────────────────┬──────────────────────────────────┤
│   用户端 Web App     │      管理端 Web Admin            │
│   (Vue 3 + Vite)    │      (Vue 3 + Vite)              │
└──────────────────────┴──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway / 后端服务                 │
│              (Express.js / Node.js)                     │
├─────────────────────────────────────────────────────────┤
│  RESTful API  │  静态资源  │  AI聊天机器人接口（预留）   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   数据存储层                             │
├──────────────────────┬──────────────────────────────────┤
│   SQLite 数据库      │      本地文件存储                │
│   (轻量级演示)       │      (图片、文档)                │
└──────────────────────┴──────────────────────────────────┘
```

### 1.2 部署架构
```
本地开发环境：
- 前端: http://localhost:5173 (用户端)
- 前端: http://localhost:5174 (管理端)
- 后端: http://localhost:3000
- 数据库: ./data/database.db (SQLite)
```

---

## 二、技术栈选型

### 2.1 前端技术栈
| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **框架** | React 19 | 核心框架 | 现代化 Hooks，组件化开发 |
| **构建工具** | Vite 5.0+ | 构建工具 | 快速开发体验 |
| **路由** | React Router 6.x | 页面路由 | 前端路由管理 |
| **状态管理** | Zustand / Context API | 全局状态 | 轻量级状态管理 |
| **CSS 框架** | Tailwind CSS 3.x | 样式框架 | 实用优先的 CSS 框架 |
| **组件库** | Headless UI / Radix UI | 无样式组件 | 可访问性强的组件库 |
| **HTTP 客户端** | Axios 1.x | API 请求 | Promise based |
| **工具库** | Day.js | 时间处理 | 轻量级日期库 |

### 2.2 后端技术栈
| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **运行环境** | Node.js 20+ | 运行时环境 | LTS 版本 |
| **Web 框架** | Express 4.x | API 服务 | 轻量级、成熟稳定 |
| **ORM** | Prisma 5.x | 数据库 ORM | 类型安全， migrations |
| **数据库** | SQLite 3.x | 数据存储 | 零配置，适合演示 |
| **认证** | JWT | 用户认证 | jsonwebtoken |
| **文件上传** | Multer | 文件处理 | multipart/form-data |
| **验证** | Joi | 数据验证 | Schema validation |
| **日志** | Morgan | HTTP 日志 | 开发调试 |
| **CORS** | cors | 跨域处理 | 跨域资源共享 |

### 2.3 开发工具
- **代码规范**: ESLint + Prettier
- **Git Hooks**: husky + lint-staged
- **API 测试**: Postman / Thunder Client
- **版本控制**: Git

---

## 三、数据库设计

### 3.1 核心表结构

```prisma
// ==================== 用户与认证 ====================

model User {
  id            String    @id @default(uuid())
  username      String    @unique
  email         String?   @unique
  password      String
  nickname      String
  avatar        String?
  role          UserRole  @default(STUDENT)
  school        String?
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关联关系
  posts         Post[]
  comments      Comment[]
  trades        TradeItem[]
  orders        Order[]
  lostFounds    LostFound[]
  jobs          Job[]
  applications  JobApplication[]
  chatMessages  ChatMessage[]
  communityMembers CommunityMember[]
  notifications  Notification[]
}

enum UserRole {
  ADMIN
  STUDENT
  MODERATOR
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
}

// ==================== 校园通模块 ====================

// 活动公告
model Announcement {
  id          String   @id @default(uuid())
  title       String
  content     String
  category    String
  coverImage  String?
  publisherId String
  isPinned    Boolean  @default(false)
  status      PostStatus @default(PUBLISHED)
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  publisher   User     @relation(fields: [publisherId], references: [id])
}

// 部门协作
model Collaboration {
  id          String   @id @default(uuid())
  title       String
  description String
  department  String
  status      String   @default("进行中")
  deadline    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 场馆预约
model VenueBooking {
  id          String   @id @default(uuid())
  venueName   String
  location    String
  userId      String
  bookingDate DateTime
  timeSlot    String
  purpose     String
  status      BookingStatus @default(PENDING)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}

enum BookingStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

// 资料分享
model Resource {
  id          String   @id @default(uuid())
  title       String
  description String?
  category    String
  fileUrl     String
  fileName    String
  fileSize    Int
  uploaderId  String
  downloadCount Int    @default(0)
  createdAt   DateTime @default(now())

  uploader    User     @relation(fields: [uploaderId], references: [id])
}

// 校园贴士
model Tip {
  id          String   @id @default(uuid())
  title       String
  content     String
  category    String
  authorId    String
  likes       Int      @default(0)
  createdAt   DateTime @default(now())

  author      User     @relation(fields: [authorId], references: [id])
}

// ==================== 生活汇模块 ====================

// 二手交易、文创交易
model TradeItem {
  id          String    @id @default(uuid())
  title       String
  description String
  price       Float
  category    TradeCategory
  condition   String    @default("九成新")
  images      String    // JSON array
  sellerId    String
  status      TradeStatus @default(AVAILABLE)
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  seller      User      @relation(fields: [sellerId], references: [id])
  orders      Order[]
}

enum TradeCategory {
  SECOND_HAND    // 二手交易
  CULTURAL       // 文创交易
  DELIVERY       // 外卖代取
}

enum TradeStatus {
  AVAILABLE
  RESERVED
  SOLD
  REMOVED
}

// 订单
model Order {
  id          String   @id @default(uuid())
  itemId      String
  buyerId     String
  status      OrderStatus @default(PENDING)
  totalPrice  Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  item        TradeItem @relation(fields: [itemId], references: [id])
  buyer       User      @relation(fields: [buyerId], references: [id])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

// 失物招领
model LostFound {
  id          String      @id @default(uuid())
  type        LostFoundType
  title       String
  description String
  location    String
  contact     String
  images      String      // JSON array
  posterId    String
  status      String      @default("进行中")
  createdAt   DateTime    @default(now())

  poster      User        @relation(fields: [posterId], references: [id])
}

enum LostFoundType {
  LOST
  FOUND
}

// 兼职平台
model Job {
  id          String   @id @default(uuid())
  title       String
  description String
  company     String
  location    String
  salary      String
  workTime    String
  requirements String
  posterId    String
  status      JobStatus @default(ACTIVE)
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  poster      User     @relation(fields: [posterId], references: [id])
  applications JobApplication[]
}

enum JobStatus {
  ACTIVE
  CLOSED
  FILLED
}

// 求职申请
model JobApplication {
  id          String   @id @default(uuid())
  jobId       String
  applicantId String
  resume      String?
  status      ApplicationStatus @default(PENDING)
  createdAt   DateTime @default(now())

  job         Job      @relation(fields: [jobId], references: [id])
  applicant   User     @relation(fields: [applicantId], references: [id])
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
}

// ==================== 校际圈模块 ====================

// 主题社群
model Community {
  id          String   @id @default(uuid())
  name        String
  description String
  category    String
  avatar      String?
  ownerId     String
  memberCount Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     CommunityMember[]
  posts       Post[]
}

model CommunityMember {
  id          String   @id @default(uuid())
  communityId String
  userId      String
  role        String   @default("成员")
  joinedAt    DateTime @default(now())

  community   Community @relation(fields: [communityId], references: [id])
  user        User      @relation(fields: [userId], references: [id])

  @@unique([communityId, userId])
}

// 跨校项目协作
model ProjectCollaboration {
  id          String   @id @default(uuid())
  title       String
  description String
  category    String
  requiredSkills String
  status      String   @default("招募中")
  deadline    DateTime?
  creatorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 社群帖子/讨论
model Post {
  id          String   @id @default(uuid())
  title       String?
  content     String
  authorId    String
  communityId String?
  type        PostType @default(DISCUSSION)
  images      String?  // JSON array
  likes       Int      @default(0)
  status      PostStatus @default(PUBLISHED)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  author      User         @relation(fields: [authorId], references: [id])
  community   Community?   @relation(fields: [communityId], references: [id])
  comments    Comment[]
}

enum PostType {
  DISCUSSION
  ANNOUNCEMENT
  QUESTION
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// 评论
model Comment {
  id          String   @id @default(uuid())
  content     String
  postId      String
  authorId    String
  parentId    String?
  createdAt   DateTime @default(now())

  post        Post     @relation(fields: [postId], references: [id])
  author      User     @relation(fields: [authorId], references: [id])
}

// 跨校私聊
model ChatMessage {
  id          String   @id @default(uuid())
  senderId    String
  receiverId  String
  content     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  sender      User     @relation(fields: [senderId], references: [id])
}

// ==================== 通知系统 ====================

model Notification {
  id          String   @id @default(uuid())
  userId      String
  type        String
  title       String
  content     String
  link        String?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}
```

### 3.2 数据库索引设计
```sql
-- 用户表
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_username ON User(username);
CREATE INDEX idx_user_role ON User(role);

-- 交易表
CREATE INDEX idx_trade_category ON TradeItem(category);
CREATE INDEX idx_trade_status ON TradeItem(status);
CREATE INDEX idx_trade_seller ON TradeItem(sellerId);

-- 帖子表
CREATE INDEX idx_post_author ON Post(authorId);
CREATE INDEX idx_post_community ON Post(communityId);
CREATE INDEX idx_post_created ON Post(createdAt);

-- 消息表
CREATE INDEX idx_chat_sender ON ChatMessage(senderId);
CREATE INDEX idx_chat_receiver ON ChatMessage(receiverId);
```

---

## 四、API 接口设计规范

### 4.1 设计原则
- RESTful 风格
- 统一响应格式
- JWT 认证
- 请求参数验证
- 错误处理标准化

### 4.2 统一响应格式
```typescript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": { ... }
}

// 错误响应
{
  "code": 400,
  "message": "错误信息",
  "error": "详细错误描述"
}

// 分页响应
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 4.3 核心 API 接口

#### 4.3.1 认证模块
```
POST   /api/auth/register        # 用户注册
POST   /api/auth/login           # 用户登录
POST   /api/auth/logout          # 用户登出
GET    /api/auth/profile         # 获取当前用户信息
PUT    /api/auth/profile         # 更新用户信息
POST   /api/auth/change-password # 修改密码
```

#### 4.3.2 校园通模块
```
# 活动公告
GET    /api/campus/announcements           # 获取公告列表
GET    /api/campus/announcements/:id       # 获取公告详情
POST   /api/campus/announcements           # 创建公告（管理员）
PUT    /api/campus/announcements/:id       # 更新公告
DELETE /api/campus/announcements/:id       # 删除公告

# 部门协作
GET    /api/campus/collaborations          # 获取协作列表
GET    /api/campus/collaborations/:id      # 获取协作详情
POST   /api/campus/collaborations          # 创建协作
PUT    /api/campus/collaborations/:id      # 更新协作

# 场馆预约
GET    /api/campus/venues                  # 获取预约列表
GET    /api/campus/venues/:id              # 获取预约详情
POST   /api/campus/venues/book             # 创建预约
PUT    /api/campus/venues/:id              # 更新预约状态
DELETE /api/campus/venues/:id              # 取消预约

# 资料分享
GET    /api/campus/resources               # 获取资料列表
GET    /api/campus/resources/:id           # 获取资料详情
POST   /api/campus/resources               # 上传资料
GET    /api/campus/resources/:id/download  # 下载资料

# 校园贴士
GET    /api/campus/tips                    # 获取贴士列表
GET    /api/campus/tips/:id                # 获取贴士详情
POST   /api/campus/tips                    # 创建贴士
PUT    /api/campus/tips/:id/like           # 点赞贴士
```

#### 4.3.3 生活汇模块
```
# 交易市场（二手、文创、外卖）
GET    /api/life/trades                    # 获取交易列表
GET    /api/life/trades/:id                # 获取交易详情
POST   /api/life/trades                    # 发布交易
PUT    /api/life/trades/:id                # 更新交易
DELETE /api/life/trades/:id                # 删除交易

# 订单管理
GET    /api/life/orders                    # 获取订单列表
GET    /api/life/orders/:id                # 获取订单详情
POST   /api/life/orders                    # 创建订单
PUT    /api/life/orders/:id/status         # 更新订单状态

# 失物招领
GET    /api/life/lost-found                # 获取失物招领列表
GET    /api/life/lost-found/:id            # 获取失物招领详情
POST   /api/life/lost-found                # 发布失物招领
PUT    /api/life/lost-found/:id            # 更新失物招领

# 兼职平台
GET    /api/life/jobs                      # 获取兼职列表
GET    /api/life/jobs/:id                  # 获取兼职详情
POST   /api/life/jobs                      # 发布兼职
POST   /api/life/jobs/:id/apply            # 申请兼职
GET    /api/life/jobs/applications         # 获取申请列表
```

#### 4.3.4 校际圈模块
```
# 社群管理
GET    /api/social/communities             # 获取社群列表
GET    /api/social/communities/:id         # 获取社群详情
POST   /api/social/communities             # 创建社群
POST   /api/social/communities/:id/join    # 加入社群
DELETE /api/social/communities/:id/leave   # 退出社群

# 帖子讨论
GET    /api/social/posts                   # 获取帖子列表
GET    /api/social/posts/:id               # 获取帖子详情
POST   /api/social/posts                   # 创建帖子
PUT    /api/social/posts/:id               # 更新帖子
DELETE /api/social/posts/:id               # 删除帖子
POST   /api/social/posts/:id/like          # 点赞帖子

# 评论管理
GET    /api/social/posts/:id/comments      # 获取评论列表
POST   /api/social/posts/:id/comments      # 发表评论
DELETE /api/social/comments/:id            # 删除评论

# 跨校项目
GET    /api/social/projects                # 获取项目列表
GET    /api/social/projects/:id            # 获取项目详情
POST   /api/social/projects                # 创建项目
PUT    /api/social/projects/:id            # 更新项目

# 私聊消息
GET    /api/social/messages                # 获取消息列表
GET    /api/social/messages/:userId        # 获取与某用户的聊天记录
POST   /api/social/messages                # 发送消息
PUT    /api/social/messages/:id/read       # 标记消息已读
```

#### 4.3.5 通知模块
```
GET    /api/notifications                  # 获取通知列表
GET    /api/notifications/unread-count     # 获取未读数量
PUT    /api/notifications/:id/read         # 标记已读
PUT    /api/notifications/read-all         # 全部标记已读
```

#### 4.3.6 文件上传
```
POST   /api/upload/image                   # 上传图片
POST   /api/upload/file                    # 上传文件
```

#### 4.3.7 管理端接口
```
GET    /api/admin/users                    # 用户管理
GET    /api/admin/users/:id                # 用户详情
PUT    /api/admin/users/:id/status         # 更新用户状态
GET    /api/admin/statistics               # 数据统计
GET    /api/admin/audit/pending            # 待审核内容
PUT    /api/admin/audit/:id/approve        # 审核通过
PUT    /api/admin/audit/:id/reject         # 审核拒绝
```

### 4.4 状态码规范
```
200  OK                       - 请求成功
201  Created                  - 创建成功
204  No Content               - 删除成功
400  Bad Request              - 请求参数错误
401  Unauthorized             - 未认证
403  Forbidden                - 无权限
404  Not Found                - 资源不存在
422  Unprocessable Entity     - 验证失败
500  Internal Server Error    - 服务器错误
```

---

## 五、前端页面结构

### 5.1 用户端页面路由
```
/                          # 首页（综合展示）
/login                     # 登录
/register                  # 注册

# 校园通
/campus/announcements      # 活动公告
/campus/collaboration      # 部门协作
/campus/venues             # 场馆预约
/campus/resources          # 资料分享
/campus/tips               # 校园贴士

# 生活汇
/life/trade                # 交易市场（二手/文创/外卖）
/life/orders               # 我的订单
/life/lost-found           # 失物招领
/life/jobs                 # 兼职平台

# 校际圈
/social/communities        # 主题社群
/social/posts              # 帖子广场
/social/projects           # 跨校项目
/social/messages           # 私聊

# 个人中心
/profile                   # 个人资料
/profile/settings          # 设置
/profile/notifications     # 通知中心
```

### 5.2 管理端页面路由
```
/admin/login               # 管理员登录
/admin/dashboard           # 数据概览
/admin/users               # 用户管理
/admin/content             # 内容管理
/admin/audit               # 审核管理
/admin/settings            # 系统设置
```

### 5.3 核心组件
```
components/
├── layout/
│   ├── AppHeader.vue          # 顶部导航栏
│   ├── AppFooter.vue          # 底部信息栏
│   └── AppSidebar.vue         # 侧边栏
├── common/
│   ├── ChatBot.vue            # AI聊天机器人"小联"（左下角）
│   ├── NotificationBell.vue   # 通知铃铛
│   └── UserAvatar.vue         # 用户头像
└── business/
    ├── TradeCard.vue          # 交易卡片
    ├── PostCard.vue           # 帖子卡片
    └── VenueCalendar.vue      # 场馆日历
```

---

## 六、UI 设计规范

### 6.1 配色方案
```scss
// 主色调 - 浅蓝色系
$primary-color: #5CACEE;        // 主蓝色
$primary-light: #87CEEB;        // 浅蓝色
$primary-dark: #4682B4;         // 深蓝色
$secondary-color: #E6F3FF;      // 次要色（极浅蓝）

// 中性色
$white: #FFFFFF;
$gray-50: #F9FAFB;
$gray-100: #F3F4F6;
$gray-200: #E5E7EB;
$gray-300: #D1D5DB;
$gray-600: #4B5563;
$gray-800: #1F2937;

// 功能色
$success: #10B981;
$warning: #F59E0B;
$error: #EF4444;
$info: #3B82F6;

// 渐变色
$gradient-primary: linear-gradient(135deg, #5CACEE 0%, #87CEEB 100%);
$gradient-light: linear-gradient(135deg, #E6F3FF 0%, #FFFFFF 100%);
```

### 6.2 设计风格
- **整体风格**: 清新、简洁、年轻化
- **圆角**: 8px - 12px
- **阴影**: 柔和阴影（box-shadow: 0 2px 8px rgba(92, 172, 238, 0.15)）
- **字体**: 系统默认字体栈（-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto）

### 6.3 AI 聊天机器人"小联"设计
```vue
<!-- 位置：页面左下角固定 -->
<template>
  <div class="chatbot-container">
    <!-- 收起状态的圆形头像 -->
    <div class="chatbot-avatar" @click="toggleChat">
      <img src="@/assets/images/chatbot-mascot.png" alt="小联" />
      <span class="pulse-dot"></span>
    </div>

    <!-- 展开状态的聊天窗口 -->
    <div class="chatbot-window" v-show="isOpen">
      <div class="chatbot-header">
        <img src="@/assets/images/chatbot-mascot.png" alt="小联" />
        <span class="chatbot-name">小联</span>
        <button class="close-btn" @click="toggleChat">×</button>
      </div>
      <div class="chatbot-messages">
        <!-- 消息列表 -->
      </div>
      <div class="chatbot-input">
        <input type="text" placeholder="和小联聊聊吧~" />
        <button class="send-btn">发送</button>
      </div>
    </div>
  </div>
</template>

<style>
.chatbot-container {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 9999;
}

.chatbot-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: $gradient-primary;
  box-shadow: 0 4px 12px rgba(92, 172, 238, 0.3);
  cursor: pointer;
  transition: transform 0.3s;
}

.chatbot-avatar:hover {
  transform: scale(1.1);
}

.chatbot-window {
  width: 360px;
  height: 500px;
  background: $white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(92, 172, 238, 0.25);
  margin-bottom: 10px;
}
</style>
```

---

## 七、项目目录结构

```
shencheng-xuelian/
├── client/                      # 用户端前端
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/             # 静态资源
│   │   │   ├── images/
│   │   │   │   └── chatbot-mascot.png
│   │   │   └── styles/
│   │   │       ├── variables.scss
│   │   │       └── global.scss
│   │   ├── components/         # 组件
│   │   │   ├── layout/
│   │   │   ├── common/
│   │   │   └── business/
│   │   ├── views/              # 页面
│   │   │   ├── campus/
│   │   │   ├── life/
│   │   │   └── social/
│   │   ├── router/             # 路由
│   │   ├── store/              # 状态管理
│   │   ├── api/                # API 请求
│   │   ├── utils/              # 工具函数
│   │   ├── App.vue
│   │   └── main.ts
│   ├── package.json
│   └── vite.config.ts
│
├── admin/                       # 管理端前端
│   ├── src/
│   │   └── (结构同 client)
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # 后端服务
│   ├── src/
│   │   ├── routes/             # 路由
│   │   │   ├── auth.ts
│   │   │   ├── campus.ts
│   │   │   ├── life.ts
│   │   │   ├── social.ts
│   │   │   └── admin.ts
│   │   ├── controllers/        # 控制器
│   │   ├── models/             # Prisma models
│   │   ├── middleware/         # 中间件
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── services/           # 业务逻辑
│   │   ├── utils/              # 工具函数
│   │   ├── config/             # 配置文件
│   │   └── index.ts            # 入口文件
│   ├── prisma/
│   │   ├── schema.prisma       # 数据库模型
│   │   └── migrations/         # 迁移文件
│   ├── uploads/                # 上传文件存储
│   ├── data/                   # SQLite 数据库文件
│   ├── package.json
│   └── tsconfig.json
│
├── ARCHITECTURE.md              # 架构文档（本文件）
├── README.md                    # 项目说明
└── .gitignore
```

---

## 八、开发流程

### 8.1 环境准备
```bash
# 1. 安装 Node.js 20+
node --version

# 2. 安装 pnpm（推荐）
npm install -g pnpm

# 3. 克隆项目
git clone <repository-url>
cd shencheng-xuelian
```

### 8.2 后端开发
```bash
cd server

# 安装依赖
pnpm install

# 初始化数据库
npx prisma generate
npx prisma migrate dev --name init

# 启动开发服务器
pnpm dev
# 服务运行在 http://localhost:3000
```

### 8.3 用户端开发
```bash
cd client

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
# 服务运行在 http://localhost:5173
```

### 8.4 管理端开发
```bash
cd admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
# 服务运行在 http://localhost:5174
```

### 8.5 开发命令速查
```bash
# 后端
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器
npx prisma studio     # 打开数据库管理界面

# 前端
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm preview          # 预览生产构建
pnpm lint             # 代码检查
```

---

## 九、安全考虑

### 9.1 认证与授权
- JWT Token 认证
- Token 过期时间：7天
- 密码加密：bcrypt (salt rounds: 10)
- HTTP Only Cookie 存储 Token（可选）

### 9.2 数据验证
- 后端：Joi schema 验证
- 前端：表单验证
- SQL 注入防护（Prisma ORM）
- XSS 防护（输入转义）

### 9.3 文件上传
- 文件大小限制：5MB
- 允许格式：.jpg, .jpeg, .png, .pdf, .doc, .docx
- 文件名随机化处理
- 病毒扫描（生产环境）

### 9.4 CORS 配置
```javascript
// 开发环境
origin: ['http://localhost:5173', 'http://localhost:5174']

// 生产环境
origin: ['https://your-domain.com']
```

---

## 十、部署方案（开发环境）

### 10.1 本地开发配置
```bash
# .env (server/)
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
DATABASE_URL="file:./data/database.db"

# Client (.env)
VITE_API_BASE_URL=http://localhost:3000/api

# Admin (.env)
VITE_API_BASE_URL=http://localhost:3000/api
```

### 10.2 启动顺序
```bash
# 终端 1: 启动后端
cd server && pnpm dev

# 终端 2: 启动用户端
cd client && pnpm dev

# 终端 3: 启动管理端
cd admin && pnpm dev
```

### 10.3 生产部署（可选）
如需部署到生产环境，可使用：
- **前端**: Vercel / Netlify
- **后端**: Railway / Render
- **数据库**: SQLite（小规模）或 PostgreSQL（生产）

---

## 十一、开发时间线建议

### Phase 1: 基础搭建（2天）
- 项目初始化
- 数据库设计与迁移
- 认证系统
- 基础 UI 框架

### Phase 2: 核心功能（5天）
- 校园通模块（2天）
- 生活汇模块（2天）
- 校际圈模块（1天）

### Phase 3: 完善与优化（2天）
- AI聊天机器人UI
- 通知系统
- 管理端基础功能
- 测试与修复

**总计**: 约 9 天完成 MVP

---

## 十二、技术亮点

1. **轻量级快速开发**: SQLite + Prisma，零配置数据库
2. **类型安全**: TypeScript 全栈
3. **现代化 UI**: Vue 3 Composition API + Element Plus
4. **清新配色**: 浅蓝色主题，符合校园氛围
5. **可爱 AI 助手**: "小联"聊天机器人，增强用户互动
6. **模块化设计**: 三大模块清晰分离，易于扩展
7. **管理后台**: 完整的内容管理和数据统计

---

## 十三、后续扩展方向

1. **AI 聊天机器人**: 接入大模型 API（如 GPT、文心一言）
2. **实时通讯**: WebSocket 实现即时消息推送
3. **移动端**: 适配 H5 或开发小程序
4. **支付集成**: 微信支付、支付宝
5. **数据可视化**: ECharts 图表展示
6. **缓存优化**: Redis 缓存热点数据
7. **搜索引擎**: Elasticsearch 全文搜索

---

## 附录：参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Express 官方文档](https://expressjs.com/)
- [Prisma 官方文档](https://www.prisma.io/)
- [RESTful API 设计指南](https://restfulapi.net/)

---

**文档版本**: v1.0
**最后更新**: 2025-02-10
**维护者**: 申城学联开发团队
