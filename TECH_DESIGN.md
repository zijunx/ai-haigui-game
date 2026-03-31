# AI海龟汤游戏技术设计（优化版）
---
## 一、技术栈
### 前端
- React + TypeScript + Vite
- Tailwind CSS
- 状态管理：React Hooks + Context（MVP）
- 路由：React Router

### 后端（建议必须有）
- Node.js + Express
- 用于：
  - AI请求代理
  - 判定逻辑控制
  - 游戏状态管理

### AI服务
- DeepSeek / 智谱AI（推荐 DeepSeek，成本低）

---

## 二、系统架构
前端（UI + 状态）
   ↓
后端（游戏引擎层）
   ↓
AI服务（仅做语言理解）

### ⚠️ 关键原则
👉 AI不是裁判，后端才是裁判

---

## 三、项目结构（优化）
src/
├── components/
│   ├── GameCard.tsx
│   ├── ChatBox.tsx
│   ├── Message.tsx
│   ├── HintPanel.tsx        # 提示系统（新增）
│   ├── ScoreBoard.tsx       # 评分展示（新增）
│   └── ProgressBar.tsx      # 推理进度（可选）
│
├── pages/
│   ├── Home.tsx
│   ├── Game.tsx
│   └── Result.tsx
│
├── hooks/
│   └── useGameState.ts      # 游戏状态管理（核心）
│
├── services/
│   ├── aiService.ts         # AI请求封装
│   ├── gameService.ts       # 游戏逻辑API
│
├── types/
│   └── index.ts
│
├── data/
│   └── stories.ts
│
├── App.tsx
└── main.tsx

---

## 四、数据模型（核心升级）

### 4.1 Story（增强版）

```ts
type Story = {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]

  surface: string   // 汤面
  answer: string    // 汤底

  keyPoints: string[]   // 关键要点（用于判定）

  hints: {
    level1: string
    level2: string
    level3: string
  }
}
### 4.2 GameState（新增核心）
type GameState = {
  storyId: string

  messages: Message[]

  questionCount: number
  hintsUsed: number

  hitKeyPoints: string[]   // 已命中关键点

  status: 'playing' | 'success' | 'failed'
}
### 4.3 Message
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
## 五、核心流程（升级版）
1. 进入大厅 → 选择题目
2. 初始化 GameState
3. 玩家提问 → 发送到后端
4. 后端执行：
   a. AI语义解析（判断问题意图）
   b. 与标准答案比对
   c. 判断：
      - 是否命中关键点
      - 返回 是 / 否 / 无关
5. 更新 GameState：
   - 提问次数 +1
   - 更新命中关键点
6. 判断是否胜利：
   - 命中全部关键点 → success
7. 玩家使用提示（可选）
8. 结束 → 展示结果页
## 六、AI判定引擎（核心模块）
### 6.1 判定流程
用户问题 → AI理解 → 转换为结构化语义
         ↓
与标准答案比对
         ↓
输出：
- yes / no / irrelevant
- 命中关键点（可选）
### 6.2 判定策略（基于你选择“宽松引导型”）

- AI职责：
  - 理解用户问题意图
  - 判断是否接近某个关键点
- 后端职责：
  - 决定最终：
    - 是否命中关键点
- 是否胜利
### 6.3 返回结构（建议）
type AIResponse = {
  answer: 'yes' | 'no' | 'irrelevant'
  hint?: string               // 轻微引导（可选）
  hitKeyPoint?: string       // 命中的关键点
}
## 七、提示系统实现
### 7.1 前端逻辑
点击“提示” →
展示 level1 →
再次点击 →
展示 level2 →
再次点击 →
展示 level3
### 7.2 状态更新
hintsUsed += 1
### 7.3 对评分影响
每使用一次提示 → 降低评分
## 八、评分系统
评分维度
score = f(问题数, 提示数)
| 条件         | 评分  |
| ---------- | --- |
| <10问 & 无提示 | ⭐⭐⭐ |
| <20问       | ⭐⭐  |
| 使用提示       | ⭐   |
## 九、AI Prompt设计（升级版）
你是一个海龟汤游戏的主持人。

【规则】
- 你必须基于“汤底”判断玩家问题
- 你只能回答：是 / 否 / 无关
- 但允许在括号中添加一句“轻微引导”（可选）

【目标】
- 帮助玩家逐步接近真相
- 但不能直接透露答案

【当前故事】
汤面：{surface}
汤底：{answer}

【关键点（仅供参考，不可直接说出）】
{keyPoints}

玩家问题：{question}

请输出格式：
{
  "answer": "是/否/无关",
  "hint": "（可选）一句轻微引导"
}
## 十、关键技术风险
1. AI不稳定（最大风险）
• 可能前后矛盾
• 可能泄露答案
• 解决方案：
◦ 后端兜底判定
◦ 限制AI输出格式（JSON）

2. 关键点匹配困难
• 建议方案：
    ◦ 初期采用“关键词匹配 + AI辅助判断”策略

3. 成本问题
• 建议方案：
    ◦ 控制token使用
    ◦ 限制回答长度
## 十一、MVP实现建议（非常重要）
第一阶段：基础可运行版本
• 使用静态题库
• AI进行简单判断
• 暂不实现关键点系统（先简化）
第二阶段：体验优化
• 加入关键点命中机制
• 实现评分系统
第三阶段：功能增强
• 优化提示系统
• 加入排行榜/用户系统