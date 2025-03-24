'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaPaperPlane, FaRobot, FaUser, FaMicrophone, FaStop, FaTrash, FaExchangeAlt, FaCode, FaTerminal, FaBrain } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import 'react-toastify/dist/ReactToastify.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  pending?: boolean;
  timestamp?: Date;
  model?: string;
}

export default function AIChatAssistant() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [currentModel, setCurrentModel] = useState<string>('codegemma:7b');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [messageAnimation, setMessageAnimation] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  const availableModels = [
    { id: 'codegemma:7b', name: 'CodeGemma 7B' },
    { id: 'llama3:latest', name: 'llama3:latest' },
    { id: 'mistral:7b', name: 'Mistral 7B' },
    { id: 'gemma:latest', name: 'gemma:latest' }
  ];

  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedModel = localStorage.getItem('currentModel');
    
    if (savedModel) {
      setCurrentModel(savedModel);
    }
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }
    
    // Set welcome message if this is first visit
    if (isFirstLoad) {
      if (!savedMessages || JSON.parse(savedMessages).length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          content: "Welcome to NEXUS HIVE AI HUB! I'm your AI assistant. How can I help you today?",
          role: 'assistant',
          timestamp: new Date(),
          model: currentModel
        };
        setMessages([welcomeMessage]);
      }
      setIsFirstLoad(false);
    }

    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      
      speechRecognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setMessage(transcript);
      };
      
      speechRecognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast.error('Speech recognition error: ' + event.error);
        setIsRecording(false);
      };
      
      speechRecognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      // Cleanup speech recognition on component unmount
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      clearTimeout(timer);
    };
  }, [isFirstLoad]); // Removed currentModel from dependency array to prevent infinite loop

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && !isFirstLoad) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages, isFirstLoad]);

  // Save current model to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentModel', currentModel);
  }, [currentModel]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Message animation effect
  useEffect(() => {
    if (messageAnimation) {
      const timer = setTimeout(() => {
        setMessageAnimation(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messageAnimation]);

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) {
      return;
    }

    const messageId = Date.now().toString();
    const currentTime = new Date();

    // Add user message
    const newUserMessage: Message = { 
      id: messageId, 
      content: message, 
      role: 'user',
      timestamp: currentTime,
      model: currentModel
    };
    setMessages(prev => [...prev, newUserMessage]);
    setMessageAnimation(true);

    // Add a pending assistant message
    const pendingAssistantMessage: Message = { 
      id: `${messageId}-response`, 
      content: '', 
      role: 'assistant', 
      pending: true,
      timestamp: currentTime,
      model: currentModel
    };
    setMessages(prev => [...prev, pendingAssistantMessage]);

    setMessage('');
    setLoading(true);
    setIsTyping(true);

    try {
      const backendURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(`${backendURL}/chat`, { 
        message: message, 
        model: currentModel 
      });

      if (!response.data.response) {
        throw new Error("Invalid response from AI");
      }

      // Start the typing animation
      setTypingMessage('');
      animateTyping(`${messageId}-response`, response.data.response);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response from AI');

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === `${messageId}-response` && msg.role === 'assistant'
            ? { ...msg, content: 'Error: Failed to process message', pending: false }
            : msg
        )
      );

      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  // Voice recording functions using Web Speech API
  const toggleRecording = () => {
    if (isRecording) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  const startVoiceRecognition = () => {
    if (!speechRecognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    try {
      speechRecognitionRef.current.start();
      setIsRecording(true);
      toast.info('Listening... Speak now');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start speech recognition');
    }
  };

  const stopVoiceRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      toast.info('Voice recording stopped');
    }
    setIsRecording(false);
  };

  // Clear chat history
  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      // Add welcome message back
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Welcome to NEXUS HIVE AI HUB! I'm your AI assistant. How can I help you today?",
        role: 'assistant',
        timestamp: new Date(),
        model: currentModel
      };
      setMessages([welcomeMessage]);
      localStorage.removeItem('chatMessages');
      toast.info('Chat history cleared');
    }
  };

  // Change model
  const changeModel = (modelId: string) => {
    setCurrentModel(modelId);
    setIsModelSelectorOpen(false);
    toast.info(`Model changed to ${availableModels.find(m => m.id === modelId)?.name}`);
  };

  // Toggle message expansion
  const toggleMessageExpansion = (messageId: string) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(messageId);
    }
  };

  // Typing Animation Function
  const animateTyping = (messageId: string, fullText: string) => {
    let index = 0;
    setIsTyping(true);

    const interval = setInterval(() => {
      setTypingMessage(prev => prev + fullText[index]);
      index++;

      if (index === fullText.length) {
        clearInterval(interval);
        
        // Update the assistant's message with the fully typed content
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageId && msg.role === 'assistant'
              ? { ...msg, content: fullText, pending: false }
              : msg
          )
        );

        setTypingMessage(''); // Reset typing message
        setIsTyping(false); // Enable input again
      }
    }, 20); // Slightly faster typing speed
  };

  // Handle "Enter to Send"
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) handleSendMessage();
    }
  };

  // Format date for message timestamp
  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showSplash) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 animate-pulse rounded-full blur-xl opacity-50"></div>
          <div className="relative flex flex-col items-center gap-4 animate-fadeIn">
            <FaRobot className="text-6xl text-cyan-400 animate-bounce" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              NEXUS HIVE AI HUB
            </h1>
            <div className="mt-4 flex space-x-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse delay-150"></div>
              <div className="w-3 h-3 bg-cyan-600 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
      <ToastContainer position="top-right" theme="dark" />
      
      {/* Fixed top navigation bar */}
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-3 mx-6 mt-16 shadow-2xl mb-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
        <FaRobot className="text-white text-xl" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
          AI Chat Assistant
        </h1>
        <p className="text-gray-300 font-medium">
          AI-powered platform for code analysis, optimization, and debugging.
        </p>
      </div>
    </div>

    <div className="flex items-center space-x-4">
      <div className="relative">
        <button 
          onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors flex items-center gap-2"
          title="Change model"
        >
          <FaBrain className="text-cyan-400" />
          <span className="hidden sm:inline">
            {availableModels.find(m => m.id === currentModel)?.name || currentModel}
          </span>
        </button>

        {isModelSelectorOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 animate-fadeIn">
            <ul>
              {availableModels.map((model) => (
                <li key={model.id}>
                  <button
                    onClick={() => changeModel(model.id)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                      currentModel === model.id ? 'bg-indigo-600/30 font-bold' : ''
                    }`}
                  >
                    {model.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button 
        onClick={clearChat}
        className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
        title="Clear chat history"
      >
        <FaTrash className="text-red-400" />
      </button>
    </div>
  </div>
</div>


      {/* Main content area - adjusted padding */}
      <div className="flex-1 flex flex-col p-4 pt-6">
        {/* Chat messages container */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto pr-2 space-y-4 pb-2 scrollbar-custom"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
              Start a conversation with the AI assistant
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div 
                  key={`${msg.id}-${index}`} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${
                    msg.id === messages[messages.length - 2]?.id && messageAnimation ? 'animate-fadeInUp' : ''
                  }`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-700/80 to-purple-700/80 hover:from-indigo-600 hover:to-purple-600'
                        : 'bg-gray-800/80 hover:bg-gray-800/90 border border-gray-700/50'
                    }`}
                    onClick={() => toggleMessageExpansion(msg.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        msg.role === 'user' 
                          ? 'bg-purple-600' 
                          : 'bg-cyan-600'
                      }`}>
                        {msg.role === 'user' ? 
                          <FaUser className="text-white" /> : 
                          <FaRobot className="text-white" />
                        }
                      </div>
                      <div>
                        <span className="font-semibold">{msg.role === 'user' ? 'You' : 'Nexus AI'}</span>
                        <div className="text-xs opacity-70">{formatTime(msg.timestamp)}</div>
                      </div>
                      {msg.role === 'assistant' && msg.model && (
                        <div className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-700/60">
                          {availableModels.find(m => m.id === msg.model)?.name || msg.model}
                        </div>
                      )}
                    </div>
                    
                    {msg.pending ? (
                      // Show Typing Animation if AI is responding
                      msg.id === messages[messages.length - 1]?.id && typingMessage ? (
                        <div className="prose-sm prose-invert max-w-none">
                          {typingMessage}
                          <span className="animate-pulse">|</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-2">
                          <div className="bg-cyan-500 rounded-full w-2 h-2 animate-pulse"></div>
                          <div className="bg-indigo-500 rounded-full w-2 h-2 animate-pulse delay-75"></div>
                          <div className="bg-purple-500 rounded-full w-2 h-2 animate-pulse delay-150"></div>
                          <span className="text-sm text-gray-400">Thinking...</span>
                        </div>
                      )
                    ) : (
                      <div className={`prose-sm prose-invert max-w-none ${
                        expandedMessage === msg.id ? '' : 'line-clamp-10'
                      }`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                    
                    {msg.content.length > 300 && !msg.pending && (
                      <div className="mt-2 text-xs text-right">
                        <button 
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMessageExpansion(msg.id);
                          }}
                        >
                          {expandedMessage === msg.id ? 'Show less' : 'Show more'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message input area */}
        <div className="mt-4 bg-gray-800/40 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-indigo-700/50">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-900/60 text-white resize-none min-h-[45px] transition-all duration-300"
              disabled={isTyping}
            />
            
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleRecording}
                disabled={loading || isTyping}
                className={`p-3 rounded-lg transition-all duration-300 flex items-center justify-center ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                title={isRecording ? "Stop recording" : "Start voice recording"}
              >
                {isRecording ? <FaStop /> : <FaMicrophone />}
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={loading || isTyping || !message.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-400 mt-2 px-2">
            {isTyping ? (
              <span className="text-cyan-400">AI is thinking<span className="animate-pulse">...</span></span>
            ) : isRecording ? (
              <span className="text-red-400">Recording<span className="animate-pulse">...</span></span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                NEXUS HIVE AI
              </span>
            )}
            {message.length > 0 && <span>{message.length} characters</span>}
          </div>
        </div>
      </div>

      {/* Add this CSS to your global styles or in a style tag */}
      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.1);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.8);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
