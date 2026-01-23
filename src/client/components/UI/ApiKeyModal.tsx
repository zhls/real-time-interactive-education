import React, { useState } from 'react'
import { X, Key, ShieldCheck, Eye, EyeOff, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useApiKeyStore } from '../../store'

interface ApiKeyModalProps {
  onClose: () => void
}

// 内置演示密钥
const DEMO_KEYS = {
  modelScopeApiKey: 'ms-7634b763-a22e-4be8-94ca-912ff438add1',
  xmovAppId: '8ad755402aad4c62b7db0fd1d20cdbc1',
  xmovAppSecret: 'e23ecee1c318471fb1db64f5a36d36e6'
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid'

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [modelScopeApiKey, setModelScopeApiKey] = useState('')
  const [xmovAppId, setXmovAppId] = useState('')
  const [xmovAppSecret, setXmovAppSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle')
  const [validationMessage, setValidationMessage] = useState('')

  const setKeys = useApiKeyStore((state) => state.setKeys)

  // 从localStorage恢复已有密钥
  React.useEffect(() => {
    const storedKeys = useApiKeyStore.getState()
    setModelScopeApiKey(storedKeys.modelScopeApiKey)
    setXmovAppId(storedKeys.xmovAppId)
    setXmovAppSecret(storedKeys.xmovAppSecret)
  }, [])

  // 验证 API 密钥
  const handleValidateKey = async () => {
    if (!modelScopeApiKey.trim()) {
      setError('请先输入 API 密钥')
      return
    }

    setValidationStatus('validating')
    setValidationMessage('')
    setError('')

    try {
      const response = await fetch('/api/chat/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: modelScopeApiKey.trim() })
      })

      const data = await response.json()

      if (data.valid) {
        setValidationStatus('valid')
        setValidationMessage(data.message || 'API 密钥验证成功')
      } else {
        setValidationStatus('invalid')
        setValidationMessage(data.error || 'API 密钥无效')
      }
    } catch (err: any) {
      setValidationStatus('invalid')
      setValidationMessage(err.message || '验证请求失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 验证输入
    if (!modelScopeApiKey.trim() || !xmovAppId.trim() || !xmovAppSecret.trim()) {
      setError('请填写所有必填项')
      return
    }

    setIsLoading(true)

    try {
      // 保存密钥到store和localStorage
      setKeys({
        modelScopeApiKey: modelScopeApiKey.trim(),
        xmovAppId: xmovAppId.trim(),
        xmovAppSecret: xmovAppSecret.trim()
      })

      // 成功后关闭对话框（不需要刷新页面）
      setIsLoading(false)
      onClose()
    } catch (err: any) {
      setError(err.message || '保存密钥失败')
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // 允许跳过，但不保存
    onClose()
  }

  // 使用演示密钥
  const handleUseDemoKeys = () => {
    setModelScopeApiKey(DEMO_KEYS.modelScopeApiKey)
    setXmovAppId(DEMO_KEYS.xmovAppId)
    setXmovAppSecret(DEMO_KEYS.xmovAppSecret)
    setError('')
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-purple-200">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-10 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Key className="h-7 w-7" />
                <span>API 密钥管理</span>
              </h2>
              <p className="text-sm text-pink-100 mt-1">配置您的 API 密钥以解锁全部智能辅导功能</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full hover:bg-white hover:bg-opacity-20 transition-all transform hover:scale-110"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="p-10">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：API 密钥输入区域 */}
              <div className="space-y-8">
                {error && (
                  <div className="bg-pink-50 border border-pink-200 text-pink-700 px-5 py-4 rounded-xl text-sm flex items-center space-x-3 transform hover:scale-[1.01] transition-all">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 魔搭API密钥 */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                  <label className="block text-sm font-semibold text-purple-800 mb-4">
                    <span className="flex items-center space-x-2">
                      <ShieldCheck className="h-5 w-5 text-purple-600" />
                      <span>魔搭 ModelScope API Key <span className="text-pink-500">*</span></span>
                    </span>
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="password"
                        value={modelScopeApiKey}
                        onChange={(e) => {
                          setModelScopeApiKey(e.target.value)
                          if (validationStatus !== 'idle') {
                            setValidationStatus('idle')
                            setValidationMessage('')
                          }
                        }}
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                        className={`w-full px-5 py-4 border rounded-xl focus:ring-3 focus:ring-pink-300 focus:border-transparent transition
                          ${validationStatus === 'valid'
                            ? 'border-green-300 bg-green-50'
                            : validationStatus === 'invalid'
                            ? 'border-pink-300 bg-pink-50'
                            : 'border-purple-200'}`}
                        disabled={isLoading}
                      />
                    </div>
                    {/* 验证按钮 */}
                    <button
                      type="button"
                      onClick={handleValidateKey}
                      disabled={isLoading || validationStatus === 'validating' || !modelScopeApiKey.trim()}
                      className={`w-full text-sm font-medium py-3 rounded-xl border transition disabled:opacity-50 disabled:cursor-not-allowed
                        ${validationStatus === 'valid'
                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          : validationStatus === 'invalid'
                          ? 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
                          : validationStatus === 'validating'
                          ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                          : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'}`}
                    >
                      {validationStatus === 'validating' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="h-4 w-4 animate-spin" />
                          <span>正在验证...</span>
                        </div>
                      ) : validationStatus === 'valid' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>验证成功</span>
                        </div>
                      ) : validationStatus === 'invalid' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>验证失败</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <ShieldCheck className="h-4 w-4" />
                          <span>验证密钥</span>
                        </div>
                      )}
                    </button>
                    {/* 验证状态消息 */}
                    {validationMessage && (
                      <div className={`text-xs px-4 py-3 rounded-lg flex items-center space-x-2
                        ${validationStatus === 'valid'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-pink-50 text-pink-700 border border-pink-200'}`}>
                        <span>{validationStatus === 'valid' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}</span>
                        <span>{validationMessage}</span>
                      </div>
                    )}
                    <p className="text-xs text-purple-600">
                      用于调用 DeepSeek-V3 模型进行智能对话和辅导
                    </p>
                  </div>
                </div>

                {/* 魔法星云密钥 */}
                <div className="space-y-6">
                  {/* 魔法星云配置 */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* 魔法星云应用ID */}
                    <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                      <label className="block text-sm font-semibold text-purple-800 mb-4">
                        <span className="flex items-center space-x-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          <span>魔珐星云 App ID <span className="text-pink-500">*</span></span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={xmovAppId}
                          onChange={(e) => setXmovAppId(e.target.value)}
                          placeholder="your-app-id"
                          className="w-full px-5 py-4 border border-purple-200 rounded-xl focus:ring-3 focus:ring-pink-300 focus:border-transparent transition"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* 魔法星云应用密钥 */}
                    <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl border border-purple-100">
                      <label className="block text-sm font-semibold text-purple-800 mb-4">
                        <span className="flex items-center space-x-2">
                          <Key className="h-5 w-5 text-purple-600" />
                          <span>魔珐星云 App Secret <span className="text-pink-500">*</span></span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={xmovAppSecret}
                          onChange={(e) => setXmovAppSecret(e.target.value)}
                          placeholder="your-app-secret"
                          className="w-full px-5 py-4 pr-14 border border-purple-200 rounded-xl focus:ring-3 focus:ring-pink-300 focus:border-transparent transition"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 transition-colors"
                          disabled={isLoading}
                        >
                          {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：信息和操作区域 */}
              <div className="space-y-8">
                {/* 密钥安全说明 */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span>安全与隐私</span>
                  </h3>
                  <ul className="space-y-3 text-sm text-purple-700">
                    <li className="flex items-start space-x-3">
                      <div className="mt-1">✅</div>
                      <div>所有密钥仅存储在您的浏览器本地存储中，不会上传到任何服务器</div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="mt-1">🔒</div>
                      <div>密钥仅用于调用第三方 API 服务，不会用于其他用途</div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="mt-1">🗑️</div>
                      <div>您可以随时清除浏览器缓存来删除这些密钥</div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="mt-1">💡</div>
                      <div>使用演示密钥可立即体验所有功能，无需注册账号</div>
                    </li>
                  </ul>
                </div>

                {/* 操作按钮区域 */}
                <div className="space-y-4">
                  {/* 演示密钥按钮 */}
                  <button
                    type="button"
                    onClick={handleUseDemoKeys}
                    disabled={isLoading}
                    className="w-full px-6 py-5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>快速配置：使用演示密钥</span>
                  </button>

                  {/* 主按钮组 */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          <span>保存中...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>保存并应用</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={isLoading}
                      className="px-6 py-5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      稍后配置
                    </button>
                  </div>
                </div>

                {/* API 服务说明 */}
                <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl border border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-800 mb-3">服务说明</h3>
                  <div className="space-y-2 text-xs text-purple-600">
                    <p><strong>魔搭 ModelScope</strong>：提供 DeepSeek-V3 模型用于智能对话</p>
                    <p><strong>魔珐星云</strong>：提供 3D 数字人渲染和语音合成服务</p>
                    <p>配置完成后，您可以立即开始使用智能辅导功能</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ApiKeyModal
