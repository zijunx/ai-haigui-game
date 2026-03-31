# 🧠 AI海龟汤游戏 Agents.md（开发指令）

---

## 一、项目概述

本项目是一个基于 **React + TypeScript + Tailwind CSS + Node.js** 的  
**AI驱动交互式推理游戏系统（海龟汤）**。

核心目标：
- 提供“烧脑推理 + 成就感”的游戏体验
- 基于**结构化题库 + AI辅助判断 + 规则引擎裁决**
- 实现“是 / 否 / 无关”问答机制 + 分层提示系统

---

## 二、系统角色定义（Agents）

本项目包含以下核心“智能体角色”（逻辑分层，不一定是独立服务）：

### 1️⃣ Game Engine（游戏引擎 / 核心裁判）
**职责：**
- 管理游戏状态（GameState）
- 控制游戏流程（开始 / 推进 / 结束）
- 判定胜负（关键点命中）
- 计算评分

**必须保证：**
- 逻辑一致性
- 可重复性（同一问题 → 同一结果）

👉 ⚠️ 核心原则：  
**Game Engine 是唯一裁判，AI不是裁判**

---

### 2️⃣ AI Agent（语言理解层）
**职责：**
- 理解玩家自然语言问题
- 判断问题与“汤底”的关系
- 输出标准化结构（yes / no / irrelevant）
- 提供轻微引导（可选）

**限制：**
- 不允许直接透露答案
- 不允许生成新事实
- 必须受 Prompt 约束

---

### 3️⃣ Hint Agent（提示系统）
**职责：**
- 按层级提供提示：
  - Level 1：方向提示
  - Level 2：关键点提示
  - Level 3：接近答案提示
- 控制提示顺序
- 更新提示使用次数

---

### 4️⃣ Scoring Agent（评分系统）
**职责：**
- 根据：
  - 提问次数
  - 提示使用次数
- 输出评分（⭐）

---

### 5️⃣ UI Agent（前端交互层）
**职责：**
- 渲染游戏界面
- 展示对话、提示、评分
- 接收用户输入
- 管理局部状态（React）

---

## 三、开发规范

### 技术规范
- 使用 TypeScript，确保类型安全
- 使用函数式组件 + Hooks
- 使用 Tailwind CSS 编写样式
- 前后端职责明确分离

---

### 架构规范
Frontend (React)
↓
Backend (Game Engine)
↓
AI Service

👉 禁止：
- 前端直接调用 AI（必须走后端）
- AI直接决定游戏结果

---

## 四、代码风格

- 组件名：PascalCase（如 GameCard）
- 函数名：camelCase（如 getGameState）
- 常量：UPPER_SNAKE_CASE
- 类型定义：以 T 开头（如 TStory, TGameState）

---

## 五、核心数据结构（必须统一）

### TStory

```ts
type TStory = {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]

  surface: string
  answer: string

  keyPoints: string[]

  hints: {
    level1: string
    level2: string
    level3: string
  }
}

TGameState
type TGameState = {
  storyId: string

  messages: TMessage[]

  questionCount: number
  hintsUsed: number

  hitKeyPoints: string[]

  status: 'playing' | 'success' | 'failed'
}
TMessage
type TMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
## 六、核心流程
1. 玩家选择题目
2. 初始化 GameState
3. 玩家提问
4. 后端处理：
   - 调用 AI 理解问题
   - 与标准答案比对
   - 判断 yes / no / irrelevant
   - 判断是否命中关键点
5. 返回结果
6. 更新状态
7. 判断是否胜利
8. 进入结果页
##七、AI行为规范（强约束）
必须遵守：
只允许返回：
是
否
无关
可附带：
一句轻微引导（括号内）
输出格式（强制JSON）
{
  "answer": "yes | no | irrelevant",
  "hint": "optional"
}
## 八、关键业务规则
1. 胜利判定
命中全部 keyPoints → success
2. 提问规则
每次提问 → questionCount +1
3. 提示规则
使用提示 → hintsUsed +1
按顺序解锁（level1 → level2 → level3）
4. 评分规则（示例）
条件	评分
<10问 & 无提示	⭐⭐⭐
<20问	⭐⭐
使用提示	⭐
## 九、UI设计规范
风格
背景：深色（bg-slate-900）
强调色：金色（text-amber-400）
氛围：神秘 / 悬疑
组件规范
圆角：rounded-lg
阴影：shadow-lg
间距统一（p-4 / gap-4）
关键页面
首页（大厅）
题目卡片列表
支持难度 / 标签筛选
游戏页
聊天界面（核心）
提示按钮
提问计数器
结果页
汤底揭晓
评分展示
数据复盘
## 十、注意事项
安全
API Key 必须使用环境变量
禁止前端暴露密钥
性能
控制AI调用频率
避免长上下文
一致性
所有判定必须走后端
禁止前端自行判断
MVP原则
优先实现核心玩法
不做过度设计
快速验证体验
## 十一、测试要求
功能测试
游戏流程完整可跑通
胜负判定正确
提示系统正常
AI测试
回答是否稳定
是否出现剧透
是否前后矛盾
UI测试
移动端适配
聊天滚动正常
不同屏幕兼容
## 十二、开发优先级
P0（必须）
游戏流程
AI问答
基础UI
P1
关键点系统
评分系统
P2
提示系统优化
数据记录
P3
排行榜
用户系统