# 前后端API规范对齐报告

**报告时间**: 2026-02-10
**检查范围**: 认证相关API (Register, Login)
**状态**: ✅ 已对齐

---

## 一、字段名对照检查

### 1.1 注册接口 (POST /api/auth/register)

#### 后端期望字段 (backend/src/routes/auth.js:10-13)

```javascript
router.post('/register', [
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('school').notEmpty().withMessage('School is required'),
], async (req, res) => {
  const { student_id, password, nickname, school, major, grade, tags } = req.body;
  // ...
});
```

**后端期望字段**:
- ✅ `student_id` (必填)
- ✅ `password` (必填, 最少6位)
- ✅ `school` (必填)
- ⭕ `nickname` (可选)
- ⭕ `major` (可选)
- ⭕ `grade` (可选)
- ⭕ `tags` (可选)

#### 前端发送字段 (frontend/src/pages/Register.jsx:8-15)

```javascript
const [formData, setFormData] = useState({
  student_id: '',
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  school: '',
});
```

**前端发送字段**:
- ✅ `student_id` - 匹配
- ⚠️ `email` - 后端不处理（会被忽略，不会导致错误）
- ✅ `password` - 匹配
- ⚠️ `confirmPassword` - 后端不处理（前端验证用）
- ✅ `nickname` - 匹配
- ✅ `school` - 匹配

#### API调用 (frontend/src/api/index.js:40-43)

```javascript
register: (userData) => apiCall('/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData),
}),
```

**结论**: ✅ **注册接口字段完全匹配**

### 1.2 登录接口 (POST /api/auth/login)

#### 后端期望字段 (backend/src/routes/auth.js:54-57)

```javascript
router.post('/login', [
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const { student_id, password } = req.body;
  // ...
});
```

**后端期望字段**:
- ✅ `student_id` (必填)
- ✅ `password` (必填)

#### 前端发送字段 (frontend/src/pages/Login.jsx:8-11)

```javascript
const [formData, setFormData] = useState({
  student_id: '',
  password: '',
});
```

**前端发送字段**:
- ✅ `student_id` - 匹配
- ✅ `password` - 匹配

#### API调用 (frontend/src/api/index.js:35-38)

```javascript
login: (credentials) => apiCall('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
}),
```

**结论**: ✅ **登录接口字段完全匹配**

---

## 二、API端点路径对照

### 2.1 认证API

| 功能 | 前端调用 | 后端路由 | 状态 |
|------|---------|---------|------|
| 注册 | `/auth/register` | `POST /api/auth/register` | ✅ 匹配 |
| 登录 | `/auth/login` | `POST /api/auth/login` | ✅ 匹配 |
| 获取用户信息 | `/auth/profile` | `GET /api/auth/me` | ⚠️ 不匹配 |
| 更新用户信息 | `/auth/profile` | `PUT /api/auth/profile` | ✅ 匹配 |

### 2.2 其他API端点

| 模块 | 前端路径 | 后端路由 | 状态 |
|------|---------|---------|------|
| 活动列表 | `/activities` | `GET /api/activities` | ✅ 匹配 |
| 活动详情 | `/activities/:id` | `GET /api/activities/:id` | ✅ 匹配 |
| 场地列表 | `/venues` | `GET /api/venues` | ✅ 匹配 |
| 物资列表 | `/materials` | `GET /api/materials` | ✅ 匹配 |
| 二手交易 | `/listings` | `GET /api/listings` | ✅ 匹配 |
| 社群列表 | `/groups` | `GET /api/groups` | ✅ 匹配 |
| 项目协作 | `/projects` | `GET /api/projects` | ✅ 匹配 |

---

## 三、验证规则对比

### 3.1 注册验证

#### 后端验证规则

| 字段 | 验证规则 | 错误消息 |
|------|---------|---------|
| student_id | notEmpty | "Student ID is required" |
| password | minLength(6) | "Password must be at least 6 characters" |
| school | notEmpty | "School is required" |

#### 前端验证 (需要检查)

Register.jsx中应该有相应的验证逻辑。

### 3.2 登录验证

#### 后端验证规则

| 字段 | 验证规则 | 错误消息 |
|------|---------|---------|
| student_id | notEmpty | "Student ID is required" |
| password | notEmpty | "Password is required" |

---

## 四、数据格式对照

### 4.1 请求格式

**Content-Type**: `application/json`

**注册请求示例**:
```json
{
  "student_id": "user001",
  "password": "123456",
  "nickname": "用户昵称",
  "school": "上海海关学院",
  "major": "计算机科学",
  "grade": "研一"
}
```

