# PromptBench API 文档

Base URL: `http://localhost:3007/api` (dev) | `https://ai-prompt-bench.vercel.app/api` (prod)

---

## 健康检查

### `GET /api/health`

返回服务状态。

**响应**
```json
{ "ok": true, "ts": 1716000000000 }
```

---

## 社区模板

### `GET /api/community`

获取社区模板列表。

**查询参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sort | string | recent | recent / popular / copied |
| category | string | - | 分类筛选 |
| author | string | - | 作者 ID 筛选 |
| search | string | - | 搜索关键词 |
| limit | number | 50 | 返回数量（最大 100） |

### `POST /api/community`

发布社区模板。必填字段：authorId, authorName, name, prompt

### `GET /api/community/:id`

获取单个模板详情。

### `PATCH /api/community/:id`

执行操作。请求体：`{ "action": "like" }` 或 `{ "action": "copy" }`

### `DELETE /api/community/:id`

删除模板（仅作者）。请求体：`{ "authorId": "..." }`

---

## 反馈投票

### `POST /api/community/:id/feedback`

投票。请求体：`{ "userId": "...", "value": "up"|"down" }`
同一用户重复发送相同值=取消投票，切换投票=自动调整计数。

### `GET /api/community/:id/feedback?userId=xxx`

查询用户当前投票状态。

---

## 评论

### `GET /api/community/:id/comments`

获取评论列表（按时间倒序，最多 100 条）。

### `POST /api/community/:id/comments`

添加评论。请求体：`{ "userId": "...", "userName": "...", "content": "..." }`
content 最多 1000 字符。

---

## 排行榜

### `GET /api/community/leaderboard`

查询参数：period=week|month（默认 week），limit=10（最大 50）

---

## AI 生成

### `POST /api/generate`

AI 生成 Prompt（代理到 MiniMax API）。SSE 流式输出。

---

## 分析事件

### `POST /api/events`

记录用户行为事件。事件类型：template_view, template_copy, ai_generate, ai_copy, ai_feedback, page_view

### `GET /api/stats`

查询参数：days=7, today=false

---

## 错误格式

所有错误返回：`{ "error": "...", "statusCode": 400 }`
常见状态码：400 参数错误 / 404 未找到 / 403 无权限 / 500 服务端错误