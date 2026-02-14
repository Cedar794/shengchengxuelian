# 申城学联 - 组件库设计文档

## 1. 组件库概述

本文档定义"申城学联"平台的所有可复用UI组件，确保设计一致性和开发效率。

**组件分类：**
- 基础组件（Basic）：按钮、输入框、图标等
- 布局组件（Layout）：导航、卡片、列表等
- 业务组件（Business）：针对特定业务场景的组件
- 反馈组件（Feedback）：提示、弹窗、加载等

---

## 2. 基础组件

### 2.1 Button 按钮

#### 变体
```html
<!-- Primary Button -->
<button class="btn btn-primary">提交</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">取消</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">查看详情</button>

<!-- Danger Button -->
<button class="btn btn-danger">删除</button>

<!-- Disabled Button -->
<button class="btn btn-primary" disabled>禁用</button>
```

#### 尺寸
```html
<button class="btn btn-primary btn-sm">小按钮</button>
<button class="btn btn-primary">默认按钮</button>
<button class="btn btn-primary btn-lg">大按钮</button>
```

#### 带图标
```html
<button class="btn btn-primary">
  <i class="icon icon-plus"></i>
  新建
</button>

<button class="btn btn-ghost btn-icon">
  <i class="icon icon-search"></i>
</button>
```

#### 规格
- `btn-sm`: 高度 28px, 内边距 4px 12px, 字号 12px
- `btn-md`: 高度 36px, 内边距 8px 16px, 字号 14px
- `btn-lg`: 高度 44px, 内边距 12px 24px, 字号 16px

---

### 2.2 Input 输入框

#### 基础输入框
```html
<input type="text" class="input" placeholder="请输入内容">
```

#### 带标签
```html
<div class="form-item">
  <label class="form-label">活动标题 <span class="required">*</span></label>
  <input type="text" class="input" placeholder="请输入活动标题">
</div>
```

#### 状态变体
```html
<!-- 默认 -->
<input type="text" class="input" placeholder="默认状态">

<!-- 聚焦 -->
<input type="text" class="input input-focus" placeholder="聚焦状态">

<!-- 错误 -->
<input type="text" class="input input-error" value="错误内容">
<span class="form-error">标题不能为空</span>

<!-- 禁用 -->
<input type="text" class="input" disabled value="禁用内容">
```

#### 带图标
```html
<div class="input-wrapper">
  <i class="icon icon-search input-icon"></i>
  <input type="text" class="input input-with-icon" placeholder="搜索...">
</div>
```

#### 规格
- 高度：36px
- 内边距：8px 12px
- 边框：1px solid `#E0E6ED`
- 圆角：4px

---

### 2.3 Select 选择器

```html
<select class="select">
  <option>请选择分类</option>
  <option>学习资料</option>
  <option>生活用品</option>
  <option>数码产品</option>
</select>
```

#### 规格
- 与 Input 保持一致的高度和样式
- 下拉箭头图标在右侧

---

### 2.4 Checkbox 复选框

```html
<label class="checkbox">
  <input type="checkbox" class="checkbox-input">
  <span class="checkbox-label">我已阅读并同意用户协议</span>
</label>
```

#### 规格
- 尺寸：16px × 16px
- 选中背景：`#4A90D9`
- 选中图标：白色对钩

---

### 2.5 Radio 单选框

```html
<div class="radio-group">
  <label class="radio">
    <input type="radio" name="category" value="1" class="radio-input">
    <span class="radio-label">公开</span>
  </label>
  <label class="radio">
    <input type="radio" name="category" value="2" class="radio-input">
    <span class="radio-label">私密</span>
  </label>
</div>
```

---

### 2.6 Tag 标签

#### 变体
```html
<span class="tag tag-default">默认标签</span>
<span class="tag tag-primary">蓝色标签</span>
<span class="tag tag-success">报名中</span>
<span class="tag tag-warning">待审核</span>
<span class="tag tag-danger">热门</span>
<span class="tag tag-hot">HOT</span>
```

