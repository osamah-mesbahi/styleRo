import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatWidgetProps {
  language: 'en' | 'ar';
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const t = {
    en: {
      greeting: "Hi! I'm Eva, your AI Stylist. Looking for something specific or need outfit advice? ✨",
      placeholder: "Ask Eva for fashion advice...",
      title: "Stylero AI Stylist",
      error: "Sorry, I'm having trouble connecting right now."
    },
    ar: {
      greeting: "أهلاً! أنا إيفا، منسقة أزيائك الشخصية. هل تبحثين عن شيء محدد أو تحتاجين نصيحة؟ ✨",
      placeholder: "اسأل إيفا عن الموضة...",
      title: "مساعد ستايلرو الذكي",
      error: "عذراً، أواجه مشكلة في الاتصال حالياً."
    }
  };
  
  const txt = t[language];
  const isRtl = language === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{ role: 'model', text: txt.greeting }]);
    }
  }, [language]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const getBubbleClass = (role: ChatMessage['role']) =>
    role === 'user'
      ? `bg-brand-black text-white ${isRtl ? 'rounded-bl-none' : 'rounded-br-none'}`
      : `bg-white text-gray-800 ${isRtl ? 'rounded-br-none' : 'rounded-bl-none'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: txt.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-24 md:bottom-8 z-40 flex flex-col pointer-events-none left-5 items-start`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-[350px] bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 flex flex-col h-[500px] transition-all animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-brand-accent p-5 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Sparkles size={20} className="text-white" fill="white" />
              </div>
              <div>
                 <span className="font-bold block text-sm">{txt.title}</span>
                 <span className="text-[10px] text-white/80 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" aria-label="Back">
                {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors" aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f4f4f5] no-scrollbar">
            {messages.map((msg, idx) => {
              const alignClass = msg.role === 'user' ? 'justify-end' : 'justify-start';
              return (
                <div key={idx} className={`flex ${alignClass}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${getBubbleClass(msg.role)}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`bg-white p-3.5 rounded-2xl shadow-sm flex items-center gap-2 ${isRtl ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={txt.placeholder}
                className={`w-full bg-gray-50 text-sm rounded-full py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all ${isRtl ? 'pl-12 pr-5' : 'pl-5 pr-12'}`}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className={`absolute p-2 bg-brand-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-brand-black transition-colors ${isRtl ? 'left-2' : 'right-2'}`}
              >
                <Send size={16} className={isRtl ? 'rotate-180' : ''} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button - Redesigned to be distinct from WhatsApp */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto group relative"
      >
        <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
        <div className="relative bg-gradient-to-tr from-purple-600 to-pink-500 text-white w-14 h-14 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transform transition-transform group-hover:scale-105 active:scale-95">
             {isOpen ? <X size={24} /> : <Sparkles size={24} fill="white" />}
        </div>
      </button>
    </div>
  );
};