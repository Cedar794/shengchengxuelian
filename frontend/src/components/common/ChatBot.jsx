import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '嗨！我是小联，你的智能校园助手~ 有什么可以帮你的吗？',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response (will be replaced with actual AI API)
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: getBotResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (input) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('活动') || lowerInput.includes('公告')) {
      return '你可以前往"校园通-活动公告"查看最新活动信息哦！有什么特别感兴趣的活动类型吗？';
    }
    if (lowerInput.includes('二手') || lowerInput.includes('交易')) {
      return '想买或卖东西？来"生活汇-二手交易"看看吧，有很多同学在交易呢！';
    }
    if (lowerInput.includes('兼职') || lowerInput.includes('工作')) {
      return '"生活汇-兼职平台"有很多兼职信息，包括家教和技能变现，要不要去看看？';
    }
    if (lowerInput.includes('社群') || lowerInput.includes('交友')) {
      return '"校际圈-主题社群"有各种兴趣小组，可以认识其他学校的朋友哦！';
    }
    if (lowerInput.includes('你好') || lowerInput.includes('嗨')) {
      return '你好呀！我是小联，有什么问题尽管问我，我会尽力帮助你的~';
    }

    return '我正在学习中，暂时不太理解这个问题。你可以试试问我关于活动、二手交易、兼职或社群的问题哦！';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
          title="打开小联"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 left-6 bg-white rounded-xl shadow-xl z-50 transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[520px]'
          }`}
        >
          {/* Header */}
          <div className="h-12 bg-gradient-to-r from-primary to-primary-light rounded-t-xl flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <span className="text-white font-medium">小联</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMinimized ? '展开' : '最小化'}
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="关闭"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white text-gray-700 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="h-[60px] border-t border-gray-200 p-3 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="和小联聊聊吧~"
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
