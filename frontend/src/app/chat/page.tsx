'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaPaperPlane, FaRobot, FaUser, FaMicrophone, FaStop, FaTrash } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import 'react-toastify/dist/ReactToastify.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  pending?: boolean;
  timestamp?: Date;
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
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
          content: "Hello! I'm your AI assistant. How can I help you today?",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      setIsFirstLoad(false);
    }

    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
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

    return () => {
      // Cleanup speech recognition on component unmount
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [isFirstLoad]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && !isFirstLoad) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages, isFirstLoad]);

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
      timestamp: currentTime 
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Add a pending assistant message
    const pendingAssistantMessage: Message = { 
      id: messageId, 
      content: '', 
      role: 'assistant', 
      pending: true,
      timestamp: currentTime
    };
    setMessages(prev => [...prev, pendingAssistantMessage]);

    setMessage('');
    setLoading(true);
    setIsTyping(true);

    try {
      const backendURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(`${backendURL}/chat`, { message });

      if (!response.data.response) {
        throw new Error("Invalid response from AI");
      }

      // Start the typing animation
      setTypingMessage('');
      animateTyping(messageId, response.data.response);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response from AI');

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId && msg.role === 'assistant'
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
      // Clear previous text or start with existing text
      // Uncomment the next line if you want to clear the input when starting recording
      // setMessage('');
      
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
        content: "Hello! I'm your AI assistant. How can I help you today?",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      localStorage.removeItem('chatMessages');
      toast.info('Chat history cleared');
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
    }, 50); // Typing speed
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

  return (
    <div className="flex flex-col h-full">
      <ToastContainer position="top-right" theme="colored" />
      
      <div className="bg-white dark:bg-gray-800 p-4 shadow-md mb-4 rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FaRobot className="text-blue-500" />
            AI Chat Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chat with an AI-powered assistant
          </p>
        </div>
        <button 
          onClick={clearChat}
          className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Clear chat history"
        >
          <FaTrash />
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation with the AI assistant
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'user' ? 
                      <FaUser className="text-white" /> : 
                      <FaRobot className="text-blue-500 dark:text-blue-300" />
                    }
                    <span className="font-semibold">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
                    <span className="text-xs opacity-70 ml-auto">{formatTime(msg.timestamp)}</span>
                  </div>
                  {msg.pending ? (
                    // Show Typing Animation if AI is responding
                    msg.id === messages[messages.length - 1]?.id && typingMessage ? (
                      <div className="prose-sm dark:prose-invert max-w-none">
                        {typingMessage}
                        <span className="animate-pulse">|</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="bg-gray-400 dark:bg-gray-500 rounded-full w-2 h-2 animate-pulse"></div>
                        <div className="bg-gray-400 dark:bg-gray-500 rounded-full w-2 h-2 animate-pulse delay-75"></div>
                        <div className="bg-gray-400 dark:bg-gray-500 rounded-full w-2 h-2 animate-pulse delay-150"></div>
                      </div>
                    )
                  ) : (
                    <div className="prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-4">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none min-h-[45px]"
            disabled={isTyping}
          />
          
          <div className="flex gap-2">
            <button
              onClick={toggleRecording}
              disabled={loading || isTyping}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white ' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? <FaStop /> : <FaMicrophone />}
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={loading || isTyping || !message.trim()}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-2">
          {isTyping ? (
            <span>AI is typing<span className="animate-pulse">...</span></span>
          ) : isRecording ? (
            <span className="text-red-500">Recording<span className="animate-pulse">...</span></span>
          ) : (
            <span></span>
          )}
          {message.length > 0 && <span>{message.length} characters</span>}
        </div>
      </div>
    </div>
  );
}