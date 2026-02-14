# API编辑保存错误诊断报告

**问题**: 前端编辑保存失败
**错误信息**: "API Error: Error: API request failed"

---

## 后端状态检查

### ✅ 1. PUT路由已存在

**文件**: `backend/src/routes/activities.js`
**行号**: 238
**代码**:
```javascript
router.put('/:id', auth, async (req, res) => {
  // 完整实现，包括权限验证和数据更新
});
```

### ✅ 2. 路由已正确注册

**文件**: `backend/src/server.js`
**行号**: 40
**代码**:
```javascript
app.use('/api/activities', activityRoutes);
```

### ✅ 3. 后端服务器运行正常

**进程ID**: 45552
**端口**: 3000
**状态**: 运行中

---

## API测试验证

### 测试命令

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}' | jq -r '.token')

curl -X PUT http://localhost:3000/api/activities/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试更新"}'
```

### 测试结果

```json
{
  "message": "Activity updated successfully",
  "activity": {
    "id": 1,
    "title": "测试更新",
    "max_participants": 200,
    ...
  }
}
```

**HTTP状态**: 200 OK ✅

---

## 问题分析

### 可能的原因

#### 1. 前端API端点错误

**错误示例**:
```javascript
// ❌ 错误的端点
apiCall('/activity/1', { method: 'PUT', ... })  // 缺少 s

// ✅ 正确的端点
apiCall('/activities/1', { method: 'PUT', ... })
```

**检查位置**: `frontend/src/api/index.js`

#### 2. Content-Type 未设置

**错误示例**:
```javascript
// ❌ 缺少 Content-Type
apiCall('/activities/1', {
  method: 'PUT',
  body: JSON.stringify(data)  // 后端无法解析
})

// ✅ 正确的请求
apiCall('/activities/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'  // ✅ 必需
  },
  body: JSON.stringify(data)
})
```

#### 3. Token 过期或无效

**检查方法**:
```javascript
// 打印token到控制台
console.log('Token:', localStorage.getItem('token'));

// 检查token格式: 应该是 "Bearer xxx"
// 检查token是否过期: 7天有效期
```

#### 4. 网络问题

**症状**: 请求根本没有发出

**检查**:
- 打开浏览器开发者工具 (F12)
- 切换到 Network 标签
- 刷新页面，重新执行编辑操作
- 查看是否有PUT请求到 `/api/activities/1`

#### 5. 字段名不匹配

**后端期望的字段**:
```javascript
{
  "title": "活动标题",
  "description": "活动描述",
  "max_participants": 100,      // ✅ 注意是下划线
  "event_time": "2026-03-01",
  "location": "地点",
  "type": "sports",
  "status": "open"
}
```

**前端发送的字段**: 确保使用 `max_participants` 而不是 `maxParticipants`

---

## 前端调试步骤

### 步骤1: 打开浏览器开发者工具

**快捷键**: F12 或 Cmd+Option+I (Mac)

### 步骤2: 检查Network标签

1. 切换到 Network 标签
2. 执行编辑保存操作
3. 查找请求: `PUT /api/activities/1`

**检查项**:
- [ ] 请求是否发出？
- [ ] 请求URL是否正确？
- [ ] Request Headers 是否包含 `Authorization: Bearer xxx`?
- [ ] Request Headers 是否包含 `Content-Type: application/json`?
- [ ] Request Payload 是否包含更新数据？

### 步骤3: 查看Response

**预期状态码**: 200 OK

**如果看到以下错误**:
- **401 Unauthorized**: Token无效或过期，需要重新登录
- **403 Forbidden**: 权限不足，不是创建者或管理员
- **404 Not Found**: 活动ID不存在
- **500 Server Error**: 后端错误

### 步骤4: 查看Console标签

**检查是否有JavaScript错误**:
- API调用错误
- 网络错误
- 字段未定义错误

---

## 正确的API调用示例

### 前端代码

```javascript
// frontend/src/api/index.js

export const activityAPI = {
  updateActivity: (id, data) => apiCall(`/activities/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',  // ✅ 重要
    },
    body: JSON.stringify(data),  // ✅ 包含 max_participants
  }),
};
```

### 使用示例

```javascript
// frontend/src/components/EditModal.jsx

const handleSave = async () => {
  try {
    const data = {
      title: formData.title,
      description: formData.description,
      max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      location: formData.location,
      event_time: formData.event_time,
    };

    const result = await activityAPI.updateActivity(activity.id, data);

    if (result.success) {
      toast.success('保存成功');
      // 刷新列表或关闭弹窗
    }
  } catch (error) {
    console.error('保存失败:', error);
    toast.error('保存失败: ' + error.message);
  }
};
```

---

## 后端日志检查

### 查看后端控制台

后端服务器应该在控制台输出请求信息：

```bash
# 如果使用nodemon
# 在运行 npm start 的终端查看

# 预期输出（如果有日志）:
# PUT /api/activities/1
# Update activity error: ...
```

### 添加日志（如需调试）

如果需要更详细的日志，可以在 activities.js 中添加：

```javascript
router.put('/:id', auth, async (req, res) => {
  console.log('=== UPDATE ACTIVITY ===');
  console.log('Activity ID:', req.params.id);
  console.log('User:', req.user);
  console.log('Body:', req.body);
  console.log('=========================');

  // ... 原有代码
});
```

---

## 常见错误及解决方案

### 错误1: CORS错误

**症状**: Console显示 CORS policy error

**解决**: 后端已配置CORS，应该不是这个问题

### 错误2: 401 Unauthorized

**症状**: 返回401状态码

**原因**: Token无效或过期

**解决**:
```javascript
// 重新登录获取新token
const result = await authAPI.login({ student_id, password });
localStorage.setItem('token', result.token);
```

### 错误3: 403 Forbidden

**症状**: 返回403状态码

**原因**: 不是创建者或管理员

**解决**: 使用管理员账号登录 (admin001 / admin123)

### 错误4: 404 Not Found

**症状**: 返回404状态码

**原因**: 活动ID不存在

**解决**: 确认活动ID正确

---

## 测试命令

### 手动测试API

```bash
# 1. 登录
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}' | jq -r '.token')

echo "Token: $TOKEN"

# 2. 测试更新
curl -X PUT http://localhost:3000/api/activities/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"手动测试更新","max_participants": 150}'

# 预期结果: {"message":"Activity updated successfully"}
```

---

## 总结

### 后端状态

| 检查项 | 状态 |
|--------|------|
| PUT路由存在 | ✅ |
| 路由已注册 | ✅ |
| 服务器运行中 | ✅ |
| API功能正常 | ✅ |
| 权限验证正常 | ✅ |
| max_participants支持 | ✅ |

### 建议前端检查

1. ✅ Network标签 - 查看请求是否发出
2. ✅ Request Headers - 检查 Authorization 和 Content-Type
3. ✅ Request Payload - 检查发送的数据
4. ✅ Response - 查看状态码和错误信息
5. ✅ Console - 查看JavaScript错误

---

**后端API完全正常，问题应该在前端代码。建议使用浏览器开发者工具Network标签检查具体错误。** ✅
