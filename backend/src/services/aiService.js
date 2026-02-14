const axios = require('axios');

/**
 * AI Service for integrating with LLM providers
 * Supports: Zhipu AI (智谱AI), and can be extended for other providers
 */

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'zhipu';
    this.apiKey = process.env.AI_API_KEY || '';
    this.apiURL = process.env.AI_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.model = process.env.AI_MODEL || 'glm-4-flash';
    this.isConfiguredValue = null; // Cache the configured status
  }

  /**
   * Check if AI service is configured
   */
  isConfigured() {
    // Return cached value if available
    if (this.isConfiguredValue !== null) {
      return this.isConfiguredValue;
    }

    // Check if API key is set and not a placeholder/demo key
    if (!this.apiKey) {
      this.isConfiguredValue = false;
      return false;
    }

    // Check if API key is in the correct format (32 character hex string)
    if (!this.validateApiKey()) {
      this.isConfiguredValue = false;
      return false;
    }

    const placeholderKeys = ['sk-your-openai-api-key', 'demo-key-fallback-enabled', 'your-api-key-here', 'your-zhipu-api-key-here'];
    const isValid = !placeholderKeys.some(key => this.apiKey.includes(key));
    this.isConfiguredValue = isValid;
    return isValid;
  }

  /**
   * Validate API key format for Zhipu AI
   */
  validateApiKey() {
    if (!this.apiKey) return false;

    // Zhipu AI API key format: should contain a 32-character hex string
    // Example: 1529fb55b2d14c9095c3c012c06cf97c.EABsVNBVK1RJ1Ayh
    const hexPattern = /[0-9a-f]{32}/i;
    return hexPattern.test(this.apiKey);
  }

  /**
   * Generate a simple response without AI API (fallback)
   */
  generateFallbackResponse(message, context) {
    const lowerMessage = message.toLowerCase();

    // Simple pattern matching for common queries
    if (lowerMessage.includes('活动') || lowerMessage.includes('activity')) {
      return '您可以前往"校园通-活动公告"板块查看最新活动。我为您推荐一些可能感兴趣的活动，或者您想要搜索特定类型的活动吗？';
    }

    if (lowerMessage.includes('预约') || lowerMessage.includes('reserve') || lowerMessage.includes('venue')) {
      return '场馆预约功能在"校园通-场馆预约"中。请告诉我您想预约什么类型的场馆以及时间，我可以帮您查询可用时段。';
    }

    if (lowerMessage.includes('二手') || lowerMessage.includes('交易') || lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
      return '"生活汇-二手交易"板块有很多优质商品。您可以发布想要出售的物品，或者浏览其他同学发布的商品。有什么特别想找的物品吗？';
    }

    if (lowerMessage.includes('兼职') || lowerMessage.includes('part-time') || lowerMessage.includes('job')) {
      return '"生活汇-兼职平台"提供家教和技能变现两种服务。您可以发布您的技能服务，或者浏览现有的兼职需求。';
    }

    if (lowerMessage.includes('社群') || lowerMessage.includes('group') || lowerMessage.includes('community')) {
      return '"校际圈-主题社群"有很多有趣的社群，比如学习小组、运动联盟等。根据您的兴趣标签，我为您推荐一些可能感兴趣的社群。';
    }

    if (lowerMessage.includes('项目') || lowerMessage.includes('协作') || lowerMessage.includes('project')) {
      return '"校际圈-跨校项目协作"可以帮助您找到志同道合的伙伴。您可以发起自己的项目，或者申请加入其他感兴趣的项目。';
    }

    if (lowerMessage.includes('资料') || lowerMessage.includes('material') || lowerMessage.includes('resource')) {
      return '"校园通-资料分享"有丰富的学习资源，包括竞赛指南、PPT模板、工具教程等。您也可以上传分享优质资料。';
    }

    if (lowerMessage.includes('你好') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return '你好呀！我是小联，申城学联的AI助手。有什么我可以帮您的吗？您可以问我关于活动、交易、社群、项目等问题。';
    }

    if (lowerMessage.includes('谢谢') || lowerMessage.includes('thank')) {
      return '不客气！很高兴能帮到您。还有其他问题吗？';
    }

    // Default response
    return '感谢您的提问！作为申城学联的AI助手，我可以帮您查询活动信息、场馆预约、二手交易、社群、项目协作等内容。请告诉我您具体想了解什么？';
  }

  /**
   * Call Zhipu AI API
   */
  async callZhipuAI(messages, options = {}) {
    try {
      const systemPrompt = options.systemPrompt || `# 角色定义
你叫小联，是申城学联（Shencheng Student Union）的AI智能助手。你是一个友好、专业、贴心的校园助手，致力于为上海地区高校学生提供便捷的信息查询和智能咨询服务。

# 平台功能手册

## 一、校园通（Campus Services）

### 1. 活动公告
- 查看各类校园活动：体育赛事、文化活动、学术讲座、志愿服务等
- 活动报名：在线报名参与感兴趣的活动
- 活动筛选：按类型、状态、学校筛选
- 相关操作：查看活动详情、报名、取消报名

### 2. 场馆预约
- 预约场地：体育场馆（篮球场、足球场、羽毛球馆等）、教室、实验室
- 查询可用时段：实时查看场馆空闲时间
- 我的预约：查看预约记录、管理预约
- 相关操作：创建预约、取消预约、查看预约历史

### 3. 资料分享
- 学习资源下载：竞赛指南（挑战杯、互联网+等）、PPT模板、工具教程
- 资料分类：竞赛资料、学习资料、实用工具
- 上传分享：用户可以上传优质资料供其他同学下载
- 相关操作：搜索资料、下载资料、上传资料

### 4. 校园贴士
- Wiki式知识库：学习贴士、设施信息、生活指南
- 可编辑：用户可以共同编辑完善贴士内容
- 分类浏览：按类别（学习、设施、生活等）查看

## 二、生活汇（Life Services）

### 1. 二手交易
- 商品分类：书籍教材、数码产品、生活用品、衣物鞋包
- 交易功能：发布商品、浏览商品、创建订单、确认收货
- 交易安全：平台担保交易，支持订单状态追踪

### 2. 外卖代取
- 发布/接单：需要代取或提供代取服务
- 小额服务：方便快捷的校园帮手服务

### 3. 文创交易
- 学生原创作品交易：设计、手工、艺术作品等
- 支持原创：为学生创意作品提供交易平台

### 4. 失物招领
- 丢失物品登记：发布丢失信息
- 捡到物品登记：发布拾到信息
- 匹配通知：系统自动匹配失主和拾主

### 5. 兼职平台
- 家教服务：发布/应聘家教需求
- 技能变现：设计、编程、写作等技能服务

## 三、校际圈（Inter-School Community）

### 1. 主题社群
- 发现社群：学习小组、运动联盟、兴趣社团等
- 创建社群：发起自己的兴趣社群
- 社群互动：发布帖子、评论交流
- 社群类型：公开社群（任何人可加入）、私密社群（需审核）

### 2. 跨校项目协作
- 项目发布：创新创业项目、调研项目、比赛项目等
- 申请加入：根据项目需求申请参与角色
- 团队协作：跨校组队，优势互补
- 项目角色：调研员、数据分析师、文案、技术开发等

## 四、其他功能

### 1. 匿名私聊
- 随机匹配：根据兴趣标签匹配聊天对象
- 匿名交流：保护隐私的交流方式
- 交换联系方式：双方同意后可交换微信/QQ等

### 2. 部门协作
- 校园部门协作：学工部、宣传部等部门任务协作
- 任务管理：任务分配、进度跟踪

# 交互准则

## 回复风格
- 语气：友好、亲切、热情，像学长学姐一样贴心
- 用词：简洁明了，避免专业术语，使用学生易懂的语言
- 长度：一般回复控制在150字以内，复杂问题可适当增加但不超过300字

## 回复策略
1. 首先理解用户问题的核心需求
2. 判断问题属于哪个功能模块
3. 给出具体的操作指引或功能说明
4. 必要时主动推荐相关功能或内容
5. 对于超出平台功能的问题，礼貌说明并尽量提供有用建议

## 特殊情况处理
- 不知道答案时：诚实告知，并建议用户联系相关部门或查看帮助文档
- 用户遇到问题：安抚情绪，提供可能的解决方案或建议联系客服
- 投诉建议：认真记录，感谢反馈，说明会转达给相关团队

## 示例对话

用户：怎么报名参加活动？
小联：您好呀！报名活动很简单～在"校园通-活动公告"里找到感兴趣的活动，点击进入详情页，就能看到"报名"按钮啦。报名成功后会收到通知，记得按时参加哦！🎉

用户：我想买二手书
小联：可以去"生活汇-二手交易"看看呀！里面有同学们发布的教材、书籍等。您可以筛选"书籍"分类，找到需要的后直接下单。平台担保交易，很安全哒～📚

用户：怎么找到考研小伙伴？
小联：您可以试试"校际圈-主题社群"，搜索"考研"相关的学习小组。或者用"匿名私聊"功能，设置"考研"标签，系统会帮您匹配有相同兴趣的小伙伴哦！💪

# 重要提醒
- AI回复仅供参考，具体信息请以平台为准
- 涉及金钱交易请谨慎，建议使用平台担保交易功能
- 保护个人隐私，不要随意透露敏感信息

请基于以上平台功能手册，为用户提供准确、友好、实用的帮助。`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await axios.post(
        this.apiURL,
        {
          model: this.model,
          messages: apiMessages,
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 2000,
          stream: options.stream || false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 30000,
          responseType: options.stream ? 'stream' : 'json'
        }
      );

      return response;
    } catch (error) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.error?.message || error.message;

      // Log 401/403 auth errors specifically - these mean invalid API key
      if (status === 401 || status === 403) {
        console.warn('AI API authentication failed (invalid API key). Using fallback responses.');
        throw new Error('AUTH_FAILED');
      }

      console.error('Zhipu AI API error:', error.response?.data || error.message);
      throw new Error(`AI API调用失败: ${errorMsg}`);
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(messages, options = {}) {
    try {
      const systemPrompt = options.systemPrompt || `# Role Definition
You are XiaoLian (小联), the AI intelligent assistant for Shencheng Student Union. You are a friendly, professional, and thoughtful campus assistant dedicated to providing convenient information queries and intelligent consulting services for university students in Shanghai.

# Platform Function Manual

## 1. Campus Services

### Activity Announcements
- View campus activities: sports events, cultural activities, academic lectures, volunteer services
- Activity registration: Sign up for activities of interest online
- Activity filtering: Filter by type, status, school
- Related actions: View activity details, register, cancel registration

### Venue Reservations
- Reserve venues: sports facilities (basketball courts, football fields, badminton halls), classrooms, laboratories
- Check availability: Real-time viewing of venue free time slots
- My reservations: View reservation records, manage reservations
- Related actions: Create reservation, cancel reservation, view reservation history

### Material Sharing
- Learning resource downloads: Competition guides (Challenge Cup, Internet+, etc.), PPT templates, tool tutorials
- Resource categories: Competition materials, study materials, practical tools
- Upload and share: Users can upload quality materials for other students to download
- Related actions: Search materials, download materials, upload materials

### Campus Tips
- Wiki-style knowledge base: Study tips, facility information, life guides
- Editable: Users can co-edit and improve tip content
- Browse by category: View by category (study, facilities, life, etc.)

## 2. Life Services

### Second-hand Trading
- Product categories: Books and textbooks, digital products, daily necessities, clothing and shoes
- Trading functions: Post products, browse products, create orders, confirm receipt
- Trading safety: Platform-guaranteed trading with order status tracking

### Food Delivery Pickup
- Post/Accept orders: Need pickup or provide pickup services
- Small services: Convenient campus helper services

### Creative Trading
- Student original works trading: Design, handmade, art works, etc.
- Support originality: Trading platform for student creative works

### Lost and Found
- Lost item registration: Post lost information
- Found item registration: Post found information
- Match notification: System automatically matches losers and finders

### Part-time Jobs
- Tutoring services: Post/apply for tutoring needs
- Skill monetization: Design, programming, writing and other skill services

## 3. Inter-School Community

### Topic Groups
- Discover groups: Study groups, sports alliances, interest clubs, etc.
- Create groups: Start your own interest community
- Group interaction: Post posts, comment and communicate
- Group types: Public groups (anyone can join), private groups (need approval)

### Cross-school Project Collaboration
- Project posting: Innovation and entrepreneurship projects, research projects, competition projects, etc.
- Apply to join: Apply for roles based on project needs
- Team collaboration: Cross-school teaming, complementary advantages
- Project roles: Researcher, data analyst, copywriter, technical development, etc.

## 4. Other Features

### Anonymous Chat
- Random matching: Match chat partners based on interest tags
- Anonymous communication: Privacy-protecting communication method
- Exchange contact information: Exchange WeChat/QQ after mutual consent

### Department Collaboration
- Campus department collaboration: Student affairs department, publicity department and other department task collaboration
- Task management: Task assignment, progress tracking

# Interaction Guidelines

## Response Style
- Tone: Friendly, kind, enthusiastic, like a helpful senior student
- Language: Concise and clear, avoid jargon, use student-friendly language
- Length: Generally within 150 words, up to 300 words for complex questions

## Response Strategy
1. First understand the core needs of the user's question
2. Determine which functional module the question belongs to
3. Provide specific operation guidance or function description
4. Proactively recommend related functions or content when necessary
5. For questions beyond platform capabilities, politely explain and try to provide useful suggestions

## Special Situations
- When you don't know the answer: Honestly inform and suggest user contact relevant departments or check help documentation
- When users encounter problems: Comfort emotions, provide possible solutions or suggest contacting customer service
- Complaints and suggestions: Take seriously, thank for feedback, explain will be conveyed to relevant team

# Important Notes
- AI replies are for reference only, please refer to the platform for specific information
- Be cautious with money transactions, recommend using platform-guaranteed trading functions
- Protect personal privacy, do not reveal sensitive information

Please provide accurate, friendly, and practical help to users based on the above platform function manual.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await axios.post(
        this.apiURL,
        {
          model: this.model,
          messages: apiMessages,
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          max_tokens: options.max_tokens || 2000,
          stream: options.stream || false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 30000,
          responseType: options.stream ? 'stream' : 'json'
        }
      );

      return response;
    } catch (error) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.error?.message || error.message;

      // Log 401/403 auth errors specifically - these mean invalid API key
      if (status === 401 || status === 403) {
        console.warn('AI API authentication failed (invalid API key). Using fallback responses.');
        throw new Error('AUTH_FAILED');
      }

      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error(`AI API调用失败: ${errorMsg}`);
    }
  }

  /**
   * Generate AI response (non-streaming)
   */
  async generateResponse(messages, options = {}) {
    // If not configured, use fallback immediately
    if (!this.isConfigured()) {
      console.log('AI not configured with valid API key, using fallback responses');
      const lastMessage = messages[messages.length - 1];
      return {
        content: this.generateFallbackResponse(lastMessage.content, options.context),
        usage: null,
        model: 'fallback'
      };
    }

    try {
      let response;
      if (this.provider === 'openai') {
        response = await this.callOpenAI(messages, options);
      } else {
        response = await this.callZhipuAI(messages, options);
      }

      return {
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };
    } catch (error) {
      // Handle auth errors specifically
      if (error.message === 'AUTH_FAILED') {
        console.log('AI authentication failed, using fallback responses');
        const lastMessage = messages[messages.length - 1];
        return {
          content: this.generateFallbackResponse(lastMessage.content, options.context),
          usage: null,
          model: 'fallback'
        };
      }

      console.error('AI generation error, falling back:', error.message);
      const lastMessage = messages[messages.length - 1];
      return {
        content: this.generateFallbackResponse(lastMessage.content, options.context),
        usage: null,
        model: 'fallback'
      };
    }
  }

  /**
   * Generate streaming AI response
   * Returns a readable stream that emits data chunks
   */
  async generateStreamingResponse(messages, options = {}) {
    const { Readable, Transform } = require('stream');

    // If not configured, return a mock stream with fallback
    if (!this.isConfigured()) {
      const lastMessage = messages[messages.length - 1];
      const fallbackText = this.generateFallbackResponse(lastMessage.content, options.context);

      // Split text into chunks (every 5 characters)
      const chunks = [];
      for (let i = 0; i < fallbackText.length; i += 5) {
        chunks.push(fallbackText.slice(i, i + 5));
      }

      let index = 0;

      const stream = new Readable({
        read() {
          if (index >= chunks.length) {
            this.push('data: [DONE]\n\n');
            this.push(null);
            return;
          }

          const chunk = chunks[index++];
          this.push(`data: ${JSON.stringify({ content: chunk, done: index >= chunks.length })}\n\n`);

          // Schedule next chunk
          setTimeout(() => this._read(), 20);
        }
      });

      return stream;
    }

    try {
      let response;
      if (this.provider === 'openai') {
        response = await this.callOpenAI(messages, { ...options, stream: true });
      } else {
        response = await this.callZhipuAI(messages, { ...options, stream: true });
      }

      return response.data.pipe(new Transform({
        transform(chunk, encoding, callback) {
          // Parse SSE format
          const lines = chunk.toString().split('\n');

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();

              if (data === '[DONE]') {
                this.push('data: [DONE]\n\n');
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                let content = '';

                if (this.provider === 'openai') {
                  // OpenAI format
                  content = parsed.choices?.[0]?.delta?.content;
                } else {
                  // Zhipu AI format
                  content = parsed.choices?.[0]?.delta?.content;
                }

                if (content) {
                  this.push(`data: ${JSON.stringify({ content, done: false })}\n\n`);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
          callback();
        }
      }));
    } catch (error) {
      console.error('AI streaming error, falling back:', error.message);

      const lastMessage = messages[messages.length - 1];
      const fallbackText = this.generateFallbackResponse(lastMessage.content, options.context);

      const chunks = [];
      for (let i = 0; i < fallbackText.length; i += 5) {
        chunks.push(fallbackText.slice(i, i + 5));
      }

      let index = 0;

      const stream = new Readable({
        read() {
          if (index >= chunks.length) {
            this.push('data: [DONE]\n\n');
            this.push(null);
            return;
          }

          const chunk = chunks[index++];
          this.push(`data: ${JSON.stringify({ content: chunk, done: index >= chunks.length })}\n\n`);

          setTimeout(() => this._read(), 20);
        }
      });

      return stream;
    }
  }

  /**
   * Create message format for API
   */
  createMessage(role, content) {
    return { role, content };
  }
}

module.exports = new AIService();
