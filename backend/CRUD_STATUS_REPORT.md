# 管理员CRUD功能状态报告

**报告时间**: 2026-02-10
**报告范围**: 活动公告、资料分享、热门社群

---

## 一、活动公告 (Activities)

### 当前API状态

| 操作 | 端点 | 方法 | 权限验证 | 状态 |
|------|------|------|---------|------|
| 创建 | /api/activities | POST | ✅ auth (任何登录用户) | ✅ 已实现 |
| 读取列表 | /api/activities | GET | ❌ 无需认证 (optionalAuth) | ✅ 已实现 |
| 读取详情 | /api/activities/:id | GET | ❌ 无需认证 (optionalAuth) | ✅ 已实现 |
| 更新 | /api/activities/:id | PUT | ❌ 未实现 | ❌ 缺失 |
| 删除 | /api/activities/:id | DELETE | ❌ 未实现 | ❌ 缺失 |

### 详细说明

#### ✅ 已实现的功能

**1. 创建活动** (POST /api/activities)
```javascript
router.post('/', auth, [
  body('title').notEmpty(),
  body('description').notEmpty(),
], async (req, res) => {
  // 任何登录用户都可以创建活动
  // 自动记录 publisher_id 为当前用户
});
```

**权限**: 任何登录用户（非仅管理员）

**2. 获取活动列表** (GET /api/activities)
```javascript
router.get('/', optionalAuth, async (req, res) => {
  // 支持筛选: type, status, school
  // 支持分页: page, limit
});
```

**权限**: 无需认证（公开访问）

**3. 获取活动详情** (GET /api/activities/:id)
```javascript
router.get('/:id', optionalAuth, async (req, res) => {
  // 返回活动详情、报名列表、当前用户是否已报名
});
```

**权限**: 无需认证（公开访问）

**4. 活动报名** (POST /api/activities/:id/register)
```javascript
router.post('/:id/register', auth, async (req, res) => {
  // 登录用户可以报名
});
```

**权限**: 任何登录用户

**5. 取消报名** (DELETE /api/activities/:id/register)
```javascript
router.delete('/:id/register', auth, async (req, res) => {
  // 登录用户可以取消报名
});
```

**权限**: 任何登录用户

#### ❌ 缺失的功能

**1. 更新活动** (PUT /api/activities/:id)
```javascript
// 未实现
// 需要: 只有创建者或管理员可以更新
```

**2. 删除活动** (DELETE /api/activities/:id)
```javascript
// 未实现
// 需要: 只有创建者或管理员可以删除
```

### 权限验证

**中间件**: `auth` - 仅验证用户登录
**管理员验证**: ❌ 未使用 `adminAuth`

**问题**:
- ❌ 任何用户都可以创建活动
- ❌ 没有管理员专属权限
- ❌ 无法区分普通用户和管理员

---

## 二、资料分享 (Listings)

### 当前API状态

| 操作 | 端点 | 方法 | 权限验证 | 状态 |
|------|------|------|---------|------|
| 创建 | /api/listings | POST | ✅ auth (任何登录用户) | ✅ 已实现 |
| 读取列表 | /api/listings | GET | ❌ 无需认证 | ✅ 已实现 |
| 读取详情 | /api/listings/:id | GET | ❌ 无需认证 | ✅ 已实现 |
| 更新 | /api/listings/:id | PUT | ✅ auth (仅创建者) | ✅ 已实现 |
| 删除 | /api/listings/:id | DELETE | ✅ auth (仅创建者) | ✅ 已实现 |

### 详细说明

#### ✅ 已实现的功能

**1. 创建交易** (POST /api/listings)
```javascript
router.post('/', auth, async (req, res) => {
  // 任何登录用户都可以发布交易
  // 自动记录 seller_id 为当前用户
});
```

**权限**: 任何登录用户

**2. 更新交易** (PUT /api/listings/:id)
```javascript
router.put('/:id', auth, async (req, res) => {
  const listing = await db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);

  // 验证权限：只有创建者可以更新
  if (listing.seller_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // 执行更新...
});
```

**权限**: ✅ 创建者或管理员

**3. 删除交易** (DELETE /api/listings/:id)
```javascript
router.delete('/:id', auth, async (req, res) => {
  const listing = await db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);

  // 验证权限：只有创建者可以删除
  if (listing.seller_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // 执行删除...
});
```