#### 可关闭
```html
<span class="tag tag-primary">
  Python
  <i class="icon icon-close tag-close"></i>
</span>
```

#### 规格
- 内边距：4px 8px
- 圆角：4px
- 字号：12px
- 行高：1.5

---

### 2.7 Icon 图标

```html
<!-- 默认 -->
<i class="icon icon-home"></i>

<!-- 尺寸 -->
<i class="icon icon-sm icon-user"></i>
<i class="icon icon-md icon-user"></i>
<i class="icon icon-lg icon-user"></i>

<!-- 颜色 -->
<i class="icon icon-primary icon-star"></i>
<i class="icon icon-success icon-check"></i>
<i class="icon icon-danger icon-close"></i>
```

#### 常用图标列表
| 图标类名 | 用途 | 图标类名 | 用途 |
|---------|------|---------|------|
| `icon-home` | 首页 | `icon-search` | 搜索 |
| `icon-user` | 用户 | `icon-setting` | 设置 |
| `icon-heart` | 收藏 | `icon-edit` | 编辑 |
| `icon-delete` | 删除 | `icon-close` | 关闭 |
| `icon-plus` | 添加 | `icon-minus` | 减少 |
| `icon-check` | 确认 | `icon-arrow-right` | 右箭头 |
| `icon-arrow-left` | 左箭头 | `icon-arrow-down` | 下箭头 |
| `icon-calendar` | 日历 | `icon-clock` | 时间 |
| `icon-location` | 位置 | `icon-phone` | 电话 |
| `icon-download` | 下载 | `icon-upload` | 上传 |
| `icon-image` | 图片 | `icon-file` | 文件 |

---

### 2.8 Avatar 头像

```html
<!-- 默认 -->
<img class="avatar" src="avatar.png" alt="用户头像">

<!-- 尺寸 -->
<img class="avatar avatar-sm" src="avatar.png">
<img class="avatar avatar-md" src="avatar.png">
<img class="avatar avatar-lg" src="avatar.png">

<!-- 带状态 -->
<div class="avatar-wrapper">
  <img class="avatar" src="avatar.png">
  <span class="avatar-status avatar-online"></span>
</div>
```

#### 规格
- `avatar-sm`: 24px × 24px
- `avatar-md`: 40px × 40px
- `avatar-lg`: 64px × 64px
- 圆角：50%

---

### 2.9 Badge 徽章

```html
<!-- 数字徽章 -->
<div class="badge-wrapper">
  <i class="icon icon-bell"></i>
  <span class="badge">5</span>
</div>

<!-- 状态点 -->
<span class="badge-dot badge-success"></span>
<span class="badge-dot badge-warning"></span>
```

---

## 3. 布局组件

### 3.1 Navbar 顶部导航栏

```html
<nav class="navbar">
  <div class="navbar-container">
    <!-- Logo -->
    <a class="navbar-brand" href="/">
      <img src="logo.png" alt="申城学联">
    </a>

    <!-- 导航菜单 -->
    <ul class="navbar-menu">
      <li class="navbar-item active">
        <a class="navbar-link" href="/">首页</a>
      </li>
      <li class="navbar-item">
        <a class="navbar-link" href="/campus">校园通</a>
      </li>
      <li class="navbar-item">
        <a class="navbar-link" href="/market">生活汇</a>
      </li>
      <li class="navbar-item">
        <a class="navbar-link" href="/community">校际圈</a>
      </li>
    </ul>

    <!-- 右侧操作 -->
    <div class="navbar-actions">
      <button class="btn btn-ghost btn-icon">
        <i class="icon icon-search"></i>
      </button>
      <a class="navbar-link" href="/login">登录</a>
      <a class="btn btn-primary btn-sm">注册</a>
    </div>
  </div>
</nav>
```

#### 规格
- 高度：56px
- 背景色：`#FFFFFF`
- 阴影：`0 1px 4px rgba(0, 0, 0, 0.05)`
- 导航项间距：32px

