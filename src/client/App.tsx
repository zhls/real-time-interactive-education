import React, { useEffect, useRef, useState } from 'react'
import { useChatStore, useSubjectStore, useAvatarStore, useApiKeyStore } from './store'
import { chatService } from './services'
import { AvatarContainer } from './components/Avatar'
import { ChatBox, InputArea } from './components/Chat'
import { ApiKeyModal } from './components/UI'
import { AdminPanel } from './components/Admin'

function App() {
  const controllerRef = useRef<any>(null)

  // Admin Panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  // Quick Actions state
  const quickActionsButtonRef = useRef<HTMLButtonElement>(null)
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Chat Store
  const {
    messages,
    addMessage,
    setProcessing,
    currentResponse,
    setCurrentResponse,
    appendCurrentResponse,
    clearMessages,
    getConversationHistory,
    sessionId,
    setSessionId
  } = useChatStore()

  // Subject Store
  const {
    incrementStreak
  } = useSubjectStore()

  // Avatar Store
  const { setState: setAvatarState } = useAvatarStore()

  // API Key Management
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const { hasKeys } = useApiKeyStore()

  // 检查是否需要显示密钥输入对话框
  useEffect(() => {
    if (!hasKeys) {
      setShowApiKeyModal(true)
    }
  }, [hasKeys])

  // 初始化会话
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}`)
    }
  }, [])

  // 同步数字人控制器引用 - 使用轮询确保获取到控制器
  useEffect(() => {
    const checkController = () => {
      const controller = (window as any).avatarController
      if (controller && controller !== controllerRef.current) {
        controllerRef.current = controller
        console.log('[App] Avatar controller synced:', controller)
      }
    }

    // 立即检查一次
    checkController()

    // 轮询检查控制器是否可用（每秒检查一次，最多检查10秒）
    const intervals = []
    for (let i = 0; i < 10; i++) {
      const timeout = setTimeout(checkController, i * 1000)
      intervals.push(timeout)
    }

    return () => {
      intervals.forEach(clearTimeout)
    }
  }, [])

  // 处理消息发送
  const handleSendMessage = async (text: string, images?: string[]) => {
    // 确保控制器是最新的
    const controller = (window as any).avatarController
    if (controller && controller !== controllerRef.current) {
      controllerRef.current = controller
      console.log('[App] Avatar controller updated before send:', controller)
    }
    // 获取对话历史（在添加当前消息之前获取）
    const history = getConversationHistory()

    // 构建用户消息内容（支持多模态）
    const userContent: string | any[] = text
    let contentForDisplay: string | any[] = text

    // 如果有图片，构建多模态内容用于显示
    if (images && images.length > 0) {
      contentForDisplay = [
        { type: 'text', text: text || '请分析这道题目，提供详细的解题步骤' }
      ]
      for (const imageUrl of images) {
        contentForDisplay.push({
          type: 'image_url',
          image_url: { url: imageUrl }
        })
      }
    }

    // 添加用户消息到本地状态
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: contentForDisplay,
      timestamp: Date.now()
    })

    setProcessing(true)
    setCurrentResponse('')

    // 数字人进入倾听状态
    setAvatarState('listen')
    controllerRef.current?.setListen()

    // 数字人进入思考状态
    setAvatarState('think')
    controllerRef.current?.setThink()

    // 创建文本流收集器，用于传递给数字人
    let fullResponse = ''
    let isFirstChunk = true
    let streamEnded = false

    // 流式对话
    await chatService.sendMessageStream(
      {
        message: text,
        images: images,
        sessionId,
        conversationHistory: history
      },
      // onChunk - 实时更新文本并传递给数字人
      (chunk) => {
        if (isFirstChunk) {
          isFirstChunk = false
          // 第一个chunk到达，数字人开始说话
          setAvatarState('speak')
        }
        fullResponse += chunk
        appendCurrentResponse(chunk)
      },
      // onComplete
      (finalResponse) => {
        streamEnded = true
        // 添加助手消息
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: finalResponse,
          timestamp: Date.now()
        })

        setCurrentResponse('')
        setProcessing(false)
        incrementStreak()

        // 直接调用数字人说话方法，一次性说完整回复
        if (controllerRef.current && finalResponse) {
          setAvatarState('speak')
          controllerRef.current.speak({
            text: finalResponse,
            isStart: true,
            isEnd: true
          })
        }

        // 等待数字人说话完成（模拟）
        setTimeout(() => {
          setAvatarState('interactive_idle')
        }, finalResponse.length * 100) // 估算说话时间
      },
      // onError
      (error) => {
        streamEnded = true
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '系统暂时无法响应，请稍后再试',
          timestamp: Date.now()
        })
        setCurrentResponse('')
        setProcessing(false)
        setAvatarState('idle')
      }
    )
  }

  // 清空对话
  const handleClearChat = () => {
    clearMessages()
    chatService.clearSession(sessionId)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      {/* API Key Modal */}
      {showApiKeyModal && (
        <ApiKeyModal onClose={() => setShowApiKeyModal(false)} />
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* 顶部导航 - 现代时尚风格 */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xl flex-shrink-0">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h1 className="text-xl font-bold">智慧学习空间</h1>
                <p className="text-sm text-purple-200 hidden sm:block">激发学习潜能，探索知识边界</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdminPanel(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full transition-all flex items-center space-x-2"
              >
                <span>📚</span>
                <span className="hidden sm:inline">学习资源</span>
              </button>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full transition-all flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">系统配置</span>
              </button>
              <button
                onClick={handleClearChat}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full transition-all flex items-center space-x-2"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">清空对话</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 - 重新设计的布局 */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
          {/* 左侧：对话区域 - 占4列 */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0 overflow-hidden">
            {/* 顶部：学习统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">对话次数</p>
                    <p className="text-2xl font-bold text-gray-800">{messages.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 p-3 rounded-xl">
                    <span className="text-xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-sm text-pink-600 font-medium">连续学习</p>
                    <p className="text-2xl font-bold text-gray-800">{useSubjectStore.getState().learningProgress.currentStreak} 天</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">学习状态</p>
                    <p className="text-2xl font-bold text-gray-800">活跃</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 对话记录 */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 border-b border-purple-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">对话中心</h2>
                <div className="flex items-center space-x-3">
                  <button
                  ref={quickActionsButtonRef}
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="flex items-center space-x-2 px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full shadow-sm hover:shadow-md transition-all transform hover:scale-105 active:scale-95"
                  title="快捷提问"
                >
                  <span>⚡</span>
                  <span>快捷提问</span>
                </button>
                  <span className="text-xs text-gray-500">{messages.length} 条消息</span>
                </div>
              </div>
              <div className="p-6 h-[calc(100%-80px)] overflow-auto">
                <ChatBox
                  messages={messages}
                  currentResponse={currentResponse}
                  isProcessing={useChatStore.getState().isProcessing}
                  onQuickQuestion={handleSendMessage}
                  messageCount={messages.length}
                  learningStreak={useSubjectStore.getState().learningProgress.currentStreak}
                  quickActionsButtonRef={quickActionsButtonRef}
                  showQuickActions={showQuickActions}
                  setShowQuickActions={setShowQuickActions}
                />
              </div>
            </div>

            {/* 输入框 */}
            <div className="flex-shrink-0 bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">你的问题</h3>
              <InputArea onSend={handleSendMessage} />
            </div>
          </div>

          {/* 右侧：数字人区域 - 占1列（更小比例） */}
          <div className="lg:col-span-1 h-full">
            <div className="h-full bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 border-b border-purple-200">
                <h2 className="text-lg font-semibold text-gray-800">学习助手</h2>
              </div>
              <div className="h-[calc(100%-70px)]">
                <AvatarContainer
                  onSpeakingStart={() => setAvatarState('speak')}
                  onSpeakingEnd={() => setAvatarState('interactive_idle')}
                  onWidgetEvent={(widget) => console.log('Widget:', widget)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部信息栏 */}
      <footer className="bg-gradient-to-r from-purple-900 to-pink-900 text-white shadow-inner flex-shrink-0">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span>智慧学习空间 © 2026</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">创造愉快的学习体验</span>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                <span className="text-sm">服务运行中</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
