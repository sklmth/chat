-- ============================================
-- 扩展消息表以支持多房间和媒体消息
-- ============================================

-- 备份旧消息表
CREATE TABLE IF NOT EXISTS messages_backup AS SELECT * FROM messages;

-- 删除旧消息表
DROP TABLE IF EXISTS messages;

-- 创建新的消息表
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_mime TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  reply_to_id INTEGER,
  is_deleted INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (reply_to_id) REFERENCES messages(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_private ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- 迁移旧数据（将旧消息分配到默认房间"大厅"）
INSERT INTO messages (room_id, sender_id, message_type, content, created_at)
SELECT 1, NULL, 'text', content, created_at FROM messages_backup;

-- 注意：旧消息的 sender_id 为 NULL，因为旧表只有昵称没有用户ID
-- 这些消息将显示为系统消息或匿名消息
