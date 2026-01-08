import axios from 'axios';

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

/**
 * 对话请求
 */
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  currentData?: any;
  apiKey: string;
}

/**
 * 对话服务
 */
export class ChatService {
  private baseURL = 'https://api-inference.modelscope.cn/v1';
  private model = 'deepseek-ai/DeepSeek-V3.2';

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(currentData?: any): string {
    let prompt = `你是一个专业的学习辅导助手，名为"小学习"。

你的职责：
1. 提供专业、科学的学习方法和建议
2. 解答用户关于学习、考试、复习等方面的问题
3. 帮助用户制定合理的学习计划和目标
4. 提供提高学习效率和成绩的指导
5. 保持专业、友好、鼓励的态度

辅导风格：
- 专业但不晦涩，善于用通俗易懂的语言解释学习方法
- 鼓励为主，体现对用户学习进步的关心
- 提供具体、可操作的学习建议
- 回答简洁明了，重点突出
- 如遇专业学科问题，提供学习思路和方法建议`;

    return prompt;
  }

  /**
   * 流式对话
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    const { message, conversationHistory = [], currentData, apiKey } = request;

    // 构建消息列表
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(currentData),
        timestamp: Date.now()
      }
    ];

    // 添加历史消息（最近10条）
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          timeout: 30000
        }
      );

      const stream = response.data;

      for await (const chunk of stream) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error: any) {
      console.error('[ChatService] Stream error:', error);

      // AI失败时返回降级响应
      const fallbackResponse = this.getFallbackResponse(message, currentData);
      yield fallbackResponse;
    }
  }

  /**
   * 降级响应（AI调用失败时）
   */
  private getFallbackResponse(message: string, currentData?: any): string {
    const lowerMessage = message.toLowerCase();

    // 关于学习效率
    if (lowerMessage.includes('效率') || lowerMessage.includes('高效') || lowerMessage.includes('速度')) {
      return '学习效率建议：制定明确的学习目标，使用番茄工作法（25分钟学习+5分钟休息），创造安静的学习环境，避免 multitasking，定期复习巩固知识，保持适当的运动和休息。';
    }

    // 关于记忆方法
    if (lowerMessage.includes('记忆') || lowerMessage.includes('背诵') || lowerMessage.includes('记住')) {
      return '记忆方法建议：使用间隔重复法，将知识点与已有知识建立联系，通过讲解给他人来加深理解，使用视觉化记忆技巧，保持充足的睡眠和健康的饮食，定期复习巩固。';
    }

    // 关于学习计划
    if (lowerMessage.includes('计划') || lowerMessage.includes('安排') || lowerMessage.includes('时间')) {
      return '学习计划建议：根据学科难度和重要性分配时间，设定短期和长期目标，使用日历或任务管理工具，保持计划的灵活性，定期评估和调整计划，确保有足够的休息时间。';
    }

    // 关于考试复习
    if (lowerMessage.includes('考试') || lowerMessage.includes('复习') || lowerMessage.includes('备考')) {
      return '考试复习建议：提前规划复习时间，按照知识点重要性分配复习时间，使用主动学习方法（如做题目、讲解），模拟考试环境进行练习，保持良好的作息和饮食习惯，考前适当放松。';
    }

    // 关于学习困难
    if (lowerMessage.includes('困难') || lowerMessage.includes('问题') || lowerMessage.includes('不会')) {
      return '学习困难建议：将复杂问题分解为小步骤，寻求同学或老师的帮助，利用在线学习资源，尝试不同的学习方法，保持耐心和毅力，定期回顾和总结学习经验。';
    }

    // 关于学习动力
    if (lowerMessage.includes('动力') || lowerMessage.includes('兴趣') || lowerMessage.includes('坚持')) {
      return '学习动力建议：设定明确的学习目标，将大目标分解为小目标，庆祝每一个小成就，找到学习的内在动机，与志同道合的同学一起学习，定期休息和放松，保持积极的心态。';
    }

    // 默认响应
    return '抱歉，我暂时无法回答这个问题。请确保已配置有效的魔搭API密钥，或尝试询问其他学习相关问题。';
  }
}

export default new ChatService();