---

### 3.2 Sidebar 侧边栏

```html
<aside class="sidebar">
  <div class="sidebar-menu">
    <div class="sidebar-group">
      <div class="sidebar-title">校园通</div>
      <a class="sidebar-item active" href="/campus/activities">
        <i class="icon icon-calendar sidebar-icon"></i>
        活动公告
      </a>
      <a class="sidebar-item" href="/campus/collaboration">
        <i class="icon icon-users sidebar-icon"></i>
        部门协作
      </a>
      <a class="sidebar-item" href="/campus/venue">
        <i class="icon icon-building sidebar-icon"></i>
        场馆预约
      </a>
      <a class="sidebar-item" href="/campus/materials">
        <i class="icon icon-file sidebar-icon"></i>
        资料分享
      </a>
      <a class="sidebar-item" href="/campus/tips">
        <i class="icon icon-lightbulb sidebar-icon"></i>
        校园贴士
      </a>
    </div>
  </div>
</aside>
```

#### 规格
- 宽度：200px
- 背景：`#FAFBFC`
- 菜单项高度：40px

---

### 3.3 Card 卡片

#### 内容卡片
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">卡片标题</h3>
    <button class="btn btn-ghost btn-icon btn-sm">
      <i class="icon icon-more"></i>
    </button>
  </div>
  <div class="card-body">
    <p class="card-text">卡片内容...</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-ghost btn-sm">查看详情</button>
  </div>
</div>
```

#### 图片卡片
```html
<div class="card card-image">
  <img class="card-image-top" src="cover.jpg" alt="封面">
  <div class="card-body">
    <h4 class="card-title">活动标题</h4>
    <p class="card-meta">
      <i class="icon icon-clock"></i>
      2026-04-25 14:00
    </p>
    <p class="card-desc">活动简介...</p>
  </div>
</div>
```

#### 规格
- 圆角：8px
- 阴影：`0 2px 8px rgba(0, 0, 0, 0.08)`
- 内边距：16px
- 悬停阴影：`0 4px 16px rgba(0, 0, 0, 0.12)`

---

### 3.4 List 列表

```html
<ul class="list">
  <li class="list-item">
    <div class="list-item-content">
      <h4 class="list-item-title">列表项标题</h4>
      <p class="list-item-desc">列表项描述</p>
    </div>
    <i class="icon icon-arrow-right list-item-arrow"></i>
  </li>
</ul>
```

#### 规格
- 列表项高度：64px
- 内边距：12px 16px
- 分割线：1px solid `#E0E6ED`

---

### 3.5 Tabs 标签页

```html
<div class="tabs">
  <div class="tabs-nav">
    <button class="tabs-tab active">全部公告</button>
    <button class="tabs-tab">精准推送</button>
    <button class="tabs-tab">我的活动</button>
  </div>
  <div class="tabs-content">
    <div class="tabs-pane active">
      内容区域...
    </div>
  </div>
</div>
```

#### 规格
- Tab 高度：40px
- 内边距：0 16px
- 激活下划线：2px solid `#4A90D9`

---

### 3.6 Pagination 分页

```html
<div class="pagination">
  <button class="pagination-item pagination-prev" disabled>
    <i class="icon icon-arrow-left"></i>
  </button>
  <button class="pagination-item active">1</button>
  <button class="pagination-item">2</button>
  <button class="pagination-item">3</button>
  <span class="pagination-ellipsis">...</span>
  <button class="pagination-item">10</button>
  <button class="pagination-item pagination-next">
    <i class="icon icon-arrow-right"></i>
  </button>
</div>
```

---

### 3.7 Breadcrumb 面包屑

```html
<nav class="breadcrumb">
  <a class="breadcrumb-item" href="/">首页</a>
  <span class="breadcrumb-separator">/</span>
  <a class="breadcrumb-item" href="/campus">校园通</a>
  <span class="breadcrumb-separator">/</span>
  <span class="breadcrumb-item active">活动公告</span>
</nav>
```

---