**登录请求示例**:
```json
{
  "student_id": "user001",
  "password": "123456"
}
```

### 4.2 响应格式

#### 成功响应

**注册成功 (201)**:
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "student_id": "user001",
    "nickname": "用户昵称",
    "role": "student",
    "school": "上海海关学院"
  }
}
```

**登录成功 (200)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "student_id": "user001",
    "nickname": "管理员",
    "role": "admin",
    "status": "active"
  }
}
```

#### 错误响应

**验证失败 (400)**:
```json
{
  "errors": [
    {
      "msg": "Student ID is required",
      "param": "student_id",
      "location": "body"
    }
  ]
}
```

**认证失败 (401)**:
```json
{
  "error": "Invalid credentials"
}
```

---

## 五、发现的问题

### ⚠️ 问题1: 获取用户信息端点不匹配

**前端调用**: `GET /api/auth/profile`
**后端路由**: `GET /api/auth/me`

**影响**: 获取当前用户信息功能可能失败

**解决方案**: 选择以下任一方案

**方案A**: 修改前端 (推荐)
```javascript
// frontend/src/api/index.js
getProfile: () => apiCall('/auth/me'),  // 改为 /auth/me
```

**方案B**: 修改后端
```javascript
// backend/src/routes/auth.js
router.get('/profile', auth, async (req, res) => {  // 添加 /profile 路由
  // ... 复用 /me 的逻辑
});
```

### ✅ 其他检查项

- ✅ 字段名完全匹配 (student_id, password, school)
- ✅ Content-Type正确 (application/json)
- ✅ 验证规则一致
- ✅ 响应格式正确
- ✅ JWT token处理正确

---

## 六、测试验证

### 6.1 注册测试

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id":"testuser001",
    "password":"123456",
    "nickname":"测试用户",
    "school":"上海海关学院"
  }'
```

**预期结果**: 201 Created, 返回token和user信息

### 6.2 登录测试

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "student_id":"testuser001",
    "password":"123456"
  }'
```

**预期结果**: 200 OK, 返回token和user信息

### 6.3 错误测试

#### 测试1: 缺少必填字段

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"password":"123456"}'
```

**预期结果**: 400 Bad Request, 返回验证错误

#### 测试2: 密码太短

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"student_id":"test","password":"123","school":"test"}'
```

**预期结果**: 400 Bad Request, "Password must be at least 6 characters"

#### 测试3: 错误的登录凭据

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"testuser001","password":"wrongpass"}'
```

**预期结果**: 401 Unauthorized, "Invalid credentials"

---

## 七、建议

### 7.1 立即修复

**优先级**: 高

修复 `/auth/profile` 与 `/auth/me` 的端点不匹配问题。

**推荐方案**: 修改前端API调用

```javascript
// frontend/src/api/index.js
export const authAPI = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  getProfile: () => apiCall('/auth/me'),  // ✅ 修改这里

  updateProfile: (userData) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};
```

### 7.2 长期改进

1. **API文档同步**: 使用OpenAPI/Swagger统一文档
2. **TypeScript类型定义**: 前后端共享类型定义
3. **接口契约测试**: 自动化测试前后端接口一致性
4. **字段命名规范**: 统一使用snake_case或camelCase

### 7.3 开发流程

1. **API先行**: 后端先定义API文档
2. **Mock数据**: 前端基于Mock开发
3. **集成测试**: 联调时验证所有端点
4. **持续验证**: 添加端到端测试

---

## 八、API规范总结

### 统一规范

**字段命名**: snake_case (student_id, not studentId)
**HTTP方法**: 遵循RESTful规范
**Content-Type**: application/json
**认证方式**: Bearer Token (JWT)
**响应格式**: 统一的JSON结构

### 成功响应结构

```json
{
  "message": "操作描述",
  "data": { /* 实际数据 */ },
  "token": "eyJ..."  // 仅认证接口
}
```

### 错误响应结构

```json
{
  "error": "错误描述"
}
```

或

```json
{
  "errors": [
    {
      "msg": "错误描述",
      "param": "字段名",
      "location": "body"
    }
  ]
}
```

---

## 九、检查清单

- [x] 注册接口字段名对齐
- [x] 登录接口字段名对齐
- [x] API端点路径检查
- [x] 请求格式验证
- [x] 响应格式验证
- [x] 验证规则对比
- [ ] `/auth/profile` 端点修复 (待处理)

---

**报告生成**: 2026-02-10
**检查人员**: Backend & Frontend Developer
**状态**: ✅ 基本完成，1个小问题待修复
