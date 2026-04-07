# AI 海柜汤游戏接口文档 (API Documentation)

本文档定义了 AI 海龟汤游戏前后端交互的接口规范。

## 1. 基础信息
- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`

---

## 2. 接口列表

### 2.1 提问/裁决接口
玩家向 AI 裁判发起提问，获取“是/否/无关”的判定。

- **URL**: `/ask` 或 `/api/chat`
- **Method**: `POST`
- **Auth**: 无 (None)

#### 请求参数 (Request Body)
| 参数名 | 类型 | 必选 | 说明 |
| :--- | :--- | :--- | :--- |
| `question` | `string` | 是 | 玩家的提问内容 (例: "他是自杀的吗？") |
| `story` | `object` | 是 | 当前游戏剧本的上下文对象 |
| `story.title` | `string` | 是 | 剧本标题 |
| `story.surface` | `string` | 是 | 汤面 (题目描述) |
| `story.answer` | `string` | 是 | 汤底 (真相，用于 AI 判定) |
| `story.keyPoints` | `string[]` | 否 | 核心线索列表 |

> **注**: 虽然文档要求仅展示 `question`，但由于系统采用无状态设计，目前后端需要 `story` 对象来获取判定的基准真相。

#### 响应示例 (Response)

**成功响应 (200 OK):**
```json
{
  "answer": "是"
}
```

**错误响应 (示例):**
```json
{
  "code": 400,
  "message": "参数错误：缺少问题或剧本数据",
  "data": null
}
```

---

## 3. 错误码说明 (Error Codes)

系统采用标准的 HTTP 状态码，并在响应体中返回统一的 `code` 业务码。

| HTTP 状态码 | 业务码 (code) | 场景说明 |
| :--- | :--- | :--- |
| **400** | 400 | **Bad Request**: 请求参数不合法或缺失关键字段。 |
| **500** | 500 | **Internal Error**: 服务器内部未知错误。 |
| **502** | 502 | **Bad Gateway**: AI 服务调用失败（如 DeepSeek API 超时或密钥无效）。 |

---

## 4. 未来扩展 (Roadmap)
- `GET /stories`: 获取所有剧本列表。
- `POST /history`: 记录玩家的博弈历史并进行语义分析。
- `GET /health`: 系统健康检查。
