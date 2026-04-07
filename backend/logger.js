/**
 * AI 海龟汤后端请求日志中间件
 */
const requestLogger = (req, res, next) => {
  // 仅针对 API 路由进行详细记录
  if (!req.url.startsWith('/api')) {
    return next();
  }

  const start = Date.now();
  const { method, url } = req;
  
  // 劫持 res.json 以捕获响应内容
  const originalJson = res.json;
  res.json = function (body) {
    const duration = Date.now() - start;
    
    // 构建结构化日志
    const logEntry = {
      timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      method,
      url,
      status: res.statusCode,
      duration: `${duration}ms`,
      // 记录请求核心信息（过滤掉敏感的汤底答案）
      payload: {
        question: req.body?.question || 'N/A',
        storyTitle: req.body?.story?.title || 'N/A'
      },
      // 记录响应内容
      response: body?.answer || body?.error || body,
    };

    // 控制台输出（开发环境建议使用 JSON 或清晰的格式）
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[${logEntry.timestamp}] ${method} ${url} - ${logEntry.duration}`);
      console.log(`> Question: ${logEntry.payload.question}`);
      console.log(`> AI Reply: ${logEntry.response}`);
      console.log(`-----------------------------------`);
    } else {
      // 生产环境输出紧凑的 JSON
      console.log(JSON.stringify(logEntry));
    }

    return originalJson.call(this, body);
  };

  next();
};

module.exports = requestLogger;
