import React, { useState, useEffect } from 'react'

interface UploadedDocument {
  id: string
  filename: string
  uploadTime: number
  category: string
  difficulty: string
}

interface Category {
  value: string
  label: string
  icon: string
}

const SUBJECT_CATEGORIES: Category[] = [
  { value: 'math', label: '数学', icon: '📐' },
  { value: 'physics', label: '物理', icon: '⚛️' },
  { value: 'chemistry', label: '化学', icon: '🧪' },
]

const DIFFICULTY_LEVELS = [
  { value: '基础', label: '基础' },
  { value: '进阶', label: '进阶' },
  { value: '精通', label: '精通' }
]

interface AdminPanelProps {
  onClose?: () => void
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'documents'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState('math')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('基础')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 加载已上传文档列表
  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/knowledge/documents/list')
      const data = await response.json()
      if (data.success) {
        setDocuments(data.data)
      }
    } catch (error) {
      console.error('Load documents error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 弹窗打开时加载文档列表，确保资源库数量显示正确
    loadDocuments()
  }, [])

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  // 上传文档
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult({ success: false, message: '请选择文件' })
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('document', selectedFile)
      formData.append('category', category)
      if (topic) {
        formData.append('topic', topic)
      }
      formData.append('difficulty', difficulty)

      const response = await fetch('/api/knowledge/upload-document', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult({ success: true, message: result.message || '上传成功！' })
        setSelectedFile(null)
        setTopic('')
        // 重置文件输入
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        // 上传成功后重新加载文档列表，确保资源库数量正确
        loadDocuments()
      } else {
        setUploadResult({ success: false, message: result.error?.message || '上传失败' })
      }
    } catch (error: any) {
      setUploadResult({ success: false, message: error.message || '网络错误' })
    } finally {
      setIsUploading(false)
    }
  }

  // 删除文档
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return

    try {
      const response = await fetch(`/api/knowledge/documents/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setDocuments(documents.filter(doc => doc.id !== id))
      } else {
        alert(result.error?.message || '删除失败')
      }
    } catch (error: any) {
      alert(error.message || '网络错误')
    }
  }

  // 获取学科标签
  const getCategoryLabel = (categoryValue: string) => {
    const cat = SUBJECT_CATEGORIES.find(c => c.value === categoryValue)
    return cat ? `${cat.icon} ${cat.label}` : categoryValue
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-purple-200">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-12 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <span className="text-2xl">🧠</span>
                <span>智能学习资源管理</span>
              </h2>
              <p className="text-sm text-pink-100 mt-1">高效管理教学资源，助力智能辅导系统</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 rounded-full hover:bg-white hover:bg-opacity-20 transition-all transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="bg-purple-50/80 border-b border-purple-200">
          <div className="flex px-12">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-8 py-4 font-semibold transition-all relative ${
                activeTab === 'upload'
                  ? 'text-purple-800'
                  : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>📥</span>
                <span>资源上传</span>
              </div>
              {activeTab === 'upload' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-8 py-4 font-semibold transition-all relative ${
                activeTab === 'documents'
                  ? 'text-purple-800'
                  : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>📋</span>
                <span>资源库 ({documents.length})</span>
              </div>
              {activeTab === 'documents' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          {activeTab === 'upload' ? (
            <div className="space-y-8">
              {/* 上传卡片 */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-purple-800 mb-2">上传教学资源</h3>
                  <p className="text-sm text-purple-600">选择文件并设置相关信息，构建智能知识库</p>
                </div>
                
                <div className="space-y-6">
                  {/* 文件选择 */}
                  <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* 上传按钮部分 */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-purple-100 rounded-lg">
                        <label className="block text-sm font-semibold text-purple-700 mb-4 text-center">
                          <span className="inline-block p-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg mb-3">
                            📄
                          </span>
                          <br />
                          点击选择文件
                          <span className="text-purple-400 block mt-1">(支持 TXT、MD、PDF)</span>
                        </label>
                        <input
                          id="file-input"
                          type="file"
                          accept=".txt,.md,.pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-input')?.click()}
                          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02]"
                        >
                          浏览文件
                        </button>
                      </div>
                      
                      {/* 文件预览部分 */}
                      <div className="md:col-span-2">
                        {selectedFile ? (
                          <div className="h-full p-4 bg-white rounded-lg border border-purple-100 flex items-center space-x-4">
                            <div className="text-3xl">📄</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-purple-800 text-lg">{selectedFile.name}</h4>
                              <div className="flex flex-wrap gap-3 mt-2">
                                <div className="bg-purple-50 px-3 py-1 rounded-full text-xs text-purple-700">
                                  {(selectedFile.size / 1024).toFixed(1)} KB
                                </div>
                                <div className="bg-purple-50 px-3 py-1 rounded-full text-xs text-purple-700">
                                  {selectedFile.type || '文件'}
                                </div>
                                <div className="bg-purple-50 px-3 py-1 rounded-full text-xs text-purple-700">
                                  已选择
                                </div>
                              </div>
                              <p className="text-sm text-purple-600 mt-3">
                                文件将被上传到知识库，用于智能辅导系统的内容解析和教学。
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full p-8 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl mb-3">📁</div>
                              <p className="text-sm text-purple-600">
                                选择文件后，文件信息将显示在此处
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 资源信息设置 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 学科分类 */}
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-3">
                        <span className="inline-block p-2 bg-purple-100 text-purple-700 rounded-lg mr-2">
                          🎓
                        </span>
                        学科分类
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {SUBJECT_CATEGORIES.map((cat, index) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`p-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                              category === cat.value
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                : 'bg-purple-50 border border-purple-200 hover:border-purple-300 text-purple-700'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 难度级别 */}
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-3">
                        <span className="inline-block p-2 bg-purple-100 text-purple-700 rounded-lg mr-2">
                          ⭐
                        </span>
                        难度级别
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {DIFFICULTY_LEVELS.map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setDifficulty(level.value)}
                            className={`p-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                              difficulty === level.value
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                : 'bg-purple-50 border border-purple-200 hover:border-purple-300 text-purple-700'
                            }`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 主题 */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-3">
                      <span className="inline-block p-2 bg-purple-100 text-purple-700 rounded-lg mr-2">
                        🏷️
                      </span>
                      主题标签
                      <span className="text-purple-400 ml-2">(可选)</span>
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="例如：平面几何、力学、有机化学..."
                      className="w-full px-5 py-3 bg-purple-50 border border-purple-200 rounded-xl focus:ring-3 focus:ring-pink-300 focus:border-transparent transition text-purple-800"
                    />
                  </div>

                  {/* 上传结果消息 */}
                  {uploadResult && (
                    <div
                      className={`p-4 rounded-xl border transition-all transform hover:scale-[1.01] ${
                        uploadResult.success
                          ? 'bg-green-50 text-green-800 border-green-200'
                          : 'bg-pink-50 text-pink-800 border-pink-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-lg">{uploadResult.success ? '🎉' : '⚠️'}</span>
                        <span className="font-medium">{uploadResult.message}</span>
                      </div>
                    </div>
                  )}

                  {/* 上传按钮 */}
                  <div className="pt-3">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>正在上传...</span>
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>上传并添加到知识库</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 上传指南 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100">
                  <div className="text-xl mb-2">📄</div>
                  <h4 className="text-sm font-semibold text-purple-800 mb-2">支持格式</h4>
                  <p className="text-xs text-purple-600">TXT、MD、PDF 格式文件，便于系统解析和展示</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100">
                  <div className="text-xl mb-2">📝</div>
                  <h4 className="text-sm font-semibold text-purple-800 mb-2">内容规范</h4>
                  <p className="text-xs text-purple-600">第一行为标题，后续为内容，可包含公式、证明等</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100">
                  <div className="text-xl mb-2">🎯</div>
                  <h4 className="text-sm font-semibold text-purple-800 mb-2">最佳实践</h4>
                  <p className="text-xs text-purple-600">选择合适的学科分类和难度级别，填写主题标签</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 文档列表标题 */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-purple-800 mb-2">知识库资源</h3>
                <p className="text-sm text-purple-600">管理已上传的教学资料，优化知识库结构</p>
              </div>

              {/* 文档列表 */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
                {isLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-purple-700 font-medium mb-2">知识库为空</p>
                    <p className="text-sm text-purple-500">上传教学资源后，它们会显示在这里</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:opacity-90 transition-all"
                    >
                      立即上传
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-start">
                          <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mr-3">
                            📄
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-purple-800">{doc.filename}</h4>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-all transform hover:scale-110"
                                title="删除文档"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="mt-2 text-sm text-purple-600 flex flex-wrap gap-2">
                              <span className="flex items-center">
                                <span className="mr-1">🎓</span>
                                {getCategoryLabel(doc.category)}
                              </span>
                              <span className="flex items-center">
                                <span className="mr-1">📅</span>
                                {new Date(doc.uploadTime).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <span className="mr-1">⭐</span>
                                {doc.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
