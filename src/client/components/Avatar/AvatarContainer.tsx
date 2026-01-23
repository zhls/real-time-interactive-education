import React, { useEffect, useRef, useState } from 'react'
import { AvatarController, AvatarState } from './AvatarController'
import { AVATAR_STATE_LABELS, AVATAR_STATE_COLORS } from '@shared/constants'
import { useApiKeyStore } from '../../store'

interface AvatarContainerProps {
  onSpeakingStart?: () => void
  onSpeakingEnd?: () => void
  onWidgetEvent?: (widget: any) => void
}

export const AvatarContainer: React.FC<AvatarContainerProps> = ({
  onSpeakingStart,
  onSpeakingEnd,
  onWidgetEvent
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<AvatarController | null>(null)
  const [state, setState] = useState<AvatarState>('offline')
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  // 从store获取密钥
  const { xmovAppId, xmovAppSecret } = useApiKeyStore()

  // 手动连接
  const handleConnect = async () => {
    if (!containerRef.current) return

    // 检查密钥是否存在
    if (!xmovAppId || !xmovAppSecret) {
      const errorMsg = '请先配置魔珐星云密钥'
      console.warn('[Avatar]', errorMsg)
      setInitError(errorMsg)
      return
    }

    setInitError(null)
    setIsConnecting(true)

    const controller = new AvatarController({
      containerId: 'avatar-container',
      appId: xmovAppId,
      appSecret: xmovAppSecret,
      onStateChange: (newState) => {
        setState(newState)
        console.log('[Avatar] State changed:', newState)
      },
      onVoiceStart: () => {
        onSpeakingStart?.()
      },
      onVoiceEnd: () => {
        onSpeakingEnd?.()
      },
      onWidgetEvent: (widget) => {
        onWidgetEvent?.(widget)
      },
      onError: (error) => {
        console.error('[Avatar] Error:', error)
        setInitError(error?.message || '连接失败')
        setIsConnecting(false)
      }
    })

    try {
      await controller.initialize()
      controllerRef.current = controller
      setIsInitialized(true)
      setInitError(null)
      setIsConnecting(false)
      console.log('[Avatar] Initialized successfully')

      // 主动问候
      setTimeout(() => {
        if (controllerRef.current) {
          controllerRef.current.speakWithAction(
            '你好！我是落星辰，很高兴能和你一起探索知识的奥秘。有什么想学习的定理或概念吗？',
            'Welcome'
          )
        }
      }, 2000)
    } catch (error) {
      console.error('[Avatar] Failed to initialize:', error)
      setInitError(error?.message || '初始化失败')
      setIsInitialized(false)
      setIsConnecting(false)
    }
  }

  // 手动断开
  const handleDisconnect = () => {
    setIsDisconnecting(true)
    if (controllerRef.current) {
      controllerRef.current.destroy()
      controllerRef.current = null
    }
    setIsInitialized(false)
    setState('offline')
    setInitError(null)
    setIsDisconnecting(false)
    console.log('[Avatar] Disconnected')
  }

  // 暴露控制器方法 - 使用同步方式确保更新
  useEffect(() => {
    // 将控制器挂载到 window 以便外部调用
    ;(window as any).avatarController = controllerRef.current
    console.log('[Avatar] Controller exposed to window:', controllerRef.current)
  })

  // 当控制器初始化时立即更新 window 引用
  useEffect(() => {
    if (isInitialized && controllerRef.current) {
      ;(window as any).avatarController = controllerRef.current
      console.log('[Avatar] Controller exposed to window (on init):', controllerRef.current)
    }
  }, [isInitialized])

  // 清理：组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy()
      }
    }
  }, [])

  // 获取状态描述
  const getStatusMessage = () => {
    if (initError) return initError
    if (!xmovAppId || !xmovAppSecret) return '等待配置密钥...'
    if (isConnecting) return '正在连接数字人...'
    if (isDisconnecting) return '正在断开连接...'
    if (!isInitialized) return '数字人未连接'
    return AVATAR_STATE_LABELS[state] || state
  }

  return (
    <div className="relative h-full min-h-0 flex flex-col">
      {/* 数字人容器 - 填满剩余空间 */}
      <div
        id="avatar-container"
        ref={containerRef}
        className="flex-1 min-h-0 w-full"
        style={{
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.1)'
        }}
      />

      {/* 状态指示栏 */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 border-t border-purple-200 flex justify-between items-center shadow-inner flex-shrink-0">
        <div className="flex items-center space-x-2">
          <StateIndicator state={state} isInitialized={isInitialized} hasError={!!initError} />
          <div className="flex flex-col">
            <span className={`text-xs font-medium ${initError ? 'text-red-600' : 'text-gray-700'}`}>
              {getStatusMessage()}
            </span>
            {isInitialized && !isConnecting && !isDisconnecting && (
              <span className="text-xs text-purple-600">✓ 已连接</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 连接控制按钮 */}
          {!isInitialized && !isConnecting ? (
            <button
              onClick={handleConnect}
              disabled={!xmovAppId || !xmovAppSecret}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-medium rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>🔗</span>
              <span>连接</span>
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>🔌</span>
              <span>{isDisconnecting ? '断开中' : '断开'}</span>
            </button>
          )}

          {/* 状态信息 */}
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <span className="hidden sm:inline">学习助手</span>
            {isInitialized && !isConnecting && !isDisconnecting && <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 状态指示器
 */
const StateIndicator: React.FC<{ state: AvatarState; isInitialized: boolean; hasError: boolean }> = ({ state, isInitialized, hasError }) => {
  let colorClass = AVATAR_STATE_COLORS[state] || 'bg-gray-400'

  if (hasError) {
    colorClass = 'bg-red-500'
  } else if (!isInitialized) {
    colorClass = 'bg-yellow-500 animate-pulse'
  }

  return (
    <div className={`w-4 h-4 rounded-full ${colorClass} shadow-sm`} />
  )
}

export default AvatarContainer
