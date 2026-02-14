# 申城学联 - 测试账号信息

**生成时间**: 2026-02-10
**后端服务**: http://localhost:3000

---

## 可用测试账号

### 1. 管理员账号

**推荐用于测试管理功能**

| 字段 | 值 |
|------|-----|
| 学号 | **admin001** |
| 密码 | **admin123** |
| 昵称 | 管理员 |
| 角色 | admin |
| 学校 | 上海海关学院 |
| 状态 | active |

**使用场景**:
- 测试管理员权限功能
- 测试所有API接口访问
- 测试用户管理功能

**登录命令**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}'
```

---

### 2. 普通学生账号

#### 账号1: demo001

| 字段 | 值 |
|------|-----|
| 学号 | **demo001** |
| 密码 | **demo123** |
| 昵称 | 演示用户 |
| 角色 | student |
| 学校 | 上海海关学院 |
| 状态 | active |

**登录命令**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"demo001","password":"demo123"}'
```

#### 账号2: test001

| 字段 | 值 |
|------|-----|
| 学号 | **test001** |
| 密码 | **123456** |
| 昵称 | 测试 |
| 角色 | student |
| 学校 | 上海海关学院 |
| 状态 | active |

**登录命令**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"test001","password":"123456"}'
```

#### 账号3: newuser001

| 字段 | 值 |
|------|-----|
| 学号 | **newuser001** |
| 密码 | **123456** |
| 昵称 | 新测试用户 |
| 角色 | student |
| 学校 | 上海海关学院 |
| 状态 | active |

**登录命令**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"newuser001","password":"123456"}'
```

#### 账号4: test123

| 字段 | 值 |
|------|-----|
| 学号 | **test123** |
| 密码 | **123456** |
| 昵称 | 测试用户 |
| 角色 | student |
| 学校 | 上海海关学院 |
| 状态 | active |

**登录命令**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"test123","password":"123456"}'
```

---

## 快速参考

### 推荐使用的账号

**测试管理员功能**: 使用 **admin001 / admin123**

**测试学生功能**: 使用 **test001 / 123456**

### 账号汇总表

| 学号 | 密码 | 角色 | 推荐用途 |
|------|------|------|---------|
| **admin001** | **admin123** | admin | 管理员功能测试 |
| demo001 | demo123 | student | 基础功能测试 |
| **test001** | **123456** | student | 学生功能测试 |
| newuser001 | 123456 | student | 新用户测试 |
| test123 | 123456 | student | 一般测试 |

---

## 前端登录测试

### 1. 打开前端应用

```bash
cd frontend
npm run dev
```

访问: http://localhost:5173

### 2. 登录页面

http://localhost:5173/login

### 3. 输入凭据

**管理员登录**:
- 学号: `admin001`
- 密码: `admin123`

**学生登录**:
- 学号: `test001`
- 密码: `123456`

---

## API测试示例

### 登录并获取Token

```bash
# 使用管理员账号登录
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

### 使用Token访问受保护路由

```bash
# 获取当前用户信息
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 获取活动列表
curl -X GET http://localhost:3000/api/activities \
  -H "Authorization: Bearer $TOKEN"

# 创建新活动
curl -X POST http://localhost:3000/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试活动",
    "description": "这是一个测试活动",
    "type": "general",
    "location": "上海海关学院"
  }'
```

---

## 注册新用户

如果需要创建新的测试账号：

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "mytest001",
    "password": "123456",
    "nickname": "我的测试账号",
    "school": "上海海关学院",
    "major": "计算机科学",
    "grade": "研一"
  }'
```

然后使用新账号登录：
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"mytest001","password":"123456"}'
```

---

## 数据库查询

查看所有用户：
```bash
sqlite3 backend/data/database.db \
  "SELECT id, student_id, nickname, role, school, status FROM users;"
```

查看特定用户：
```bash
sqlite3 backend/data/database.db \
  "SELECT * FROM users WHERE student_id = 'admin001';"
```

---

## 密码重置

如果忘记密码，可以删除用户重新注册：

```bash
# 进入数据库
sqlite3 backend/data/database.db

# 删除用户
DELETE FROM users WHERE student_id = 'admin001';

# 退出
.quit

# 重新初始化数据库
cd backend
npm run init-db
```

---

## 常见问题

### Q: 登录返回401错误？
**A**: 检查学号和密码是否正确，区分大小写

### Q: 登录返回403错误？
**A**: 用户账号被禁用，需要管理员启用

### Q: 密码忘记了？
**A**: 使用上面提供的测试账号，或重新注册

### Q: 需要更多测试账号？
**A**: 使用注册API创建新用户（参考上面的示例）

---

## 测试清单

- [ ] 使用 admin001 登录（管理员）
- [ ] 使用 test001 登录（学生）
- [ ] 测试注册新用户
- [ ] 测试错误密码登录（应返回401）
- [ ] 测试不存在的用户（应返回401）
- [ ] 测试获取用户信息
- [ ] 测试访问活动列表
- [ ] 测试创建新活动（管理员权限）

---

**文档生成**: 2026-02-10
**提供者**: Backend Developer
**状态**: ✅ 账号可用
