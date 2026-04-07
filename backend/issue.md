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
