const express = require('express');
const router = express.Router();
const fileRoutes = require('./fileRoutes');
const roomService = require('../services/roomService');

// 文件上传路由
router.use('/', fileRoutes);

// 获取房间列表
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await roomService.getAllRoomsWithInfo();
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      error: '获取房间列表失败'
    });
  }
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: Date.now()
  });
});

module.exports = router;
