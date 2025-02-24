import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot = ({ type = 'float', target = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: "Have questions about ThisWay? I'm here to help" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    
    // Create form-urlencoded data
    const formData = new URLSearchParams();
    formData.append('message', input);
    
    try {
      const response = await fetch('https://ssbx.dev-ai4jobs.com/rag/api/v1/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*'
        },
        body: formData.toString()
      }).catch(async (e) => {
        // Fallback request with no-cors
        console.log('Error:', e);
      });

      if (response.type === 'opaque') {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: "I received your message. However, due to security settings, I can't see the response. Please check with your administrator about CORS settings."
        }]);
      } else {
        const data = await response.json();
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: data.message || "Sorry, I couldn't process that." 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: "Sorry, something went wrong." 
      }]);
    }
    
    setLoading(false);
    setInput('');
  };

  const renderMessage = (message, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`prose max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
        message.type === 'user' 
          ? 'bg-black text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        {message.content}
      </div>
    </motion.div>
  );

  if (type === 'float') {
    return (
      <motion.div 
        className="fixed bottom-4 right-4"
        animate={{ width: isOpen ? '384px' : 'auto' }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="chat-button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center w-12 h-12 ml-auto text-white transition-colors bg-black rounded-full shadow-lg hover:bg-gray-900"
            >
              <MessageCircle size={20} />
            </motion.button>
          ) : (
            <motion.div
              key="chat-window"
              initial={{ opacity: 0, scale: 0.95, width: '100%' }}
              animate={{ opacity: 1, scale: 1, width: '100%' }}
              exit={{ opacity: 0, scale: 0.95, width: '100%' }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-[600px] bg-white rounded-xl overflow-hidden border shadow-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <h3 className="text-sm font-semibold text-gray-900">ThisWay Assistant</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 px-4 py-6 overflow-y-auto bg-white">
                <AnimatePresence>
                  {messages.map(renderMessage)}
                </AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex space-x-1.5 ml-4"
                  >
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message ThisWay Assistant..."
                    className="flex-1 px-3 py-2 text-sm transition-shadow border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="p-2 text-gray-600 transition-colors hover:text-black disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Embedded version
  return (
    <div className="w-full h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col h-[600px] bg-white rounded-xl overflow-hidden border shadow-lg"
      >
        {/* Same content as floating chat window but without close button */}
        <div className="flex items-center px-4 py-3 bg-white border-b">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <h3 className="text-sm font-semibold text-gray-900">ThisWay Assistant</h3>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto bg-white">
          <AnimatePresence>
            {messages.map(renderMessage)}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex space-x-1.5 ml-4"
            >
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message ThisWay Assistant..."
              className="flex-1 px-3 py-2 text-sm transition-shadow border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 text-gray-600 transition-colors hover:text-black disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Chatbot;