## 4. 业务组件

### 4.1 ActivityCard 活动卡片

```html
<div class="activity-card">
  <div class="activity-image">
    <img src="activity.jpg" alt="活动封面">
    <span class="activity-status activity-open">报名中</span>
  </div>
  <div class="activity-body">
    <h4 class="activity-title">第三十六届申城高校联合运动会</h4>
    <div class="activity-meta">
      <span class="activity-time">
        <i class="icon icon-clock"></i>
        2026-04-25 09:00
      </span>
      <span class="activity-location">
        <i class="icon icon-location"></i>
        上海海关学院体育场
      </span>
    </div>
    <p class="activity-desc">本届运动会由上海海关学院主办，共设12个大项...</p>
  </div>
  <div class="activity-footer">
    <span class="activity-participants">328人已报名</span>
    <button class="btn btn-primary btn-sm">立即报名</button>
  </div>
</div>
```

---

### 4.2 ProductCard 商品卡片

```html
<div class="product-card">
  <div class="product-image">
    <img src="product.jpg" alt="商品图片">
    <span class="product-tag product-second">二手</span>
  </div>
  <div class="product-body">
    <h4 class="product-title">九成新《管理学》教材</h4>
    <div class="product-meta">
      <span class="product-price">¥30</span>
      <span class="product-campus">上海海关学院</span>
    </div>
    <div class="product-footer">
      <span class="product-seller">卖家：张同学</span>
      <button class="btn btn-primary btn-sm">我想要</button>
    </div>
  </div>
</div>
```

---

### 4.3 CommunityCard 社群卡片

```html
<div class="community-card">
  <div class="community-header">
    <img class="community-avatar" src="group.jpg" alt="社群头像">
    <div class="community-info">
      <h4 class="community-name">Python数据分析学习小组</h4>
      <span class="community-tags">
        <span class="tag tag-default">编程</span>
        <span class="tag tag-default">数据科学</span>
      </span>
    </div>
  </div>
  <div class="community-body">
    <p class="community-topic">近期话题：爬虫实战、数据可视化案例分享</p>
    <div class="community-stats">
      <span class="community-members">
        <i class="icon icon-users"></i>
        127人
      </span>
      <span class="community-schools">来自8所高校</span>
    </div>
  </div>
  <div class="community-footer">
    <button class="btn btn-primary btn-block">加入社群</button>
  </div>
</div>
```

---

### 4.4 MaterialCard 资料卡片

```html
<div class="material-card">
  <div class="material-icon">
    <i class="icon icon-file-pdf"></i>
  </div>
  <div class="material-body">
    <h4 class="material-title">"挑战杯"竞赛全流程指南（2026版）</h4>
    <div class="material-meta">
      <span class="material-type">PDF文档</span>
      <span class="material-size">12.5 MB</span>
    </div>
    <div class="material-stats">
      <span class="material-downloads">
        <i class="icon icon-download"></i>
        1247次下载
      </span>
    </div>
    <p class="material-desc">涵盖选题、组队、申报、答辩全环节...</p>
  </div>
  <div class="material-footer">
    <button class="btn btn-primary btn-sm">下载资料</button>
  </div>
</div>
```

---

### 4.5 VenueCard 场馆预约卡片

```html
<div class="venue-card">
  <div class="venue-header">
    <h4 class="venue-name">体育馆 - 篮球场</h4>
    <span class="venue-status venue-available">可预约</span>
  </div>
  <div class="venue-body">
    <div class="venue-time-slots">
      <span class="time-slot available">09:00-10:00</span>
      <span class="time-slot available">10:00-11:00</span>
      <span class="time-slot booked">14:00-15:00</span>
      <span class="time-slot available">15:00-16:00</span>
    </div>
    <p class="venue-rule">每人每周最多预约3小时，支持提前7天预约</p>
  </div>
  <div class="venue-footer">
    <button class="btn btn-primary btn-sm">选择时段</button>
  </div>
</div>
```

---

### 4.6 ChatBubble 聊天气泡

