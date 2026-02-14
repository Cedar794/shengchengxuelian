import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiChatAPI } from '../../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const ChatWindow = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initializationRef = useRef(false);
  const historyLoadedRef = useRef(false);

  // Load chat history when user changes (login/logout)
  // This should only run once per user session
  useEffect(() => {
    if (!user || initializationRef.current) {
      return;
    }

    const loadChatHistory = async () => {
      try {
        // Don't pass sessionId on first load - let backend get/create default session
        const data = await aiChatAPI.getHistory(null);

        if (data.messages && data.messages.length > 0) {
          // Use a Set to track unique message IDs and prevent duplicates
          const seenIds = new Set();
          const transformedMessages = data.messages
            .filter(msg => {
              // Skip duplicate messages by ID
              if (msg.id && seenIds.has(msg.id)) {
                return false;
              }
              if (msg.id) seenIds.add(msg.id);
              return true;
            })
            .map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              created_at: msg.created_at,
            }));
          setMessages(transformedMessages);
        }
        historyLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // Keep the welcome message on error
        historyLoadedRef.current = true;
      }
    };

    initializationRef.current = true;
    loadChatHistory();

    // Reset initialization ref when user changes (logout/login)
    return () => {
      if (!user) {
        initializationRef.current = false;
        historyLoadedRef.current = false;
        setMessages([]);
        setSessionId(null);
      }
    };
  }, [user?.id]); // Only re-run if user ID changes

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Focus input when opening the chat
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Send message to AI
      const data = await aiChatAPI.sendMessage(currentInput, sessionId);

      // Update session ID
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Add AI response to chat with unique ID
      const aiMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: data.response || data.message || '抱歉，我没有收到有效回复。',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试~',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = async () => {
    try {
      await aiChatAPI.clearHistory(sessionId);
      // Clear messages to show the default welcome message
      setMessages([]);
      setSessionId(null);
      // Reset history loaded ref so we won't try to reload old messages
      historyLoadedRef.current = false;
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[30px] left-[30px] w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50 group"
          title="打开小联"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          {/* Tooltip */}
          <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            智能助手
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bg-white rounded-xl shadow-2xl z-50 transition-all duration-300 ease-in-out border border-blue-100 ${
            isMinimized
              ? 'bottom-[30px] left-[30px] w-[320px] h-16'
              : 'bottom-[30px] left-[30px] w-[400px] h-[560px] max-h-[calc(100vh-120px)]'
          }`}
        >
          {/* Header */}
          <div className="h-14 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-xl flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg" role="img" aria-label="robot">🤖</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-base">小联</span>
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  在线
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title={isMinimized ? '展开' : '最小化'}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="关闭"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="h-[calc(100%-140px)] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50/50 to-white">
                {/* Show welcome message if no messages yet */}
                {messages.length === 0 && (
                  <div className="flex justify-start">
                    <div className="flex items-end max-w-[85%] gap-2">
                      <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs" role="img">🤖</span>
                      </div>
                      <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white text-gray-700 border border-blue-100 shadow-sm">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          }}
                        >
                          嗨！我是**小联**，你的智能校园助手~ 有什么可以帮你的吗？
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id || msg.created_at || Math.random()}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end max-w-[85%] gap-2">
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs" role="img">🤖</span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-400 text-white rounded-br-md'
                            : 'bg-white text-gray-700 rounded-bl-md border border-blue-100'
                        }`}
                      >
                        <div className="text-sm leading-relaxed break-words markdown-content">
                          {msg.role === 'user' ? (
                            <span className="whitespace-pre-wrap">{msg.content}</span>
                          ) : (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                code: ({ inline, className, children, ...props }) => {
                                  if (inline) {
                                    return (
                                      <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <code className={`block bg-gray-800 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto ${className || ''}`} {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-2">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }) => (
                                  <a href={href} className="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                ),
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-2">
                                    <table className="min-w-full border border-gray-300">{children}</table>
                                  </div>
                                ),
                                thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                tr: ({ children }) => <tr className="border-b">{children}</tr>,
                                th: ({ children }) => <th className="px-3 py-2 text-left border">{children}</th>,
                                td: ({ children }) => <td className="px-3 py-2 border">{children}</td>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>
                        <span className={`text-xs mt-1 block ${
                          msg.role === 'user' ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">👤</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-end max-w-[85%] gap-2">
                      <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs" role="img">🤖</span>
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-blue-100 shadow-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 rounded-b-xl">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="和小联聊聊吧~"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                    title="发送"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <button
                    onClick={handleClearHistory}
                    disabled={messages.length <= 1}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="清空对话"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-400">AI回复仅供参考，具体信息请以平台为准</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWindow;
