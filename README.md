# 申城学联 - 校园综合服务平台

<div align="center">

![申城学联](https://img.shields.io/badge/申城学联-校园服务平台-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933)
![License](https://img.shields.io/badge/License-MIT-green)

**连接申城高校，共享智慧校园**

[功能特色](#功能特色) • [快速开始](#快速开始) • [技术架构](#技术架构) • [API 文档](#api-文档) • [团队](#团队)

</div>

---

## 项目简介

**申城学联**是一个面向高校学生的综合性校园服务平台，旨在通过数字化手段提升校园生活质量，促进跨校交流协作，构建智慧化校园生态。

本项目作为演示平台，展示了现代 Web 技术在校园场景中的应用，整合了活动管理、资源共享、社交互动等核心功能，并融入 AI 智能助手提供个性化服务。

---

## 功能特色

### 🏫 校园通
- **活动公告**：校园活动发布与报名，基于标签的智能推荐
- **部门协作**：跨部门任务管理，简化工作流程
- **场馆预约**：体育馆、报告厅等场地在线预约
- **资料分享**：优质学习资源、模板工具共享
- **校园贴士**：Wiki 式校园信息库，支持用户共创

### 🛍️ 生活汇
- **二手交易**：校园内闲置物品交易平台
- **外卖代取**：便捷的代取服务对接
- **文创交易**：校园文创产品展示与销售
- **失物招领**：快速发布与查询失物信息
- **兼职平台**：家教与技能服务对接（支持校内+外部平台）

### 🌐 校际圈
- **主题社群**：基于兴趣标签的跨校社群
- **跨校项目协作**：智能匹配项目伙伴与技能需求
- **跨校私聊**：匿名匹配机制，保护隐私的社交方式

### 🤖 AI 助手"小联"
- **智能问答**：24/7 在线客服，解答平台与校园问题
- **个性化推荐**：基于用户画像的内容与服务推荐
- **流程引导**：辅助完成复杂操作（如预约、报名）
- **成长分析**：数据驱动的个人成长反馈与建议

---

## 技术架构

### 前端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19 | 核心框架 |
| **Vite** | 5.x | 构建工具 |
| **React Router** | 6.x | 路由管理 |
| **Tailwind CSS** | 3.x | 样式框架 |
| **Zustand** | latest | 状态管理 |
| **Axios** | 1.x | HTTP 客户端 |

### 后端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 20+ | 运行时环境 |
| **Express** | 4.x | Web 框架 |
| **Prisma** | 5.x | ORM |
| **SQLite** | 3.x | 数据库 |
| **JWT** | latest | 身份认证 |
| **Multer** | latest | 文件上传 |

### 项目结构
```
shencheng-xuelian/
├── frontend/           # 用户端前端（React + Tailwind CSS）
├── backend/            # 后端服务（Express + SQLite）
├── docs/               # 项目文档
│   ├── ARCHITECTURE.md         # 系统架构设计
│   ├── design-system.md        # UI 设计规范
│   ├── TEST_PLAN.md            # 测试计划
│   └── API_TEST_REPORT.md      # API 测试报告
└── README.md           # 项目说明（本文件）
```

---

## 快速开始

### 环境要求
- **Node.js**: 20.x 或更高版本
- **npm**: 10.x 或更高版本
- **Git**: 最新版本

### 安装步骤

#### 1. 克隆项目
```bash
git clone https://github.com/your-org/shencheng-xuelian.git
cd shencheng-xuelian
```

#### 2. 安装后端依赖
```bash
cd backend
npm install
```

#### 3. 配置环境变量
创建 `backend/.env` 文件：
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here
DATABASE_URL="file:./data/database.db"
```

#### 4. 初始化数据库
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

#### 5. 启动后端服务
```bash
cd backend
npm run dev
# 后端运行在 http://localhost:3000
```

#### 6. 安装前端依赖
```bash
cd frontend
npm install
```

#### 7. 启动前端服务
```bash
cd frontend
npm run dev
# 前端运行在 http://localhost:5173
```

### 开发命令速查

**后端：**
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npx prisma studio    # 打开数据库管理界面
```

**前端：**
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 代码检查
```

---

## API 文档

### 接口规范
- **基础 URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

### 核心接口

#### 认证模块
```
POST   /api/auth/register        # 用户注册
POST   /api/auth/login           # 用户登录
GET    /api/auth/profile         # 获取用户信息
PUT    /api/auth/profile         # 更新用户信息
```

#### 校园通
```
GET    /api/campus/announcements      # 获取活动公告
POST   /api/campus/announcements      # 发布公告
GET    /api/campus/collaborations     # 获取部门协作
POST   /api/campus/venues/book        # 场馆预约
GET    /api/campus/resources          # 获取资料分享
POST   /api/campus/resources          # 上传资料
GET    /api/campus/tips               # 获取校园贴士
```

#### 生活汇
```
GET    /api/life/trades               # 获取交易列表
POST   /api/life/trades               # 发布交易
GET    /api/life/orders               # 获取订单
POST   /api/life/orders               # 创建订单
GET    /api/life/lost-found           # 失物招领
GET    /api/life/jobs                 # 兼职信息
POST   /api/life/jobs/:id/apply       # 申请兼职
```

#### 校际圈
```
GET    /api/social/communities        # 获取社群
POST   /api/social/communities        # 创建社群
GET    /api/social/posts              # 获取帖子
POST   /api/social/posts              # 发布帖子
GET    /api/social/messages           # 获取消息
POST   /api/social/messages           # 发送消息
```

详细 API 文档请查看：[ARCHITECTURE.md](./ARCHITECTURE.md#四api-接口设计规范)

---

## 测试账号

### 开发环境测试账号

**管理员账号：**
```
学号/用户名: admin001
密码: admin123
权限: 系统管理员
功能: 可编辑/删除所有活动、资料、社群、生活汇内容
```

**普通学生账号：**
```
学号/用户名: student001
密码: student123
权限: 普通用户
功能: 浏览内容、发布信息、参与活动
```

**测试提示：**
- 首次运行会自动创建测试账号
- 使用管理员账号可体验完整的管理功能（编辑/删除）
- 使用普通学生账号可体验用户端功能
- 生产环境请务必修改默认密码

---

## 设计规范

### UI 设计
- **设计系统**: [design-system.md](./design-system.md)
- **主色调**: 浅蓝色系（`#4A90D9`）+ 白色
- **设计风格**: 清新、简洁、年轻化
- **圆角规范**: 4px - 12px
- **阴影系统**: 柔和阴影，提升层次感

### AI 助手"小联"
- **位置**: 页面左下角固定
- **风格**: 可爱、友好、亲和力强
- **功能**: 智能问答、个性化推荐、流程引导

---

## 测试报告

- [测试计划](./docs/TEST_PLAN.md)
- [API 测试报告](./docs/API_TEST_REPORT.md)
- [功能测试报告](./docs/FINAL_TEST_REPORT.md)

---

## 项目亮点

### 1. AI 能力内化融合
- **智能推荐引擎**: 基于用户画像的个性化内容推荐
- **智能匹配系统**: 跨校项目协作的精准伙伴匹配
- **成长导航系统**: 数据驱动的个人发展分析

### 2. 跨校协作创新
- **主题社群**: 基于标签的智能社群推荐
- **项目协作**: 多维度技能匹配，降低协作成本
- **匿名社交**: 保护隐私的跨校交流机制

### 3. 校园微生态
- **二手交易**: 校园内可信交易平台
- **技能变现**: 学生技能与需求的高效对接
- **资源共建**: Wiki 式知识库，全员参与

### 4. 技术优势
- **轻量级架构**: SQLite + Express，快速部署
- **类型安全**: Prisma ORM，减少运行时错误
- **现代化 UI**: React 19 + Tailwind CSS，开发体验优秀
- **响应式设计**: 支持桌面端、平板、手机

---

## 开发路线图

### ✅ 已完成（v1.0）
- [x] 用户认证与权限系统
- [x] 校园通核心功能（活动公告、部门协作、场馆预约、资料分享、校园贴士）
- [x] 生活汇核心功能（二手交易、外卖代取、文创交易、失物招领、兼职平台）
- [x] 校际圈核心功能（主题社群、跨校项目协作、跨校私聊）
- [x] AI 助手"小联"UI 框架
- [x] 基础管理后台

### 🚧 开发中（v1.1）
- [ ] AI 智能推荐引擎
- [ ] 实时消息推送（WebSocket）
- [ ] 移动端适配优化
- [ ] 数据可视化看板

### 📅 计划中（v2.0）
- [ ] AI 大模型接入
- [ ] 微信小程序版本
- [ ] 支付系统集成
- [ ] 数据分析平台

---

## 常见问题

### Q: 为什么选择 SQLite 而不是 MySQL/PostgreSQL？
**A**: 本项目作为演示平台，SQLite 零配置、轻量级的特点非常适合快速开发和部署。生产环境可轻松迁移至 PostgreSQL。

### Q: AI 助手"小联"何时接入大模型？
**A**: 当前版本仅实现 UI 框架，v2.0 版本计划接入大模型 API（如文心一言、通义千问等）。

### Q: 如何参与项目开发？
**A**: 欢迎提交 Issue 和 Pull Request！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)（如有）了解贡献指南。

---

## 团队成员

| 角色 | 成员 | 职责 |
|------|------|------|
| **架构师** | Architect | 系统架构设计、技术选型 |
| **前端设计师** | Frontend Designer | UI/UX 设计、设计系统 |
| **前端开发者** | Frontend Developer | React 组件开发、页面实现 |
| **后端开发者** | Backend Developer | API 开发、数据库设计 |
| **测试员** | QA Engineer | 功能测试、质量保障 |

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件

---

## 联系我们

- **项目主页**: [https://github.com/your-org/shencheng-xuelian](https://github.com/your-org/shencheng-xuelian)
- **问题反馈**: [GitHub Issues](https://github.com/your-org/shencheng-xuelian/issues)
- **邮箱**: contact@shencheng.edu

---

## 致谢

感谢所有为申城学联项目做出贡献的开发者、设计师和测试人员！

特别感谢：
- React 团队提供优秀的前端框架
- Express.js 团队提供轻量级后端解决方案
- Prisma 团队提供类型安全的 ORM
- Tailwind CSS 团队提供实用的 CSS 框架

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！⭐**

Made with ❤️ by 申城学联团队

</div>
