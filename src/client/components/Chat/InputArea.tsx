import React, { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../../store'
import { useAvatarStore } from '../../store'

interface InputAreaProps {
  onSend: (message: string, images?: string[]) => void
  disabled?: boolean
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isProcessing = useChatStore((state) => state.isProcessing)
  const avatarState = useAvatarStore((state) => state.state)

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/chat/upload-image', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.success) {
          newImages.push(data.imageUrl)
        }
      }

      setImages([...images, ...newImages])
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('图片上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 移除图片
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // 发送消息
  const handleSend = () => {
    if ((input.trim() || images.length > 0) && !isProcessing) {
      onSend(input, images)
      setInput('')
      setImages([])
    }
  }

  // 键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 语音输入
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsRecording(false)
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopVoiceInput = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <div className="space-y-4">
      {/* 图片预览区 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`上传的图片${index + 1}`}
                className="h-24 w-24 object-cover rounded-xl border border-purple-200 shadow-md"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* 图片上传按钮 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={isProcessing || uploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded-full transition shrink-0 ${(
            uploading
              ? 'bg-gray-200 text-gray-400'
              : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 hover:bg-gradient-to-r from-purple-200 to-pink-200'
          )}`}
          disabled={isProcessing || uploading}
          title="上传图片"
        >
          {uploading ? '⏳' : '📷'}
        </button>

        {/* 语音输入按钮 */}
        <button
          onClick={isRecording ? stopVoiceInput : startVoiceInput}
          className={`p-4 rounded-full transition shrink-0 ${(
            isRecording
              ? 'bg-red-100 text-red-600 animate-pulse'
              : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 hover:bg-gradient-to-r from-purple-200 to-pink-200'
          )}`}
          disabled={isProcessing}
          title="语音输入"
        >
          {isRecording ? '🛑' : '🎤'}
        </button>

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            images.length > 0
              ? '已添加图片，可以输入问题或直接发送'
              : isProcessing
              ? 'AI正在思考...'
              : '输入你的问题，或上传题目图片'
          }
          className="flex-1 px-5 py-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base bg-gradient-to-r from-purple-50 to-pink-50 focus:bg-white transition shadow-md"
          disabled={isProcessing || disabled}
        />

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          className={`px-8 py-4 rounded-xl font-medium transition shrink-0 ${(
            isProcessing || (!input.trim() && images.length === 0)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-200'
          )}`}
          disabled={isProcessing || (!input.trim() && images.length === 0)}
        >
          {isProcessing ? '思考中' : '发送'}
        </button>
      </div>

      {/* 提示文字 */}
      <div className="text-center text-xs text-gray-500 flex justify-between">
        <span>
          {isRecording
            ? '🎙️ 正在录音...'
            : uploading
            ? '📤 上传中...'
            : avatarState === 'listen'
            ? '👂 正在倾听...'
            : images.length > 0
            ? `已选择 ${images.length} 张图片`
            : '按 Enter 发送'}
        </span>
        <span>支持上传题目图片解析</span>
      </div>
    </div>
  )
}

export default InputArea
