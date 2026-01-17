// ==================== API 配置 ====================
export const API_CONFIG = {
  BASE_URL: '/api',
  CHAT_ENDPOINT: '/chat/send',
  STREAM_ENDPOINT: '/chat/stream',
  KNOWLEDGE_ENDPOINT: '/knowledge',
  SEARCH_ENDPOINT: '/knowledge/search',
  AVATAR_TOKEN_ENDPOINT: '/avatar/token'
} as const

// ==================== SDK 配置 ====================
export const SDK_CONFIG = {
  VERSION: '0.1.0-alpha.45',
  CDN_URL: 'https://media.youyan.xyz/youling-lite-sdk/index.umd.0.1.0-alpha.45.js',
  GATEWAY_SERVER: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session'
} as const

// ==================== AI 模型配置 ====================
export const AI_CONFIG = {
  CHAT_MODEL: 'deepseek-ai/DeepSeek-V3',
  EMBEDDING_MODEL: 'Qwen/Qwen3-Embedding-8B',
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 2000
} as const

// ==================== 学科配置 ====================
export const SUBJECT_CONFIG = {
  math: {
    name: '数学',
    icon: '📐',
    color: 'blue',
    topics: ['代数', '几何', '函数', '概率统计', '数论']
  },
  physics: {
    name: '物理',
    icon: '⚛️',
    color: 'purple',
    topics: ['力学', '热学', '电磁学', '光学', '量子物理']
  },
  chemistry: {
    name: '化学',
    icon: '🧪',
    color: 'green',
    topics: ['无机化学', '有机化学', '物理化学', '分析化学', '生物化学']
  }
} as const

export type SubjectCategory = keyof typeof SUBJECT_CONFIG

// 学科名称映射
export const SUBJECT_NAMES: Record<SubjectCategory, string> = {
  math: '数学',
  physics: '物理',
  chemistry: '化学'
}

// ==================== 难度配置 ====================
export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['基础', '进阶', '精通']

export type DifficultyLevel = '基础' | '进阶' | '精通'

export const DIFFICULTY_CONFIG = {
  基础: {
    level: 1,
    description: '适合初学者',
    color: 'green'
  },
  进阶: {
    level: 2,
    description: '需要基础知识',
    color: 'yellow'
  },
  精通: {
    level: 3,
    description: '需要深入理解',
    color: 'red'
  }
} as const

// ==================== Widget 类型配置 ====================
export const WIDGET_TYPES = {
  IMAGE: 'widget_pic',
  SLIDESHOW: 'widget_slideshow',
  TEXT: 'widget_text',
  FORMULA: 'widget_formula',
  DIAGRAM: 'widget_diagram'
} as const

// ==================== 数字人状态配置 ====================
export const AVATAR_STATE_LABELS = {
  offline: '离线',
  online: '在线',
  idle: '待机',
  interactive_idle: '互动待机',
  listen: '倾听中',
  think: '思考中',
  speak: '说话中'
} as const

export const AVATAR_STATE_COLORS = {
  offline: 'bg-gray-400',
  online: 'bg-green-400',
  idle: 'bg-blue-400',
  interactive_idle: 'bg-blue-500',
  listen: 'bg-cyan-500 animate-pulse',
  think: 'bg-yellow-500 animate-pulse',
  speak: 'bg-green-500 animate-pulse'
} as const

// ==================== 学习进度配置 ====================
export const LEARNING_CONFIG = {
  MASTER_THRESHOLD: 0.8, // 掌握度阈值
  REVIEW_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 复习间隔 (7天)
  DAILY_GOAL: 5, // 每日学习目标定理数
  MAX_STREAK_BONUS: 10 // 连续学习最大奖励
} as const

// ==================== 苏格拉底式提问配置 ====================
export const SOCRATIC_CONFIG = {
  MAX_QUESTIONS: 3, // 单次对话最多提问数
  HINT_INTERVAL: 2, // 提示间隔
  TIMEOUT_MS: 30000 // 等待用户响应超时
} as const

// ==================== 缓存配置 ====================
export const CACHE_CONFIG = {
  KNOWLEDGE_CACHE_TTL: 60 * 60 * 1000, // 知识库缓存时间 (1小时)
  EMBEDDING_CACHE_SIZE: 1000, // 向量缓存大小
  RESPONSE_CACHE_TTL: 5 * 60 * 1000 // 响应缓存时间 (5分钟)
} as const

// ==================== UI 配置 ====================
export const UI_CONFIG = {
  MESSAGE_ANIMATION_DURATION: 300,
  TYPING_DELAY: 50,
  MAX_VISIBLE_MESSAGES: 50,
  SCROLL_THRESHOLD: 100
} as const

// ==================== 错误消息 ====================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  API_ERROR: '服务暂时不可用，请稍后再试',
  TIMEOUT_ERROR: '请求超时，请重试',
  UNAUTHORIZED: '未授权访问',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '输入数据格式错误',
  UNKNOWN_ERROR: '发生未知错误'
} as const

// ==================== 成功消息 ====================
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: '消息发送成功',
  KNOWLEDGE_LOADED: '知识库加载完成',
  SESSION_STARTED: '学习会话已开始',
  PROGRESS_SAVED: '学习进度已保存'
} as const
