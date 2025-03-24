import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Moon } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_KEY = 'AIzaSyDIdz2BFU3i_yOztTb69shSzkiG100IVHg';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are MindSpeak, an empathetic mental health support chatbot specifically designed for hostel students. Your responses should:
                1. Show deep understanding of hostel life challenges (homesickness, academic pressure, roommate issues, etc.)
                2. Provide emotional support and validation
                3. Offer practical coping strategies relevant to hostel life
                4. Maintain a warm, friendly tone while being professional
                5. Keep responses concise and focused
                6. Recognize signs of serious mental health issues and encourage professional help when needed
                
                User message: ${userMessage}`
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, I encountered an error. Please try again later.';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const botResponse = await generateResponse(inputMessage);
    
    const botMessage: Message = {
      text: botResponse,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-2xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center gap-3 fixed top-0 w-full max-w-2xl z-10">
          <div className="bg-blue-600 p-2 rounded-full">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">MindSpeak</h1>
            <p className="text-sm text-gray-400">Your Mental Health Companion</p>
          </div>
          <Moon className="ml-auto text-gray-400" size={20} />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 pt-24 pb-24 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg mb-2">👋 Welcome to MindSpeak</p>
              <p className="text-sm">Share your thoughts, and I'm here to listen and support you.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="bg-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <p className="text-sm">MindSpeak is typing...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="fixed bottom-0 w-full max-w-2xl p-4 bg-gray-800 border-t border-gray-700"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Share what's on your mind..."
              className="flex-1 rounded-full bg-gray-700 border-none px-6 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isTyping}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;