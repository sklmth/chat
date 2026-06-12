function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Multer错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: '文件大小超过限制'
      });
    }
    return res.status(400).json({
      success: false,
      error: '文件上传失败: ' + err.message
    });
  }

  // 自定义错误
  if (err.message) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // 默认错误
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
}

module.exports = errorHandler;
