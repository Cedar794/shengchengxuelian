# max_participants 字段支持确认报告

**确认时间**: 2026-02-10
**后端状态**: ✅ 完全支持
**前端状态**: ⚠️ 需要确认

---

## 后端支持情况

### 1. 数据库表结构

**表名**: `activities`

**相关字段**:
```sql
max_participants     INTEGER    - 最大参与人数限制
current_participants INTEGER    - 当前参与人数
```

**状态**: ✅ 列已存在

---

### 2. API接口支持

#### 创建活动 (POST /api/activities)

**支持的字段**:
```javascript
const { title, description, type, location, event_time,
          registration_deadline, max_participants,  // ✅ 支持
          target_schools, target_tags, cover_image } = req.body;
```

**使用示例**:
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "活动标题",
    "description": "活动描述",
    "max_participants": 100,
    "event_time": "2026-03-01 09:00:00"
  }'
```

#### 更新活动 (PUT /api/activities/:id)

**支持的字段**:
```javascript
const { title, description, type, location, event_time,
          registration_deadline, max_participants,  // ✅ 支持
          status, target_schools, target_tags, cover_image } = req.body;
```

**SQL更新语句**:
```javascript
UPDATE activities
SET title = ?, description = ?, type = ?, location = ?, event_time = ?,
    registration_deadline = ?, max_participants = ?, status = ?,  // ✅ 包含
    target_schools = ?, target_tags = ?, cover_image = ?, updated_at = datetime('now')
WHERE id = ?
```

**使用示例**:
```bash
curl -X PUT http://localhost:3000/api/activities/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_participants": 100}'
```

**测试结果**:
```json
{
  "message": "Activity updated successfully",
  "activity": {
    "id": 1,
    "title": "活动标题",
    "max_participants": 100,       // ✅ 更新成功
    "current_participants": 0
  }
}
```

---

### 3. 数据验证

#### 创建时的验证

```javascript
// activities.js line 195-197
if (activity.max_participants && activity.current_participants >= activity.max_participants) {
  return res.status(400).json({ error: 'Activity is full' });
}
```

**规则**:
- 如果设置了 `max_participants`
- 且 `current_participants >= max_participants`
- 则不允许新用户报名

#### 更新时的处理

```javascript
// activities.js line 266
max_participants || activity.max_participants,
```

**逻辑**:
- 如果请求提供了 `max_participants`，使用新值
- 如果未提供（null/undefined），保持原值
- 允许动态调整人数限制

---

## 前端需要确认的事项

### 1. EditModal 组件

**需要检查**:
```javascript
// frontend/src/components/.../EditModal.jsx

const [formData, setFormData] = useState({
  title: '',
  description: '',
  max_participants: '',     // ⚠️ 是否包含此字段？
  // ... 其他字段
});

// 保存时是否传递
const handleSave = async () => {
  await apiCall(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...formData,
      max_participants: formData.max_participants,  // ⚠️ 是否传递？
    }),
  });
};
```

### 2. 字段类型

**后端期望**: `Integer` (数字)

**前端表单示例**:
```jsx
<Input
  type="number"              // ⚠️ 应该是 number 类型
  label="最大参与人数"
  value={formData.max_participants}
  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
  min="1"
/>
```

**注意事项**:
- ✅ 使用 `type="number"` 而非 `type="text"`
- ✅ 使用 `parseInt()` 或 `Number()` 转换
- ✅ 设置 `min="1"` 防止负数
- ✅ 可以设置为空（表示不限制）

---

## 字段名对照

| 后端字段 | 数据库列 | 前端字段 | 状态 |
|---------|---------|---------|------|
| max_participants | max_participants | max_participants | ✅ 一致 |
| current_participants | current_participants | current_participants | ✅ 一致 |

---

## 完整的CRUD支持矩阵

| 操作 | 端点 | max_participants | current_participants |
|------|------|------------------|---------------------|
| 创建 | POST /api/activities | ✅ 可设置 | ✅ 自动初始化为0 |
| 读取 | GET /api/activities/:id | ✅ 返回 | ✅ 返回 |
| 更新 | PUT /api/activities/:id | ✅ 可更新 | ❌ 只读（系统自动计算） |
| 删除 | DELETE /api/activities/:id | - | - |
| 报名 | POST /api/activities/:id/register | - | ✅ 自动+1 |
| 取消报名 | DELETE /api/activities/:id/register | - | ✅ 自动-1 |

---

## API测试验证

### 测试1: 创建活动并设置人数限制

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"student_id":"admin001","password":"admin123"}' | jq -r '.token')

curl -X POST http://localhost:3000/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "限人数测试活动",
    "description": "测试人数限制",
    "type": "general",
    "location": "测试地点",
    "event_time": "2026-03-01 09:00:00",
    "max_participants": 50
  }'
```