**权限**: ✅ 创建者或管理员

**4. 读取列表/详情** (GET)
```javascript
router.get('/', optionalAuth, async (req, res) => { /* ... */ });
router.get('/:id', optionalAuth, async (req, res) => { /* ... */ });
```

**权限**: 无需认证（公开访问）

### 权限验证

**中间件**: `auth` - 验证用户登录
**权限检查**: ✅ 手动验证 `req.user.role === 'admin'`

**优点**:
- ✅ 更新和删除有权限验证
- ✅ 管理员可以修改/删除任何内容
- ✅ 普通用户只能管理自己的内容

---

## 三、热门社群 (Groups)

### 当前API状态

| 操作 | 端点 | 方法 | 权限验证 | 状态 |
|------|------|------|---------|------|
| 创建 | /api/groups | POST | ✅ auth (任何登录用户) | ✅ 已实现 |
| 读取列表 | /api/groups | GET | ❌ 无需认证 | ✅ 已实现 |
| 读取详情 | /api/groups/:id | GET | ❌ 无需认证 | ✅ 已实现 |
| 更新 | /api/groups/:id | PUT | ❌ 未实现 | ❌ 缺失 |
| 删除 | /api/groups/:id | DELETE | ❌ 未实现 | ❌ 缺失 |

### 详细说明

#### ✅ 已实现的功能

**1. 创建社群** (POST /api/groups)
```javascript
router.post('/', auth, async (req, res) => {
  // 任何登录用户都可以创建社群
  // 自动记录 creator_id 为当前用户
  // 创建者自动成为 owner
});
```

**权限**: 任何登录用户

**2. 加入社群** (POST /api/groups/:id/join)
```javascript
router.post('/:id/join', auth, async (req, res) => {
  // 登录用户可以加入
});
```

**权限**: 任何登录用户

**3. 离开社群** (DELETE /api/groups/:id/leave)
```javascript
router.delete('/:id/leave', auth, async (req, res) => {
  // 成员可以离开
});
```

**权限**: 任何登录用户

**4. 读取列表/详情** (GET)
```javascript
router.get('/', optionalAuth, async (req, res) => { /* ... */ });
router.get('/:id', optionalAuth, async (req, res) => { /* ... */ });
```

**权限**: 无需认证（公开访问）

#### ❌ 缺失的功能

**1. 更新社群** (PUT /api/groups/:id)
```javascript
// 未实现
// 需要: 只有 owner 或管理员可以更新
```

**2. 删除社群** (DELETE /api/groups/:id)
```javascript
// 未实现
// 需要: 只有 owner 或管理员可以删除
```

**3. 移除成员** (DELETE /api/groups/:id/members/:userId)
```javascript
// 未实现
// 需要: 只有 owner 或管理员可以移除成员
```

### 权限验证

**中间件**: `auth` - 验证用户登录
**管理员验证**: ❌ 未使用 `adminAuth`

**问题**:
- ❌ 任何用户都可以创建社群
- ❌ 没有管理员专属权限
- ❌ 无法更新或删除社群

---

## 四、管理员权限中间件

### 当前实现

**文件**: `backend/src/middleware/auth.js`

```javascript
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { auth, optionalAuth, adminAuth, JWT_SECRET };
```

**状态**: ✅ 中间件已定义，但**未在路由中使用**

### 使用示例

**如何添加管理员权限验证**:

```javascript
const { auth, adminAuth } = require('../middleware/auth');

// 只有管理员可以访问
router.delete('/admin/activities/:id', auth, adminAuth, async (req, res) => {
  // req.user.role 保证是 'admin'
  // 执行删除操作...
});

// 创建者或管理员可以访问
router.put('/activities/:id', auth, async (req, res) => {
  const activity = await db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);

  // 检查权限
  if (activity.publisher_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // 执行更新...
});
```

---

## 五、需要添加的接口

### 活动公告 (Activities)

#### 1. 更新活动
```javascript
router.put('/:id', auth, async (req, res) => {
  const activity = await db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);

  // 权限验证
  if (activity.publisher_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // 更新字段
  const { title, description, type, location, event_time, status } = req.body;

  await db.prepare(`
    UPDATE activities
    SET title = ?, description = ?, type = ?, location = ?, event_time = ?, status = ?
    WHERE id = ?
  `).run(title, description, type, location, event_time, status, req.params.id);

  res.json({ message: 'Activity updated successfully' });
});
```

