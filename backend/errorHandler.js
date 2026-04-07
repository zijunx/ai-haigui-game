/**
 * 统一错误处理中间件 (errorHandler.js)
 */

// 自定义错误类，支持状态码和业务代码
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || '内部服务器错误 (Internal Server Error)';

  // 日志记录：根据错误生产或开发环境输出
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`);
  } else {
    console.error(`[ERROR] ${err.message}`);
  }

  // 返回标准结构
  res.status(statusCode).json({
    code: err.errorCode || statusCode,
    message: message,
    data: null
  });
};

module.exports = {
  AppError,
  errorHandler
};
