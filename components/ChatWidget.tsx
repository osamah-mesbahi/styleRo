
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'أهلاً بك! أنا إيفا، مساعدتك الذكية في ستايل رو. كيف يمكنني مساعدتك في اختيار إطلالتك اليوم؟ 👗✨' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await sendMessageToGemini(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'عذراً، أواجه مشكلة بسيطة. حاولي مرة أخرى!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 z-[60] flex flex-col items-end" dir="rtl">
      {isOpen && (
        <div className="mb-4 w-[85vw] sm:w-80 h-[450px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <div className="bg-brand-black p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center animate-pulse">
                <Bot size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs tracking-tighter italic">Eva AI</span>
                <span className="text-[8px] opacity-60">متصلة الآن</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-1">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-gray-50/30 space-y-4 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-3 max-w-[85%] text-[11px] font-bold leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-brand-black text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-2xl rounded-tl-none border border-gray-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100">
                  <Loader2 size={14} className="animate-spin text-brand-accent" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اسأليني عن الموضة..."
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-brand-accent transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-brand-accent text-white p-3 rounded-xl hover:scale-105 transition-transform active:scale-90 disabled:opacity-50"
            >
              <Send size={18} className="rotate-180" />
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-4 border-white"
      >
        {isOpen ? <X size={24} /> : (
          <div className="relative">
            <Sparkles size={24} className="text-brand-accent animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-black"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