```html
<!-- 用户消息 -->
<div class="chat-message chat-message-user">
  <div class="chat-bubble chat-bubble-user">
    <p class="chat-text">你好，请问有哪些校园活动？</p>
    <span class="chat-time">14:30</span>
  </div>
  <img class="chat-avatar" src="user.jpg" alt="用户">
</div>

<!-- AI消息 -->
<div class="chat-message chat-message-ai">
  <img class="chat-avatar chat-avatar-xiaolian" src="xiaolian.png" alt="小联">
  <div class="chat-bubble chat-bubble-ai">
    <p class="chat-text">你好呀！我是小联～最近有很多精彩活动哦！</p>
    <span class="chat-time">14:30</span>
  </div>
</div>
```

#### 规格
- 用户气泡：背景 `#4A90D9`，文字白色，右对齐
- AI气泡：背景 `#F5F7FA`，文字深色，左对齐

---

### 4.7 CollaborationCard 协作项目卡片

```html
<div class="collaboration-card">
  <div class="collaboration-header">
    <h4 class="collaboration-title">校园安全月线上协作项目</h4>
    <span class="collaboration-status progress">进行中</span>
  </div>
  <div class="collaboration-progress">
    <div class="progress-bar">
      <div class="progress-fill" style="width: 60%"></div>
    </div>
    <span class="progress-text">12/20 任务完成</span>
  </div>
  <div class="collaboration-departments">
    <span class="department-tag">学工部</span>
    <span class="department-tag">后勤处</span>
    <span class="department-tag">保卫处</span>
  </div>
  <div class="collaboration-footer">
    <button class="btn btn-primary btn-sm">查看详情</button>
  </div>
</div>
```

---

## 5. 反馈组件

### 5.1 Toast 消息提示

```html
<!-- 成功 -->
<div class="toast toast-success">
  <i class="icon icon-check-circle"></i>
  <span>操作成功</span>
</div>

<!-- 错误 -->
<div class="toast toast-error">
  <i class="icon icon-close-circle"></i>
  <span>操作失败，请重试</span>
</div>

<!-- 警告 -->
<div class="toast toast-warning">
  <i class="icon icon-warning-circle"></i>
  <span>请注意检查输入</span>
</div>

<!-- 信息 -->
<div class="toast toast-info">
  <i class="icon icon-info-circle"></i>
  <span>提示信息</span>
</div>
```

---

### 5.2 Modal 弹窗

```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">弹窗标题</h3>
      <button class="modal-close">
        <i class="icon icon-close"></i>
      </button>
    </div>
    <div class="modal-body">
      <p>弹窗内容...</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">取消</button>
      <button class="btn btn-primary">确认</button>
    </div>
  </div>
</div>
```

---

### 5.3 Loading 加载

```html
<!-- Spinner -->
<div class="loading-spinner"></div>

<!-- 带文字 -->
<div class="loading-wrapper">
  <div class="loading-spinner"></div>
  <p class="loading-text">加载中...</p>
</div>

<!-- 按钮加载 -->
<button class="btn btn-primary btn-loading">
  <div class="loading-spinner loading-sm"></div>
  提交中...
</button>
```

---

### 5.4 Empty 空状态

```html
<div class="empty">
  <img class="empty-image" src="empty.png" alt="暂无数据">
  <p class="empty-title">暂无内容</p>
  <p class="empty-desc">还没有发布任何内容哦～</p>
  <button class="btn btn-primary">立即发布</button>
</div>
```

---

## 6. 复合组件

### 6.1 SearchBar 搜索栏

```html
<div class="search-bar">
  <div class="search-input-wrapper">
    <i class="icon icon-search search-icon"></i>
    <input type="text" class="search-input" placeholder="搜索活动、资料、社群...">
    <button class="search-btn">搜索</button>
  </div>
  <div class="search-filters">
    <span class="filter-tag active">全部</span>
    <span class="filter-tag">活动</span>
    <span class="filter-tag">资料</span>
    <span class="filter-tag">社群</span>
  </div>
</div>
```

