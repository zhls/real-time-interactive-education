import React, { useState, useEffect, useRef } from 'react'

interface QuickActionsPopoverProps {
  buttonRef: React.RefObject<HTMLButtonElement>
  onSelect: (question: string) => void
}

interface QuickQuestion {
  q: string
  icon: string
  category: string
}

export const QuickActionsPopover: React.FC<QuickActionsPopoverProps> = ({
  buttonRef,
  onSelect
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)

  // 快捷提问列表，按分类组织
  const quickQuestions: QuickQuestion[] = [
    { q: '什么是勾股定理？请用简单的话解释一下', icon: '📐', category: '数学' },
    { q: '如何理解函数的概念？', icon: '📈', category: '数学' },
    { q: '一元二次方程的求根公式是什么？', icon: '🔢', category: '数学' },
    { q: '牛顿第一定律是什么？能举个例子吗？', icon: '🍎', category: '物理' },
    { q: '什么是能量守恒定律？', icon: '⚡', category: '物理' },
    { q: '什么是化学反应？请举个例子', icon: '🧪', category: '化学' },
    { q: '请给我出一道练习题', icon: '✏️', category: '练习' },
    { q: '帮我梳理一下今天的学习重点', icon: '📝', category: '复习' },
    { q: '这个知识点的常见误区有哪些？', icon: '⚠️', category: '提示' },
    { q: '给我讲一个相关的实际应用例子', icon: '💡', category: '应用' },
    { q: '用更简单的方式解释一遍', icon: '🎯', category: '理解' },
  ]

  // 计算弹出框位置
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const parentRect = buttonRef.current.closest('.bg-white')?.getBoundingClientRect()

      // 相对于父容器定位，上边紧挨着按钮下面，右边与按钮右边对齐
      if (parentRect) {
        // 弹出框宽度固定为20rem (w-80)
        const popoverWidth = 320 // 80 * 4px = 320px
        setPosition({
          top: rect.bottom - parentRect.top + 2, // 上边紧挨着按钮下面，只有2px的间距
          left: rect.right - parentRect.left - popoverWidth // 右边与按钮右边对齐
        })
      }
    }
  }, [buttonRef])

  // 按分类分组
  const groupedQuestions = quickQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push(question)
    return acc
  }, {} as Record<string, QuickQuestion[]>)

  // 获取分类列表
  const categories = Object.keys(groupedQuestions)

  return (
    <div
      ref={popoverRef}
      className="quick-actions-popover absolute z-50 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: '450px'
      }}
    >
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-4 border-b border-purple-200">
        <h3 className="text-base font-bold text-white flex items-center">
          <span className="mr-2 text-xl">⚡</span>
          快捷提问
        </h3>
        <p className="text-xs text-purple-100 mt-1">选择一个问题开始学习之旅</p>
      </div>

      {/* 问题列表 */}
      <div className="overflow-y-auto max-h-96">
        {categories.map((category) => (
          <div key={category} className="border-b border-purple-50">
            {/* 分类标题 */}
            <div className="px-5 py-3 bg-purple-50/80">
              <h4 className="text-sm font-semibold text-purple-800 capitalize">{category}</h4>
            </div>
            
            {/* 分类下的问题 */}
            <div className="px-3">
              {groupedQuestions[category].map((item, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => onSelect(item.q)}
                  className="w-full text-left px-4 py-3 my-1.5 rounded-xl hover:bg-gradient-to-r from-purple-50 to-pink-50 transition-all transform hover:scale-[1.01] group"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl flex-shrink-0 mt-0.5 text-purple-600">{item.icon}</span>
                    <span className="text-sm text-gray-700 group-hover:text-purple-700 leading-relaxed flex-1">
                      {item.q}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
        <div className="flex items-center justify-center text-xs text-purple-600 font-medium">
          <span className="mr-2">💡</span>
          点击任意问题开始对话
        </div>
      </div>
    </div>
  )
}

export default QuickActionsPopover
