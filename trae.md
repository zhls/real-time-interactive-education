# 学习辅导助手：智能学习顾问系统

## 项目概述

**赛道**: AI 实时交互教育
**项目名称**: 学习辅导助手：智能学习顾问系统
**项目描述**: 通过AI数字人进行学习辅导，提供专业的学习建议和方法指导，结合语音交互和情感化反馈，增强学习过程的互动性和趣味性。

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18.x + TypeScript |
| 构建工具 | Vite 5.x |
| 样式方案 | TailwindCSS |
| 状态管理 | Zustand |
| 后端框架 | Node.js + Express + TypeScript |
| 数字人SDK | 魔珐星云具身驱动SDK (0.1.0-alpha.45) |
| AI服务 | 魔搭社区 ModelScope |
| AI模型 | deepseek-ai/DeepSeek-V3.2 |

## 项目结构

```
real-time-interactive-education/
├── src/
│   ├── client/                    # React 前端
│   │   ├── components/            # 组件
│   │   │   ├── Admin/             # 管理组件
│   │   │   ├── Avatar/            # 数字人组件
│   │   │   │   ├── AvatarContainer.tsx # 数字人容器
│   │   │   │   ├── AvatarController.ts # 数字人控制器
│   │   │   │   └── index.ts
│   │   │   ├── Chat/              # 对话组件
│   │   │   │   ├── ChatBox.tsx        # 对话框
│   │   │   │   └── index.ts
│   │   │   ├── Subject/           # 学科组件
│   │   │   │   └── index.ts
│   │   │   └── UI/                # 通用UI组件
│   │   │       ├── ApiKeyModal.tsx   # API密钥配置
│   │   │       └── index.ts
│   │   ├── services/              # 服务层
│   │   │   ├── keyService.ts        # 密钥管理
│   │   │   ├── dataService.ts       # 数据服务
│   │   │   └── index.ts
│   │   ├── store/                 # Zustand 状态管理
│   │   │   ├── avatarStore.ts       # 数字人状态
│   │   │   ├── dataStore.ts         # 数据状态
│   │   │   ├── keyStore.ts          # 密钥状态
│   │   │   ├── taskStore.ts         # 任务状态
│   │   │   └── index.ts
│   │   ├── App.tsx                # 应用入口
│   │   └── main.tsx               # React 挂载
│   ├── server/                    # Express 后端
│   │   ├── routes/                # API路由
│   │   │   ├── data.routes.ts        # 数据接口
│   │   │   ├── chat.routes.ts        # 对话接口
│   │   │   └── index.ts
│   │   ├── services/              # 业务服务
│   │   │   ├── aiDataGenerator.ts     # AI数据生成
│   │   │   ├── chatService.ts         # 对话服务
│   │   │   ├── enhancedDataGenerator.ts # 增强数据生成
│   │   │   └── index.ts
│   │   └── app.ts                 # Express 应用
│   └── shared/                    # 前后端共享
│       ├── types/                 # 共享类型
│       │   └── index.ts
│       └── constants/             # 常量
│           └── index.ts
├── data/                         # 数据文件
│   └── mock/                     # 模拟学习数据
├── index.html                    # HTML入口
├── package.json                  # 依赖配置
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── tsconfig.server.json         # Node TypeScript 配置
└── .env.server                  # 环境变量模板
```

## 核心功能

### 1. 智能学习对话
- 支持文本和语音输入
- 流式响应，实时反馈
- 基于学习知识库，确保专业性和准确性
- 具身智能体验：数字人在对话过程中保持自然的表情和轻微动作

### 2. 语音交互
- 支持语音提问，解放双手
- 数字人自动播报学习建议
- 自然流畅的对话体验

### 3. 学习分析与建议
- 基于用户描述的学习情况，分析学习需求和问题
- 提供定制化的学习计划和方法建议
- 基于学习科学原理，给出专业的学习策略

### 4. 情感化动作反馈
- 根据语义分析，数字人做出点头、挥手等相应动作
- 针对积极内容，数字人会做出鼓励性动作
- 针对困难内容，数字人会做出安慰和支持性动作

### 5. 多场景学习指导
- 覆盖日常学习、考试复习、时间管理等多个场景
- 提供个性化学习方法和技巧
- 帮助用户制定合理的学习计划和目标

## API 设计

### POST /api/chat/stream
流式对话接口（SSE）

**请求体**
```json
{
  "message": "如何提高学习效率？",
  "conversationHistory": [],
  "currentData": { ... }
}
```

**响应** (SSE流)
```
data: {"type":"content","data":"提高学习效率的关键"}
data: {"type":"content","data":"是合理规划时间"}
data: {"type":"end"}
```

### GET /api/data
获取学习数据

### GET /health
健康检查接口

## 环境变量

```bash
# 后端环境变量
PORT=5177
NODE_ENV=development
MODELSCOPE_MODEL=deepseek-ai/DeepSeek-V3.2
EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B
MOCK_DATA_ENABLED=true
AUTO_UPDATE_INTERVAL=30000
```

## 开发计划

### Phase 1: 基础架构 ✅
- [x] 项目结构初始化
- [x] 前后端基础框架搭建
- [x] Vite 配置和开发环境
- [x] 数字人 SDK 集成
- [x] 基础 UI 组件

### Phase 2: 对话系统 ✅
- [x] 对话 API 实现
- [x] SSE 流式响应
- [x] 消息状态管理
- [x] 数字人语音同步

### Phase 3: 学习功能 ✅
- [x] 学习建议生成
- [x] 语音交互功能
- [x] 情感化动作反馈

### Phase 4: 体验优化 ✅
- [x] 响应式设计
- [x] 性能优化
- [x] 错误处理

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
npm start
```

## 注意事项

1. 确保所有环境变量正确配置
2. 数字人 SDK 需要有效的魔珐星云账号
3. AI 调用需要魔搭社区的 API Key
4. 开发时注意跨域配置
5. 生产环境需配置 HTTPS

## 界面说明

### 数字人展示
- 屏幕中央20%区域，圆形渐变背景
- 1920x1080设计，自动缩放

### 对话界面
- 直观的聊天界面，支持语音和文字输入
- 响应式设计，适配不同屏幕尺寸

### 顶部导航
- **设置** ⚙️：配置 API 密钥

### 数字人状态
- offline：离线
- listen：倾听
- think：思考
- speak：说话
- idle：待机

## License

MIT