---

### 6.2 FilterBar 筛选栏

```html
<div class="filter-bar">
  <div class="filter-group">
    <span class="filter-label">分类：</span>
    <div class="filter-options">
      <button class="filter-option active">全部</button>
      <button class="filter-option">学习资料</button>
      <button class="filter-option">生活用品</button>
      <button class="filter-option">数码产品</button>
    </div>
  </div>
  <div class="filter-group">
    <span class="filter-label">状态：</span>
    <div class="filter-options">
      <button class="filter-option active">全部</button>
      <button class="filter-option">交易中</button>
      <button class="filter-option">已完成</button>
    </div>
  </div>
</div>
```

---

### 6.3 Carousel 轮播图

```html
<div class="carousel">
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="banner1.jpg" alt="Banner 1">
      <div class="carousel-caption">
        <h3>欢迎来到申城学联</h3>
        <p>连接申城高校，共享智慧校园</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="banner2.jpg" alt="Banner 2">
    </div>
  </div>
  <button class="carousel-control carousel-prev">
    <i class="icon icon-arrow-left"></i>
  </button>
  <button class="carousel-control carousel-next">
    <i class="icon icon-arrow-right"></i>
  </button>
  <div class="carousel-indicators">
    <span class="indicator active"></span>
    <span class="indicator"></span>
    <span class="indicator"></span>
  </div>
</div>
```

---

### 6.4 CommentList 评论列表

```html
<div class="comment-list">
  <div class="comment-item">
    <img class="comment-avatar" src="user1.jpg" alt="用户">
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author">张同学</span>
        <span class="comment-time">2小时前</span>
      </div>
      <p class="comment-text">这个活动很有意义，期待参加！</p>
      <div class="comment-actions">
        <button class="comment-action">
          <i class="icon icon-heart"></i>
          12
        </button>
        <button class="comment-action">回复</button>
      </div>
    </div>
  </div>
</div>
```

---

## 7. AI助手"小联"专属组件

### 7.1 FloatingButton 浮动按钮

```html
<button class="fab fab-xiaolian">
  <img class="fab-icon" src="xiaolian-face.png" alt="小联">
  <span class="fab-label">点我帮忙</span>
</button>
```

#### 规格
- 尺寸：56px × 56px
- 位置：固定左下角（24px, 24px）
- 背景：渐变 `linear-gradient(135deg, #4A90D9, #7BB3E8)`
- 阴影：`0 4px 16px rgba(74, 144, 217, 0.4)`
- 动画：脉冲效果（3秒循环）

---

### 7.2 ChatWindow 聊天窗口

```html
<div class="chat-window">
  <!-- 头部 -->
  <div class="chat-header">
    <div class="chat-header-info">
      <img class="chat-avatar" src="xiaolian.png" alt="小联">
      <div>
        <h4 class="chat-title">小联</h4>
        <span class="chat-status">在线</span>
      </div>
    </div>
    <button class="chat-close">
      <i class="icon icon-close"></i>
    </button>
  </div>

  <!-- 消息区 -->
  <div class="chat-messages">
    <div class="chat-date">今天 14:30</div>
    <div class="chat-message chat-message-ai">
      <img class="chat-avatar" src="xiaolian.png" alt="小联">
      <div class="chat-bubble chat-bubble-ai">
        <p class="chat-text">嗨！我是小联～有什么可以帮你的吗？😊</p>
      </div>
    </div>
  </div>

  <!-- 快捷操作 -->
  <div class="chat-quick-actions">
    <button class="quick-action">查询活动</button>
    <button class="quick-action">预约场馆</button>
    <button class="quick-action">寻找社群</button>
  </div>

  <!-- 输入区 -->
  <div class="chat-input-area">
    <button class="chat-action-btn">
      <i class="icon icon-plus"></i>
    </button>
    <input type="text" class="chat-input" placeholder="输入消息...">
    <button class="chat-send-btn">
      <i class="icon icon-send"></i>
    </button>
  </div>
</div>
```

