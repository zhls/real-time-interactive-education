import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { ChatMessage } from '@shared/types'
import { QuickActionsPopover } from './QuickActionsPopover'
import 'katex/dist/katex.min.css'

interface ChatBoxProps {
  messages: ChatMessage[]
  currentResponse?: string
  isProcessing?: boolean
  onQuickQuestion?: (question: string) => void
  messageCount?: number
  learningStreak?: number
  quickActionsButtonRef?: React.RefObject<HTMLButtonElement>
  showQuickActions?: boolean
  setShowQuickActions?: React.Dispatch<React.SetStateAction<boolean>>
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  currentResponse,
  isProcessing,
  onQuickQuestion,
  messageCount = 0,
  learningStreak = 0,
  quickActionsButtonRef: externalQuickActionsButtonRef,
  showQuickActions: externalShowQuickActions,
  setShowQuickActions: externalSetShowQuickActions
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  
  // 使用外部传入的状态或内部状态
  const [internalShowQuickActions, setInternalShowQuickActions] = useState(false)
  const showQuickActions = externalShowQuickActions !== undefined ? externalShowQuickActions : internalShowQuickActions
  const setShowQuickActions = externalSetShowQuickActions !== undefined ? externalSetShowQuickActions : setInternalShowQuickActions
  
  // 使用外部传入的 ref 或内部 ref
  const internalQuickActionsButtonRef = useRef<HTMLButtonElement>(null)
  const quickActionsButtonRef = externalQuickActionsButtonRef !== undefined ? externalQuickActionsButtonRef : internalQuickActionsButtonRef
  
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  // 移除暴露方法和 ref 给外部的逻辑，因为我们现在使用 props 传递状态和 ref
  React.useEffect(() => {
    // 清理副作用，移除可能添加的类名
    return () => {
      const container = scrollContainerRef.current?.parentElement
      if (container) {
        container.classList.remove('chat-box-container')
      }
    }
  }, [])

  // 上一次的消息数量，用于检测新消息
  const prevMessageCountRef = React.useRef(0)

  // 只在有新消息添加时自动滚动到底部
  React.useEffect(() => {
    const currentCount = messages.length
    const prevCount = prevMessageCountRef.current

    // 只在有新消息时自动滚动
    if (currentCount > prevCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      prevMessageCountRef.current = currentCount
    }
  }, [messages.length])

  // 检测用户手动滚动，显示/隐藏"滚动到底部"按钮
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100
    setShowScrollToBottom(!isAtBottom)
  }

  // 手动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 点击外部关闭弹出框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showQuickActions &&
        quickActionsButtonRef.current &&
        !quickActionsButtonRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.quick-actions-popover')
      ) {
        setShowQuickActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showQuickActions, setShowQuickActions])

  return (
    <div className="flex flex-col h-full relative">
      {/* 快捷提问弹出框 */}
      {showQuickActions && onQuickQuestion && (
        <QuickActionsPopover
          buttonRef={quickActionsButtonRef}
          onSelect={(question) => {
            onQuickQuestion(question)
            setShowQuickActions(false)
          }}
        />
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-6 p-2 relative"
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* 当前响应（流式） */}
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-3xl px-5 py-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 text-gray-800 shadow-md border border-purple-100">
              <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {currentResponse}
                </ReactMarkdown>
              </div>
              <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1 align-middle" />
            </div>
          </div>
        )}

        {/* 处理中指示器 */}
        {isProcessing && !currentResponse && (
          <div className="flex justify-start">
            <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 shadow-md border border-purple-100">
              <div className="flex space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 滚动到底部按钮 */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="滚动到底部"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user'

  // 检查是否为多模态内容
  const isMultimodal = Array.isArray(message.content)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl px-5 py-4 rounded-2xl shadow-md border ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-purple-200'
            : 'bg-gradient-to-r from-purple-50 to-pink-50 text-gray-800 border-purple-100'
        }`}
      >
        {/* 多模态内容：显示图片和文本 */}
        {isMultimodal ? (
          <div className="space-y-4">
            {message.content.map((item: any, index: number) => {
              if (item.type === 'text') {
                return (
                  <div key={index} className="text-sm leading-relaxed prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {item.text}
                    </ReactMarkdown>
                  </div>
                )
              } else if (item.type === 'image_url') {
                return (
                  <img
                    key={index}
                    src={item.image_url.url}
                    alt={`上传的图片${index + 1}`}
                    className="max-w-full h-auto rounded-xl border border-purple-200 shadow-sm"
                  />
                )
              }
              return null
            })}
          </div>
        ) : (
          /* 纯文本内容 */
          <div className="text-sm leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* 相关定理 */}
        {message.relatedTheorems && message.relatedTheorems.length > 0 && !isUser && (
          <div className="mt-4 pt-3 border-t border-purple-200">
            <p className="text-xs font-medium text-gray-600 mb-2">📚 相关定理：</p>
            <div className="flex flex-wrap gap-2">
              {message.relatedTheorems.map((theorem, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/70 rounded-full text-xs text-purple-700"
                >
                  {theorem}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 时间戳 */}
        <span className={`text-xs mt-2 block ${isUser ? 'opacity-70' : 'text-gray-600'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

export default ChatBox
