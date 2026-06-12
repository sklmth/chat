const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { FILE_LIMITS } = require('../config/constants');
const { getFileType } = require('../utils/validator');

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = getFileType(file.mimetype);
    const uploadPath = path.join(__dirname, `../../uploads/${type}s`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const type = getFileType(file.mimetype);
  const limits = FILE_LIMITS[type];

  if (!limits) {
    return cb(new Error('不支持的文件类型'), false);
  }

  if (!limits.mimes.includes(file.mimetype)) {
    return cb(new Error(`不支持的文件格式: ${file.mimetype}`), false);
  }

  cb(null, true);
};

// 创建上传中间件
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 全局最大50MB
  }
});

module.exports = upload;