#### 规格
- 尺寸：380px × 520px
- 圆角：12px
- 阴影：`0 8px 32px rgba(0, 0, 0, 0.15)`
- 头部渐变背景：`linear-gradient(135deg, #4A90D9, #7BB3E8)`

---

### 7.3 XiaoLianAvatar 小联头像

```html
<!-- 基础头像 -->
<img class="xiaolian-avatar" src="xiaolian.png" alt="小联">

<!-- 带表情状态 -->
<div class="xiaolian-avatar-wrapper">
  <img class="xiaolian-avatar" src="xiaolian.png" alt="小联">
  <span class="xiaolian-expression xiaolian-happy">😊</span>
</div>
```

#### 小联表情包
- 😊 开心（默认）
- 🤔 思考
- 😮 惊讶
- 🎉 庆祝
- 💡 灵感
- ❤️ 感谢

---

## 8. 页面模板组件

### 8.1 PageHeader 页面头部

```html
<div class="page-header">
  <div class="page-header-content">
    <h1 class="page-title">活动公告</h1>
    <p class="page-subtitle">发现精彩校园活动，参与即有机会赢取奖品</p>
  </div>
  <div class="page-header-actions">
    <button class="btn btn-primary">
      <i class="icon icon-plus"></i>
      发布活动
    </button>
  </div>
</div>
```

---

### 8.2 PageLayout 页面布局

```html
<div class="page-layout">
  <!-- 侧边栏 -->
  <aside class="page-sidebar">
    <nav class="sidebar-menu">...</nav>
  </aside>

  <!-- 主内容区 -->
  <main class="page-main">
    <div class="page-header">...</div>
    <div class="page-content">
      <!-- 内容 -->
    </div>
  </main>
</div>
```

---

## 9. 组件使用指南

### 9.1 命名规范

- BEM方法论：Block__Element--Modifier
- 示例：`card__title--large`

### 9.2 组件组合

```html
<!-- 卡片 + 标签 + 按钮 -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">活动标题</h3>
    <span class="tag tag-hot">HOT</span>
  </div>
  <div class="card-body">...</div>
  <div class="card-footer">
    <button class="btn btn-primary btn-sm">立即报名</button>
  </div>
</div>
```

### 9.3 响应式处理

```html
<!-- 移动端隐藏 -->
<div class="d-none d-md-block">桌面端显示</div>

<!-- 移动端显示 -->
<div class="d-md-none">移动端显示</div>
```

---

## 10. 组件状态管理

### 10.1 加载状态

所有数据加载组件应支持加载状态：
- 骨架屏
- Spinner
- 进度条

### 10.2 错误状态

```html
<div class="error-state">
  <img class="error-image" src="error.png" alt="加载失败">
  <p class="error-title">加载失败</p>
  <p class="error-desc">网络连接异常，请稍后重试</p>
  <button class="btn btn-primary">重新加载</button>
</div>
```

---

## 11. 组件可访问性

### 11.1 ARIA标签

```html
<button aria-label="关闭对话框">
  <i class="icon icon-close"></i>
</button>

<nav aria-label="主导航">
  <ul>...</ul>
</nav>
```

### 11.2 键盘导航

- Tab 键遍历
- Enter/Space 激活
- Esc 关闭弹窗

---

## 12. 组件性能优化

### 12.1 懒加载

```html
<img src="placeholder.jpg" data-src="actual.jpg" class="lazy">
```

### 12.2 虚拟滚动

长列表组件应使用虚拟滚动优化性能。

---

## 13. 版本历史

| 版本 | 日期 | 修订内容 | 修订人 |
|-----|------|---------|--------|
| v1.0 | 2026-02-10 | 初始版本，定义核心组件 | Frontend Designer |

---

**备注**：本组件库遵循 design-system.md 中定义的设计规范，确保视觉一致性。所有组件均采用浅蓝色为主色调，符合校园用户群体的审美需求。
