// 昵称生成词库
const adjectives = [
  '愤怒的', '神秘的', '迷失的', '快乐的', '忧郁的',
  '慵懒的', '暴躁的', '冷静的', '可爱的', '凶猛的',
  '温柔的', '勇敢的', '害羞的', '兴奋的', '困倦的',
  '聪明的', '糊涂的', '优雅的', '笨拙的', '孤独的'
];

const nouns = [
  '柠檬🍋', '土豆🥔', '章鱼🐙', '仙人掌🌵', '企鹅🐧',
  '猫头鹰🦉', '河豚🐡', '松鼠🐿️', '鳄鱼🐊', '海豹🦭',
  '熊猫🐼', '考拉🐨', '狐狸🦊', '兔子🐰', '猫咪🐱',
  '小狗🐶', '树懒🦥', '浣熊🦝', '刺猬🦔', '水獭🦦'
];

const avatarEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊',
  '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋',
  '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '😯',
  '🥱', '😴', '😪', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓'
];

// 文件上传限制
const FILE_LIMITS = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  file: {
    maxSize: 20 * 1024 * 1024, // 20MB
    mimes: [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },
  audio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    mimes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50MB
    mimes: ['video/mp4', 'video/webm', 'video/ogg']
  }
};

// Redis缓存配置
const CACHE_CONFIG = {
  MESSAGE_CACHE_LIMIT: 50,      // 房间消息缓存数量
  PRIVATE_CACHE_LIMIT: 30,      // 私聊消息缓存数量
  TYPING_INDICATOR_TTL: 3,      // 正在输入指示器过期时间（秒）
  USER_SESSION_TTL: 7200,       // 用户会话过期时间（秒）
  ONLINE_LIST_TTL: 300          // 在线列表缓存时间（秒）
};

// 房间配置
const ROOM_CONFIG = {
  MAX_MEMBERS: 100,             // 单个房间最大成员数
  DEFAULT_ROOM_ID: 1            // 默认房间ID（大厅）
};

// 消息配置
const MESSAGE_CONFIG = {
  MAX_LENGTH: 2000,             // 文本消息最大长度
  HISTORY_LOAD_LIMIT: 50        // 历史消息加载数量
};

module.exports = {
  adjectives,
  nouns,
  avatarEmojis,
  FILE_LIMITS,
  CACHE_CONFIG,
  ROOM_CONFIG,
  MESSAGE_CONFIG
};
