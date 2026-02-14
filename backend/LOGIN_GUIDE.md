# 申城学联 - 登录测试快速指南

## ✅ 系统状态：正常运行

**测试时间**: 2026-02-10
**后端服务**: http://localhost:3000
**数据库**: SQLite (backend/data/database.db)

---

## 可用测试账号

| 学号 | 密码 | 角色 | 状态 | 学校 |
|------|------|------|------|------|
| **admin001** | **admin123** | admin | active | 上海海关学院 |
| **demo001** | demo123 | student | active | 复旦大学 |
| **test001** | 123456 | student | active | 上海海关学院 |
| **newuser001** | 123456 | student | active | 上海海关学院 |

---

## 快速测试命令

### 1. 使用admin001登录（推荐）

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}'
```

**预期响应**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "student_id": "admin001",
    "nickname": "管理员",
    "role": "admin"
  }
}
```

### 2. 使用新用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"newuser001","password":"123456"}'
```

### 3. 创建新用户

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id":"your_id",
    "password":"your_password",
    "nickname":"你的昵称",
    "school":"上海海关学院"
  }'
```

---

## 前端登录

在浏览器中访问：
```
http://localhost:5173/login
```

**使用以下凭据**:
- 学号: `admin001`
- 密码: `admin123`

---

## 常见问题排查

### ❌ 401 Unauthorized

**原因**:
1. 用户名或密码错误
2. 用户不存在

**解决方法**:
```bash
# 查看所有用户
sqlite3 backend/data/database.db \
  "SELECT id, student_id, nickname, status FROM users;"

# 或创建新用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"student_id":"test002","password":"123456","nickname":"测试","school":"上海海关学院"}'
```

### ❌ 403 Forbidden

**原因**: 账号被禁用 (status != 'active')

**解决方法**:
```bash
sqlite3 backend/data/database.db \
  "UPDATE users SET status = 'active' WHERE student_id = 'your_id';"
```

### ❌ 400 Bad Request

**原因**: 缺少必填字段

**解决方法**: 确保请求包含 `Content-Type: application/json` 头

---

## 重置数据库（如果需要）

```bash
cd backend
rm data/database.db
npm run init-db
```

**注意**: 这会删除所有用户数据！

---

## 启动后端服务

```bash
cd backend
npm start
```

服务启动在: http://localhost:3000

---

## API端点

| 端点 | 方法 | 描述 |
|------|------|------|
| /api/auth/register | POST | 用户注册 |
| /api/auth/login | POST | 用户登录 |
| /api/auth/me | GET | 获取当前用户信息（需要token） |

---

## 测试示例

### 使用JWT token访问受保护路由

```bash
# 1. 登录获取token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}' \
  | jq -r '.token')

# 2. 使用token访问受保护路由
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. 获取活动列表
curl -X GET http://localhost:3000/api/activities \
  -H "Authorization: Bearer $TOKEN"
```

---

## 数据库查询示例

```bash
# 进入数据库
sqlite3 backend/data/database.db

# 查看所有用户
SELECT id, student_id, nickname, school, role, status FROM users;

# 查看特定用户
SELECT * FROM users WHERE student_id = 'admin001';

# 查看活动
SELECT id, title, type, status FROM activities;

# 查看社群
SELECT id, name, type, member_count FROM groups;

# 退出
.quit
```

---

## 注意事项

1. **密码区分大小写**
2. **学号必须唯一**
3. **JWT token有效期7天**
4. **默认用户状态为active**
5. **必需字段**: student_id, password, school

---

**文档生成**: 2026-02-10
**状态**: ✅ 所有测试通过
