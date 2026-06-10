require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const db = require('./db/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const REDIS_KEY = 'chat:messages';
const CACHE_LIMIT = 50;

const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', err => console.error('Redis error:', err));
redis.connect();

app.use(express.static('public'));

const adjectives = ['愤怒的','神秘的','迷失的','快乐的','忧郁的','慵懒的','暴躁的','冷静的','可爱的','凶猛的'];
const nouns      = ['柠檬🍋','土豆🥔','章鱼🐙','仙人掌🌵','企鹅🐧','猫头鹰🦉','河豚🐡','松鼠🐿️','鳄鱼🐊','海豹🦭'];
const genNick = () => adjectives[Math.random()*adjectives.length|0] + nouns[Math.random()*nouns.length|0];

io.on('connection', async socket => {
  const nickname = genNick();
  socket.data.nickname = nickname;

  // 先读 Redis 缓存，没有则从 SQLite 加载
  let history = await redis.lRange(REDIS_KEY, 0, -1);
  if (history.length === 0) {
    const rows = db.getRecent();
    if (rows.length) {
      const pipeline = redis.multi();
      rows.forEach(r => pipeline.rPush(REDIS_KEY, JSON.stringify({ nickname: r.nickname, content: r.content, time: r.created_at })));
      pipeline.lTrim(REDIS_KEY, -CACHE_LIMIT, -1);
      await pipeline.exec();
      history = await redis.lRange(REDIS_KEY, 0, -1);
    }
  }

  socket.emit('init', {
    nickname,
    history: history.map(s => JSON.parse(s)),
  });

  socket.on('message', async content => {
    if (!content || typeof content !== 'string' || content.trim().length === 0) return;
    const msg = { nickname: socket.data.nickname, content: content.trim(), time: Date.now() };

    // 写 Redis（缓存）
    await redis.rPush(REDIS_KEY, JSON.stringify(msg));
    await redis.lTrim(REDIS_KEY, -CACHE_LIMIT, -1);

    // 异步落盘 SQLite
    db.saveMessage(msg.nickname, msg.content);

    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    io.emit('system', `${nickname} 离开了聊天室`);
  });

  io.emit('system', `${nickname} 加入了聊天室`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
