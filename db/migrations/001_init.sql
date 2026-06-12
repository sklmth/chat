-- ============================================
-- 初始化数据库表结构
-- ============================================

-- 用户表（临时会话用户）
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  socket_id TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '👤',
  session_token TEXT UNIQUE,
  is_online INTEGER DEFAULT 1,
  current_room_id INTEGER,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  FOREIGN KEY (current_room_id) REFERENCES rooms(id)
);

CREATE INDEX IF NOT EXISTS idx_users_socket ON users(socket_id);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(session_token);
CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online, last_seen);

-- 房间表
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public',
  icon_emoji TEXT DEFAULT '💬',
  max_members INTEGER DEFAULT 100,
  created_by INTEGER,
  created_at INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type, is_active);

-- 房间成员表
CREATE TABLE IF NOT EXISTS room_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at INTEGER NOT NULL,
  last_read_message_id INTEGER DEFAULT 0,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id);

-- 私聊会话表
CREATE TABLE IF NOT EXISTS private_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  last_message_id INTEGER,
  last_message_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (last_message_id) REFERENCES messages(id),
  UNIQUE(user1_id, user2_id),
  CHECK(user1_id < user2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_users ON private_conversations(user1_id, user2_id);

-- 文件元数据表
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  upload_ip TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_files_message ON files(message_id);

-- 在线用户快照表（用于统计）
CREATE TABLE IF NOT EXISTS online_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER,
  user_count INTEGER NOT NULL,
  snapshot_at INTEGER NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_time ON online_snapshots(snapshot_at);

-- 插入预设房间
INSERT OR IGNORE INTO rooms (id, name, description, type, icon_emoji, created_at) VALUES
  (1, '大厅', '欢迎来到匿名聊天室', 'public', '🏠', strftime('%s','now') * 1000),
  (2, '随便聊聊', '想说什么就说什么', 'public', '💭', strftime('%s','now') * 1000),
  (3, '技术交流', '分享技术，讨论代码', 'public', '💻', strftime('%s','now') * 1000),
  (4, '深夜树洞', '夜深人静，说出你的故事', 'public', '🌙', strftime('%s','now') * 1000);