#### 2. 删除活动
```javascript
router.delete('/:id', auth, async (req, res) => {
  const activity = await db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);

  // 权限验证
  if (activity.publisher_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  await db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);

  res.json({ message: 'Activity deleted successfully' });
});
```

#### 3. 管理员专用端点
```javascript
// 管理员删除任何活动
router.delete('/admin/activities/:id', auth, adminAuth, async (req, res) => {
  await db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ message: 'Activity deleted by admin' });
});

// 管理员更新任何活动
router.put('/admin/activities/:id', auth, adminAuth, async (req, res) => {
  // 更新逻辑...
});
```

### 热门社群 (Groups)

#### 1. 更新社群
```javascript
router.put('/:id', auth, async (req, res) => {
  const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

  // 权限验证：只有 owner 或管理员
  const member = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = "owner"')
    .get(req.params.id, req.user.id);

  if (!member && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  // 更新字段
  const { name, description, tags, type } = req.body;

  await db.prepare(`
    UPDATE groups
    SET name = ?, description = ?, tags = ?, type = ?
    WHERE id = ?
  `).run(name, description, JSON.stringify(tags), type, req.params.id);

  res.json({ message: 'Group updated successfully' });
});
```

#### 2. 删除社群
```javascript
router.delete('/:id', auth, async (req, res) => {
  const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

  // 权限验证：只有 owner 或管理员
  const member = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = "owner"')
    .get(req.params.id, req.user.id);

  if (!member && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  await db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id);

  res.json({ message: 'Group deleted successfully' });
});
```

#### 3. 移除成员
```javascript
router.delete('/:id/members/:userId', auth, async (req, res) => {
  const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);

  // 权限验证：只有 owner 或管理员
  const member = await db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = "owner"')
    .get(req.params.id, req.user.id);

  if (!member && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  await db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')
    .run(req.params.id, req.params.userId);

  res.json({ message: 'Member removed successfully' });
});
```

---

## 六、权限设计建议

### 方案A: 创建者 + 管理员 (推荐)

**规则**:
- 普通用户可以创建内容
- 创建者可以修改/删除自己的内容
- 管理员可以修改/删除任何内容

**优点**:
- ✅ 用户自治
- ✅ 管理员有最终控制权
- ✅ 权限清晰

### 方案B: 仅管理员

**规则**:
- 只有管理员可以创建/修改/删除内容
- 普通用户只能查看和报名/加入

**优点**:
- ✅ 完全控制
- ✅ 防止滥用

**缺点**:
- ❌ 管理员工作量大
- ❌ 用户参与度低

### 方案C: 混合模式 (最灵活)

**公开内容** (活动、社群):
- 创建者 + 管理员可以管理

**敏感内容** (用户管理、权限):
- 仅管理员

**用户内容** (个人资料):
- 用户本人 + 管理员

---

## 七、总结

### 当前状态

| 模块 | Create | Read | Update | Delete | 管理员权限 |
|------|--------|------|--------|--------|-----------|
| 活动公告 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 资料分享 | ✅ | ✅ | ✅ | ✅ | ⚠️ 部分 |
| 热门社群 | ✅ | ✅ | ❌ | ❌ | ❌ |

### 优先级建议

#### 高优先级 (核心功能)

1. **活动更新/删除**
   - 添加 PUT /api/activities/:id
   - 添加 DELETE /api/activities/:id
   - 权限: 创建者或管理员

2. **社群更新/删除**
   - 添加 PUT /api/groups/:id
   - 添加 DELETE /api/groups/:id
   - 权限: owner 或管理员

3. **管理员专用端点**
   - 添加 /api/admin/* 路由
   - 使用 adminAuth 中间件
   - 管理员可以管理任何内容

#### 中优先级 (管理功能)

4. **成员管理**
   - 移除社群成员
   - 更新成员角色
   - 权限: owner 或管理员

5. **内容审核**
   - 批量删除
   - 批量更新状态
   - 权限: 仅管理员

#### 低优先级 (增强功能)

6. **操作日志**
   - 记录所有CRUD操作
   - 记录操作者和时间
   - 权限: 仅管理员查看

7. **批量操作**
   - 批量删除
   - 批量更新
   - 权限: 仅管理员

---

**报告生成**: 2026-02-10
**下一步**: 根据优先级添加缺失的CRUD接口
