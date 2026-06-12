const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { getFileType } = require('../utils/validator');

// 图片上传
router.post('/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未选择文件'
      });
    }

    const fileUrl = `/uploads/images/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '上传失败'
    });
  }
});

// 普通文件上传
router.post('/upload/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未选择文件'
      });
    }

    const fileUrl = `/uploads/files/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '上传失败'
    });
  }
});

// 音频上传
router.post('/upload/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未选择文件'
      });
    }

    const fileUrl = `/uploads/audio/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '上传失败'
    });
  }
});

// 视频上传
router.post('/upload/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未选择文件'
      });
    }

    const fileUrl = `/uploads/video/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '上传失败'
    });
  }
});

module.exports = router;
