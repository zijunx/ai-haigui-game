# 项目问题记录 (Issue Log)

## [ISSUE-001] 页面加载为白屏 (Blank Page on Load)

**日期**: 2026-03-30
**状态**: ✅ 已修复 (Fixed)
**严重程度**: 阻塞 (Blocker)

### 1. 现象描述
在 `frontend` 目录下运行 `npm run dev` 后，访问 `http://localhost:5173/` 浏览器显示空白页。控制台抛出语法错误：
`Uncaught SyntaxError: The requested module '/src/types/index.ts' does not provide an export named 'TStory'`。

### 2. 原因分析
- **根本原因**: 在 TypeScript 源码中，直接使用 `import { TStory } from '../types'` 导致 Vite/ESBuild 在转换代码时，将其视为一个**值（Value）**导入。
- **构建冲突**: `src/types/index.ts` 中只定义了接口/类型（Interface/Type），并无实际的运行时常量导出。
- **浏览器报错**: 浏览器在加载模块时，发现导入的符号在目标模块中并不存在（因为 TS 类型在编译后会被擦除），从而中断了整个脚本的执行，导致 React 根节点无法挂载。

### 3. 修复方案
将所有仅涉及类型检查的导入语句修改为 **Type-only Import** 语法：

```typescript
// 错误写法
import { TStory } from '../types';

// 正确写法
import type { TStory } from '../types';
```

### 4. 涉及文件
- `src/data/stories.ts`
- `src/components/GameCard.tsx`

### 5. 预防措施
- 严格遵循 TypeScript 的 `import type` 规范，区分类型导入与变量导入。
- 在每次重大 UI 变更或架构调整后，运行 `npm run build` 进行完整性验证，因为构建过程会对类型导出进行严格校验。

## [ISSUE-002] AI 裁判“间歇性失忆”及 JSON Fallback 崩溃

**日期**: 2026-04-06
**状态**: ✅ 已修复 (Fixed)
**严重程度**: 高 (High)

### 1. 现象描述
在玩家进行多轮提问时，AI 无法结合之前的对话上下文进行判定（例如：前面猜出“拍戏”，后面猜出“道具假人”，但 AI 始终不判通关，提示缺失线索）。此外，当玩家进一步追问时，AI 的回复偶然变为系统兜底报错音效 `“（裁判走了个神，但判定已送达）”`，并且判定结果错误地退化为固定词语 `与此无关`。

### 2. 原因分析
- **根本原因 1 (失忆)**: 前端 `askAI` 接口原本只发送了最新的 `question`，完全丢失了历史对话记录（`history`），导致后端的 LLM 收到的是孤立问题，无法累计玩家的连贯推理进度。
- **根本原因 2 (JSON Fallback 崩溃)**: 当在后端追加并组装 `history` 发送给模型时，原本写回 `messages` 数组的历史消息中，`assistant` 的回复被直接提取为纯文本（例如 `"是"`）。大模型（DeepSeek）属于典型的少样本极度敏感型（Few-shot bias），当它在 `history` 里看到自己曾经“不按 JSON 格式输出也能交流”时，便被自身历史记忆误导，随后的回答直接输出自然语言的 `"是"` 或其它文字，而非强制要求的 `{"verdict": "...", "atmosphere": "...", "isFinished": ...}` 格式，进而瞬间击溃后端的 `JSON.parse()`。

### 3. 修复方案
1. **打通记忆通道**：
   - 升级前端 `Game.tsx` 中的状态流，将当前组件维护的 `messages` 作为 `history` 参数，随同最新的提问一起打包交给 `askAI` 接口。
   - 修改 `api.ts` 支持处理 `history: TMessage[]` 的透传。
2. **严控历史记忆的格式欺骗**：
   - 在后端 `backend/index.js` 的构建 `messagesArray` 流程中，特殊处理遍历到的 `msg.role === 'assistant'` 记录。
   - 为避免大模型被自己的自然语言记忆带偏，强制将大模型过去的普通回话用 `JSON.stringify` 再次精细包装为 `{"verdict": "...", "atmosphere": "...", "isFinished": false}`。这就给大模型制造了一个“过去的我每一句都严格遵守 JSON 输出标准”的完美假象。

### 4. 涉及文件
- `backend/index.js` (后端处理逻辑)
- `frontend/src/api.ts` (API层)
- `frontend/src/pages/Game.tsx` (前端状态)

### 5. 预防措施
- 提示工程除了 `response_format: { type: 'json_object' }` 外，必须保证推演给大模型的 `messages` 历史对话记录中，该角色之前所有的回答结构也必须是标准 JSON 字符形式。
- 对于任何形式的多轮推理判定应用，后端必须完整管理或者要求前端完整透传上下文环境。
