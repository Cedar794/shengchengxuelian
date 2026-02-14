# 申城学联 - 用户端前端

基于 React + Tailwind CSS 开发的申城学联校园综合服务平台用户端。

## 技术栈

- **框架**: React 19 + Vite 5
- **路由**: React Router 6
- **样式**: Tailwind CSS 3
- **图标**: Lucide React
- **HTTP**: Fetch API

## 功能模块

### 1. 首页 (/)
- Banner轮播展示
- 热门活动公告
- 资料分享
- 主题社群推荐
- 三大核心功能入口

### 2. 校园通 (/campus)
- 活动公告：查看最新校园活动
- 部门协作：跨部门协同办公
- 场馆预约：预约校园场馆
- 资料分享：共享学习资源
- 校园贴士：实用校园信息

### 3. 生活汇 (/life)
- 二手交易：学生物品交易
- 文创交易：文创商品交易
- 外卖代取：代取外卖服务
- 失物招领：丢失物品发布与认领
- 兼职平台：家教、技能变现

### 4. 校际圈 (/social)
- 主题社群：发现兴趣社群
- 跨校项目：参与跨校协作项目
- 匿名私聊：匿名匹配聊天

### 5. 个人中心 (/profile)
- 个人资料管理
- 我的发布
- 我的订单
- 我的消息
- 我的预约
- 通知设置

### 6. AI助手"小联"
- 左下角浮动窗口
- 智能问答（UI框架，待接入后端）
- 可爱友好的界面设计

## 配色方案

- **主色**: #4A90D9 (浅蓝色)
- **主色浅**: #7BB3E8
- **主色更浅**: #E3F0FD
- **成功色**: #52C41A
- **警告色**: #FA8C16
- **错误色**: #F5222D

## 开始使用

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口封装
│   │   └── index.js
│   ├── components/        # 组件
│   │   ├── common/        # 通用组件
│   │   │   ├── Card.jsx   # 卡片组件
│   │   │   └── ChatBot.jsx # AI助手
│   │   └── layout/        # 布局组件
│   │       └── Header.jsx # 导航栏
│   ├── contexts/          # Context
│   │   └── AuthContext.jsx # 认证上下文
│   ├── pages/             # 页面
│   │   ├── Home.jsx       # 首页
│   │   ├── Campus.jsx     # 校园通
│   │   ├── Life.jsx       # 生活汇
│   │   ├── Social.jsx     # 校际圈
│   │   ├── Profile.jsx    # 个人中心
│   │   ├── Login.jsx      # 登录
│   │   └── Register.jsx   # 注册
│   ├── App.jsx            # 主应用组件
│   ├── main.jsx           # 入口文件
│   └── index.css          # 全局样式
├── index.html
├── package.json
├── tailwind.config.js     # Tailwind 配置
└── vite.config.js         # Vite 配置
```

## 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 开发说明

### 添加新页面

1. 在 `src/pages/` 创建新页面组件
2. 在 `src/App.jsx` 中添加路由

### 添加新API

在 `src/api/index.js` 中添加新的API函数

### 修改样式

- 全局样式：`src/index.css`
- 组件样式：使用 Tailwind CSS 类名
- 自定义配置：`tailwind.config.js`

## 注意事项

- 所有路由（除首页、登录、注册外）都需要登录
- AI助手"小联"目前只有UI，需要接入后端AI服务
- 使用localStorage存储token
- 当前使用模拟数据，需要后端API完成后替换

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## License

© 2026 申城学联. All rights reserved.
