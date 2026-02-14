# 登录401 Unauthorized错误调试报告

## 问题概述

**报告时间**: 2026-02-10
**问题**: 登录返回401 Unauthorized错误
**调试状态**: ✅ 已解决 - 系统工作正常

## 调试步骤与结果

### 1. 数据库用户检查

**检查内容**: 确认数据库中是否存在用户及其状态

```sql
SELECT id, student_id, nickname, status, role FROM users;
```

**结果**:
```
1|admin001|管理员|active|admin
2|demo001|演示用户|active|student
3|test001|测试|active|student
```

✅ **结论**: 数据库中存在用户，且状态均为 `active`

### 2. 密码加密验证

**检查内容**: 确认bcrypt密码哈希是否正确

**admin001用户密码**:
- 原始密码: `admin123`
- 数据库存储: `$2a$10$LZ0pqMzkMZfJJWB5Jp3GdubxhC8zCX8XR4Zwj9ZlGZeuySCFfG3fm`
- 加密方式: bcrypt (salt rounds: 10)

✅ **结论**: 密码使用bcrypt正确加密

### 3. 登录API测试

#### 测试1: 正确凭据登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}'
```

**响应**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "student_id": "admin001",
    "nickname": "管理员",
    "role": "admin",
    "status": "active"
  }
}
```

✅ **HTTP状态码**: 200
✅ **结论**: 正确凭据成功登录

#### 测试2: 错误密码登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"wrongpassword"}'
```

**响应**:
```json
{
  "error": "Invalid credentials"
}
```

✅ **HTTP状态码**: 401
✅ **结论**: 错误密码正确返回401（符合预期）

#### 测试3: 不存在的用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"nonexistent","password":"test"}'
```

**响应**:
```json
{
  "error": "Invalid credentials"
}
```

✅ **HTTP状态码**: 401
✅ **结论**: 不存在的用户正确返回401（符合预期）

### 4. 新用户注册与登录测试

#### 注册新用户

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"student_id":"test001","password":"123456","nickname":"测试","school":"上海海关学院"}'
```

**响应**:
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "student_id": "test001",
    "nickname": "测试",
    "role": "student"
  }
}
```

✅ **结论**: 新用户注册成功

#### 新用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"test001","password":"123456"}'
```

**响应**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "student_id": "test001",
    "nickname": "测试",
    "status": "active"
  }
}
```

✅ **结论**: 新用户登录成功

## 认证流程分析

### 登录认证逻辑 (backend/src/routes/auth.js:54-96)

```javascript
router.post('/login', [
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  // 1. 输入验证
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { student_id, password } = req.body;

  // 2. 查找用户
  const user = await db.prepare('SELECT * FROM users WHERE student_id = ?').get(student_id);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 3. 验证密码 (bcrypt.compareSync)
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 4. 检查用户状态
  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account is disabled' });
  }

  // 5. 生成JWT token
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });

  // 6. 返回成功响应（移除密码字段）
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: 'Login successful',
    token,
    user: userWithoutPassword
  });
});
```

### 401错误的可能原因

根据代码逻辑，返回401的情况有2种：

1. **用户不存在** (line 67-69)
   ```javascript
   if (!user) {
     return res.status(401).json({ error: 'Invalid credentials' });
   }
   ```

2. **密码错误** (line 73-75)
   ```javascript
   const validPassword = bcrypt.compareSync(password, user.password);
   if (!validPassword) {
     return res.status(401).json({ error: 'Invalid credentials' });
   }
   ```

### 403错误的可能原因

返回403的情况有1种：

1. **账号被禁用** (line 79-81)
   ```javascript
   if (user.status !== 'active') {
     return res.status(403).json({ error: 'Account is disabled' });
   }
   ```

## 测试总结

| 测试场景 | 期望状态码 | 实际状态码 | 结果 |
|---------|-----------|-----------|------|
| 正确凭据登录 | 200 | 200 | ✅ 通过 |
| 错误密码登录 | 401 | 401 | ✅ 通过 |
| 不存在的用户 | 401 | 401 | ✅ 通过 |
| 缺少必填字段 | 400 | 400 | ✅ 通过 |
| 新用户注册登录 | 200 | 200 | ✅ 通过 |

## 可用测试账号

| 学号 | 密码 | 角色 | 状态 | 学校 |
|------|------|------|------|------|
| admin001 | admin123 | admin | active | 上海海关学院 |
| demo001 | demo123 | student | active | 复旦大学 |
| test001 | 123456 | student | active | 上海海关学院 |

## 结论

### 系统状态

✅ **登录认证系统工作正常**

所有测试用例均通过，认证流程符合预期：
- ✅ bcrypt密码加密/验证正常
- ✅ JWT token生成正常（7天有效期）
- ✅ 错误处理正确（400/401/403）
- ✅ 用户状态检查正常
- ✅ 数据库查询正常

### 401错误说明

**401 Unauthorized是预期行为**，在以下情况下返回：

1. **用户不存在**: 提供的student_id在数据库中找不到
2. **密码错误**: 提供的密码与数据库中的bcrypt哈希不匹配

**这不是bug，而是正常的安全验证**。

### 如果用户遇到401错误

**排查步骤**:

1. **确认用户已注册**
   ```bash
   # 检查数据库中是否存在该用户
   sqlite3 backend/data/database.db \
     "SELECT student_id, nickname, status FROM users WHERE student_id = 'your_id';"
   ```

2. **确认密码正确**
   ```bash
   # 如果忘记密码，需要重新注册或管理员重置
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"student_id":"your_id","password":"newpass","nickname":"昵称","school":"学校"}'
   ```

3. **确认用户状态为active**
   ```bash
   # 检查用户状态
   sqlite3 backend/data/database.db \
     "SELECT student_id, status FROM users WHERE student_id = 'your_id';"
   ```

4. **确认请求格式正确**
   ```bash
   # 必须包含Content-Type头
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"student_id":"admin001","password":"admin123"}'
   ```

## 建议

### 对开发团队

1. **添加日志**: 在登录接口添加详细的日志记录
   ```javascript
   console.log('Login attempt:', { student_id, timestamp: new Date() });
   ```

2. **统一错误消息**: 考虑区分"用户不存在"和"密码错误"（虽然可能降低安全性）

3. **登录限制**: 添加登录失败次数限制，防止暴力破解

4. **密码重置**: 实现密码重置功能，方便用户找回密码

### 对前端团队

1. **错误处理**: 在前端正确处理401错误，提示用户检查用户名和密码
2. **表单验证**: 在提交前进行前端验证
3. **用户反馈**: 提供清晰的错误提示信息

## 附件

- 完整测试脚本: `/tmp/login_test.sh`
- 后端日志: 检查backend服务器控制台输出
- 数据库文件: `backend/data/database.db`

---

**报告生成**: 2026-02-10
**测试工程师**: Backend Developer
**审核状态**: ✅ 已完成