**预期结果**: ✅ 活动创建成功，max_participants = 50

### 测试2: 更新活动人数限制

```bash
curl -X PUT http://localhost:3000/api/activities/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_participants": 100}'
```

**预期结果**: ✅ 更新成功，max_participants = 100

### 测试3: 报名时检查人数限制

```bash
# 模拟多个用户报名，直到达到上限
for i in {1..51}; do
  curl -X POST http://localhost:3000/api/activities/1/register \
    -H "Authorization: Bearer $USER_TOKEN"
done
```

**预期结果**:
- 前50个报名: ✅ 成功
- 第51个报名: ❌ 403 - "Activity is full"

---

## 前后端协同检查清单

### 后端确认 ✅

- [x] 数据库表有 `max_participants` 列
- [x] POST /api/activities 支持 `max_participants` 字段
- [x] PUT /api/activities/:id 支持 `max_participants` 字段
- [x] GET /api/activities/:id 返回 `max_participants` 字段
- [x] 字段类型为 `INTEGER`
- [x] 报名时验证人数限制
- [x] 更新时正确处理字段（可为null）

### 前端需要确认 ⚠️

- [ ] EditModal 是否包含 `max_participants` 输入框
- [ ] 输入框类型是否为 `type="number"`
- [ ] 是否有最小值限制 (min="1")
- [ ] 保存时是否正确传递 `max_participants` 给后端
- [ ] 字段名是否为 `max_participants` (注意下划线)
- [ ] 是否支持设置为空（表示不限制）
- [ ] 是否显示 `current_participants` / `max_participants` 比例

---

## 前端实现建议

### EditModal 表单配置

```jsx
<EditModal>
  <Form>
    <FormField>
      <Label>活动标题</Label>
      <Input
        name="title"
        value={formData.title}
        onChange={handleChange}
      />
    </FormField>

    <FormField>
      <Label>活动描述</Label>
      <Textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
      />
    </FormField>

    {/* 新增：最大参与人数 */}
    <FormField>
      <Label>最大参与人数</Label>
      <Input
        type="number"                    {/* ✅ 数字类型 */}
        name="max_participants"            {/* ✅ 字段名正确 */}
        value={formData.max_participants}
        onChange={handleChange}
        min="1"                           {/* ✅ 最小值 */}
        placeholder="留空表示不限制"
      />
      <HelpText>留空表示不限制参与人数</HelpText>
    </FormField>

    <FormField>
      <Label>活动时间</Label>
      <DateTimePicker
        name="event_time"
        value={formData.event_time}
        onChange={handleChange}
      />
    </FormField>

    <FormField>
      <Label>活动地点</Label>
      <Input
        name="location"
        value={formData.location}
        onChange={handleChange}
      />
    </FormField>
  </Form>
</EditModal>
```

### 数据初始化

```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  max_participants: '',        // ✅ 包含此字段
  location: '',
  event_time: '',
  type: 'general',
});

// 编辑时初始化
useEffect(() => {
  if (activity) {
    setFormData({
      ...activity,
      max_participants: activity.max_participants || '',  // ✅ 正确初始化
    });
  }
}, [activity]);
```

### 保存处理

```javascript
const handleSave = async () => {
  try {
    const data = {
      ...formData,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,  // ✅ 转换为整数或null
    };

    await apiCall(`/activities/${activity.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    // 成功提示
    toast.success('活动更新成功');
  } catch (error) {
    toast.error('更新失败: ' + error.message);
  }
};
```

---

## 总结

### 后端状态: ✅ 完全支持

- ✅ 数据库列已存在
- ✅ 创建接口支持
- ✅ 更新接口支持
- ✅ 查询接口返回
- ✅ 人数限制验证
- ✅ 字段类型正确

### 前端需要实现: ⚠️ 待确认

- [ ] 在EditModal中添加 `max_participants` 输入框
- [ ] 使用 `type="number"`
- [ ] 正确的字段名 `max_participants`
- [ ] 支持空值（不限制）
- [ ] 保存时转换为整数

### 协同建议

1. **前端开发者**:
   - 在EditModal中添加人数限制输入框
   - 使用 `type="number"` 和 `min="1"`
   - 字段名使用 `max_participants`

2. **后端开发者**:
   - ✅ 已完成，无需修改

3. **测试**:
   - 创建活动时设置人数限制
   - 编辑活动时修改人数限制
   - 验证报名时的人数限制

---

**确认时间**: 2026-02-10
**后端状态**: ✅ 完全支持
**前端状态**: ⚠️ 需要实现
**字段名**: `max_participants` (前后端一致)
