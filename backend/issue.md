# 前后端联调问题记录

## Issue 1: `Cannot find module 'server.js'`

**报错**：`Error: Cannot find module '...\backend\server.js'`

**原因**：服务器入口文件命名为 `index.js`，但手动运行时输入了 `node server.js`。

**解决**：`node index.js` 或通过 `npm run dev` 快捷键启动。

---

## Issue 2: `Cannot find module 'openai'`

**报错**：`Error: Cannot find module 'openai'`

**原因**：安装 `openai` 包时被 `Ctrl+C` 意外中断，导致包没写入 `node_modules`，但 `package.json` 里已有记录。

**解决**：重新执行 `npm install openai` 完整安装一次。

---

## Issue 3: 前端报 404（请求失败，状态码: 404）

**现象**：游戏内发问后显示"裁判暂时失联，请求失败，状态码: 404"。

**原因**：前端 `api.ts` 中接口地址写的是绝对路径 `http://localhost:3001/api/chat`，但当时后端进程实际没有跑在这个地址（双进程端口冲突导致）。

**解决**：
1. 在 `vite.config.ts` 中配置代理：
   ```ts
   server: {
     proxy: {
       '/api': { target: 'http://localhost:3001', changeOrigin: true },
     },
   }
   ```
2. 将 `api.ts` 中的地址改为相对路径 `/api/chat`，由 Vite 代理转发。
3. 杀掉所有 node 进程后重新起一个干净的后端。

---

## Issue 4: 同时存在多个后端进程（端口冲突）

**现象**：系统里同时有 `npm run dev`（后端）和 `node --watch index.js` 两个进程，都在争抢 3001 端口，导致其中一个实际没在工作。

**原因**：前一轮用 `npm run dev` 启动了后端，之后又手动运行 `node --watch index.js`，产生了孤儿进程。

**解决**：用以下命令彻底清除所有 node 进程后重新启动：
```powershell
Get-Process -Name "node" | Stop-Process -Force
```

---

## Issue 5: 前端报 502 Bad Gateway

**现象**：前端报 `请求失败，状态码: 502`。

**原因**：`.env` 文件中每一行的行首有一个多余的空格，例如：
```
·DEEPSEEK_API_KEY=sk-xxx   (·代表空格)
```
`dotenv` 加载后，key 名变成了 `" DEEPSEEK_API_KEY"`，导致 `process.env.DEEPSEEK_API_KEY` 始终是 `undefined`，后端调用 DeepSeek 时因为空 key 被拒绝，进而崩溃返回 502。

**解决**：编辑 `.env`，删除每行前面的空格，确保格式如下：
```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
PORT=3001
```
然后重启后端（`--watch` 不检测 `.env` 变化，需手动重启）。

---

## 开发经验总结

| 状态码 | 含义 | 通常原因 |
|--------|------|----------|
| 404 | 找不到路由 | 路径错/端口错/进程没起来 |
| 502 | 后端崩溃 | 后端代码运行时报错（如 Key 无效） |
| 400 | 参数缺失 | 前端没有发送 `question` 或 `story` |
| 500 | 后端内部错误 | 业务逻辑报错（如 AI API 调用失败） |

---

## Issue 6: AI 看起来只回复"一个时间"（实为前端打字机效果 Bug）

**现象**：游戏中向 AI 裁判提问，消息气泡内容区为空，只显示气泡右下角的时间戳（如 `08:58`），用户误以为"AI只回复了一个时间"。

**真实根因：React 18 StrictMode 双跑 effect，破坏了 `typingRef` 保护逻辑**

`Message.tsx` 的打字机效果实现如下（有问题的版本）：
```tsx
const typingRef = React.useRef<boolean>(false);

React.useEffect(() => {
  if (isAssistant && !isError && !typingRef.current) {
    typingRef.current = true; // ← 标记"已在打字"
    // ... 启动 setInterval 打字
    return () => clearInterval(timer); // cleanup 取消 timer
  }
}, [...]);
```

React 18 的 **StrictMode 在开发模式下会对每个 effect 执行两次**（mount → cleanup → mount），以检测副作用的幂等性：

| 阶段 | `typingRef.current` | 动作 |
|------|---------------------|------|
| 第一次 effect 运行 | `false` | 进入 if 块 → 设为 `true` → 启动 timer |
| StrictMode cleanup | — | timer 被 clearInterval 取消 |
| **第二次 effect 运行** | **`true`（ref 跨渲染持久）** | **跳过 if 块 → 动画永远不再启动** |

最终 `displayText` 永远是初始值空字符串 `''`，文字内容不显示，用户只看到气泡底部的时间戳。

**注意**：AI 本身回复是正确的（"是"/"不是"等），只是前端没有渲染出来。

**解决方案**：

删除 `typingRef`，不用"保护 flag"，让 React 的 cleanup 机制正确处理：
```tsx
React.useEffect(() => {
  if (!isAssistant || isError) {
    setDisplayText(message.content);
    return;
  }

  // 每次 effect 重跑都从头开始（cleanup 会取消上一个 timer）
  setDisplayText('');
  let i = 0;
  const timer = setInterval(() => {
    if (i < message.content.length) {
      setDisplayText(message.content.substring(0, i + 1));
      i++;
    } else {
      clearInterval(timer);
    }
  }, 20);

  return () => clearInterval(timer); // cleanup 正确取消 timer
}, [message.content, isAssistant, isError]);
```

**经验总结**：
- React 18 StrictMode 开发模式下会双跑 effect，用 `ref` 做"只运行一次"的 flag 在 StrictMode 下会失效
- 正确的幂等性写法是：让 effect 可以安全地重复执行，并在 cleanup 里清理副作用
- `typingRef` 这类"防重复"guard 应该用 `started` 局部变量替代，或完全依赖 React 的 cleanup 机制
- 生产构建（`npm run build`）不运行 StrictMode 双跑，所以这类 bug 只出现在开发环境
