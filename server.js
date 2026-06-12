require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// 初始化数据库（会执行迁移脚本）
require('./src/models/database');

// 导入路由和Socket处理器
const apiRoutes = require('./src/routes/api');
const initializeSocket = require('./src/socket');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// API路由
app.use('/api', apiRoutes);

// 错误处理中间件
app.use(errorHandler);

// 初始化Socket.IO
initializeSocket(io);

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO initialized`);
  console.log(`🗄️  Database ready`);
  console.log('=================================');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
