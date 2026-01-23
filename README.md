# 学习辅导助手：智能学习顾问系统

**赛道**: AI 实时交互教育

## 项目简介

本项目是一个基于魔珐星云3D数字人和魔搭社区AI大模型的智能学习辅导系统。通过：

- 🤖 **3D数字人交互** - 实时语音对话，生动的教学体验
- 📚 **智能学习对话** - AI助手根据用户问题提供专业学习建议
- 🔊 **语音播报** - 数字人自动播报学习建议，支持语音交互
- 🎭 **3D数字人** - 魔珐星云3D数字人提供拟人化学习辅导服务
- 🎤 **语音输入** - 支持语音提问，解放双手
- 💡 **学习建议** - 智能提供个性化学习方法和技巧

## 技术栈

### 前端
- React 18.x + TypeScript
- Vite 5.x
- TailwindCSS
- Zustand (状态管理)
- Web Speech API (语音识别)

### 后端
- Node.js + Express + TypeScript
- 魔搭社区 ModelScope API
- DeepSeek-V3.2

### 数字人
- 魔珐星云具身驱动 SDK v0.1.0-alpha.45

## 项目结构

```
real-time-interactive-education/
├── src/
│   ├── client/                    # React 前端
│   │   ├── components/            # 组件
│   │   │   ├── Admin/             # 管理组件
│   │   │   ├── Avatar/            # 数字人组件
│   │   │   ├── Chat/              # 对话组件
│   │   │   ├── Subject/           # 学科组件
│   │   │   └── UI/                # 通用 UI 组件
│   │   ├── services/              # 服务层
│   │   │   ├── keyService.ts      # 密钥管理
│   │   │   └── dataService.ts     # 数据服务
│   │   ├── store/                 # Zustand 状态管理
│   │   │   ├── avatarStore.ts     # 数字人状态
│   │   │   ├── dataStore.ts       # 数据状态
│   │   │   ├── keyStore.ts        # 密钥状态
│   │   │   └── taskStore.ts       # 任务状态
│   │   ├── App.tsx                # 应用入口
│   │   └── main.tsx               # React 挂载
│   ├── server/                    # Express 后端
│   │   ├── routes/                # API 路由
│   │   │   ├── data.routes.ts     # 数据接口
│   │   │   └── chat.routes.ts     # 对话接口
│   │   ├── services/              # 业务服务
│   │   │   ├── aiDataGenerator.ts # AI数据生成
│   │   │   ├── chatService.ts     # 对话服务
│   │   │   └── enhancedDataGenerator.ts # 增强数据生成
│   │   └── app.ts                 # Express 应用
│   └── shared/                    # 前后端共享
│       ├── constants/             # 常量
│       └── types/                 # 类型定义
├── data/                          # 数据文件
│   └── mock/                      # 模拟学习数据
├── index.html                     # HTML入口
├── package.json                   # 依赖配置
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
├── tsconfig.server.json           # Node TypeScript 配置
└── .env.server                    # 后端环境变量
```

## 快速开始

### 1. 环境准备

- Node.js 24.11.1
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5175 查看应用。

### 4. 配置密钥

首次访问时需要配置以下密钥（存储在浏览器 localStorage）：

| 密钥 | 获取方式 | 用途 |
|------|----------|------|
| 魔搭社区 API 密钥 | [魔搭社区](https://modelscope.cn) 创建新令牌 | AI数据生成和对话 |
| 魔珐星云 App ID | [星云控制台](https://xingyun3d.com) 创建应用 | 数字人连接 |
| 魔珐星云 App Secret | 星云控制台获取 | 数字人认证 |

## 核心功能

### 1. 智能学习对话

AI 数字人 "小学习" 可以通过自然对话提供专业学习建议：
- 支持流式响应，实时反馈
- 基于学习知识库，确保专业性和准确性
- 提供个性化的学习方法和技巧
- 保持专业、友好、鼓励的态度

### 2. 语音交互

- 支持语音提问，解放双手
- 数字人自动播报学习建议
- 自然流畅的对话体验

### 3. 学习分析与建议

- 基于用户描述的学习情况，分析学习需求和问题
- 提供定制化的学习计划和方法建议
- 基于学习科学原理，给出专业的学习策略
- 帮助用户制定合理的学习计划和目标

### 4. 情感化反馈

- 根据语义分析，数字人做出点头、挥手等相应动作
- 针对积极内容，数字人会做出鼓励性动作
- 针对困难内容，数字人会做出安慰和支持性动作
- 数字人的动作与语音内容同步，形成协调的情感表达

## API 接口

### 对话接口

#### POST /api/chat/stream
流式学习对话接口（SSE）

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

### 数据接口

#### GET /api/data
获取学习数据

### 健康检查

#### GET /health
健康检查接口

## 部署说明

### 构建生产版本

```bash
npm run build
npm start
```

## 许可证

MIT License
