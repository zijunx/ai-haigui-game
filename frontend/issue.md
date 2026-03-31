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
