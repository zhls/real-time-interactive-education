import React, { useState, useRef, useEffect } from 'react';
import keyService from '../../services/keyService';
import avatarController from '../Avatar/AvatarController';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatBoxProps {
  currentData?: any;
  onSpeak?: (text: string) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ currentData, onSpeak }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingStatus, setSpeakingStatus] = useState<'idle' | 'speaking'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');

        setInputValue(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // 开始语音输入
  const startListening = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音识别功能，请使用Chrome浏览器。');
      return;
    }

    setIsListening(true);
    recognitionRef.current.start();
  };

  // 停止语音输入
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 输入框自动聚焦
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const inputElement = document.querySelector('input[placeholder="输入健康问题或点击麦克风说话..."]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [isLoading, messages.length]);

  // 发送消息
  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();

    try {
      const apiKey = keyService.getModelScopeApiKey();
      if (!apiKey) {
        throw new Error('未配置魔搭API密钥');
      }

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-modelscope-api-key': apiKey
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages,
          currentData: { ...currentData, scenario: 'current' }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      // 创建助手消息
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // 读取流
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content') {
                // 追加内容
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content += parsed.data;
                  }
                  return newMessages;
                });
              } else if (parsed.type === 'end') {
                setIsLoading(false);

                // 数字人播报响应
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
                    // 使用数字人SDK播报
                    try {
                      // 检查连接状态
                      const status = avatarController.getStatus();
                      if (status === 'connected') {
                        avatarController.speak({
                          text: lastMessage.content,
                          isStart: true,
                          isEnd: false
                        });
                        setSpeakingStatus('speaking');
                        // 移除固定超时，让SDK自己管理状态
                      } else {
                        console.log('数字人未连接，跳过播报');
                      }
                    } catch (e) {
                      console.log('Avatar speak failed:', e);
                    }
                  }
                  return newMessages;
                });
              } else if (parsed.type === 'error') {
                setIsLoading(false);
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = `⚠️ ${parsed.error || '处理失败'}`;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('[ChatBox] Error:', error);
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `⚠️ ${error.message || '请求失败，请稍后重试'}`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      setIsLoading(false);
    }
  };

  // 停止生成
  const stopGenerating = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  // 快捷问题
  const quickQuestions = [
    '如何提高学习效率？',
    '怎样有效记忆知识点？',
    '如何制定合理的学习计划？',
    '考试前应该如何复习？',
    '如何解决学习中的困难？',
    '怎样保持学习动力？'
  ];

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📚</span>
          <span>学习辅导</span>
        </h3>
        <button
          onClick={() => setMessages([])}
          className="text-white/60 hover:text-white text-sm transition"
        >
          清空对话
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-white/50 py-8">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-sm">有什么学习问题需要辅导吗？</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/90'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl px-4 py-2 flex items-center gap-2 max-w-[80%]">
              <div className="animate-spin text-sm">⏳</div>
              <div className="flex-1">
                <span className="text-white/70 text-sm">正在思考...</span>
                <div className="flex gap-1 mt-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              <button
                onClick={stopGenerating}
                className="text-white/50 hover:text-white text-xs ml-2 whitespace-nowrap"
              >
                停止
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 快捷问题 */}
      {messages.length === 0 && !isLoading && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInputValue(q)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full text-xs transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入框 */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入学习问题或点击麦克风说话..."
            disabled={isLoading}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 disabled:opacity-50"
          />
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={`px-3 py-2 rounded-xl transition ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-white/20 hover:bg-white/30'
            } text-white`}
            title={isListening ? '停止录音' : '开始语音输入'}
          >
            🎤
          </button>
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '发送中' : '发送'}
          </button>
        </div>

        {/* 状态提示 */}
        <div className="flex justify-between items-center mt-2 text-xs">
          <div className="flex items-center gap-3">
            {isListening && (
              <span className="text-red-400 animate-pulse">🎙️ 正在录音...</span>
            )}
            {speakingStatus === 'speaking' && (
              <span className="text-green-400">🗣️ 数字人正在回答...</span>
            )}
          </div>
          <span className="text-white/40">支持语音输入 | AI响应自动播报</span>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
