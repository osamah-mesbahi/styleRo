
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'أهلاً بكِ في Style Ro! أنا خبيرة الجمال الذكية الخاصة بكِ. كيف يمكنني مساعدتكِ اليوم في اختيار عطركِ المفضل أو تنسيق مكياجكِ؟' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `أنتِ "خبيرة الجمال الذكية" لمتجر Style Ro في اليمن.
          مهامك:
          1. مساعدة العميلات في اختيار المكياج والعطور ومنتجات العناية بناءً على طلباتهن.
          2. شرح كيفية الطلب من المتجر وتصفح الأقسام.
          3. تقديم معلومات عن الشحن داخل اليمن (صنعاء، عدن، وغيرها) وطرق الدفع (الكريمي، المحافظ الإلكترونية).
          4. كوني ودودة جداً، محترفة، وتحدثي بلهجة بيضاء واضحة.
          5. إذا سألت عن منتجات غير موجودة، اقترحي عليها تصفح "المتجر المحلي".`,
        },
      });

      const aiText = response.text || 'عذراً، واجهت مشكلة بسيطة. هل يمكنكِ إعادة السؤال؟';
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'أنا متصلة حالياً بمزود الخدمة، يرجى المحاولة بعد قليل.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-6 z-[140] bg-gradient-to-tr from-black via-gray-900 to-primary text-white py-3 px-4 shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group md:bottom-10 border border-white/10"
        style={{ borderRadius: '1.5rem' }}
        title="اسألي الذكاء الاصطناعي"
      >
        <div className="relative">
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full"></span>
        </div>
        <span className="text-[11px] font-extrabold tracking-widest overflow-hidden max-w-0 group-hover:max-w-[60px] transition-all duration-500 whitespace-nowrap">اسألي</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 md:inset-auto md:bottom-24 md:left-6 md:right-auto md:top-auto z-[200] w-full md:w-[380px] h-full md:h-[580px] bg-white shadow-2xl flex flex-col overflow-hidden animate-zoom-in border border-gray-100"
          style={{ borderRadius: '1.5rem' }}
        >
          <div className="bg-black p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 bg-primary flex items-center justify-center text-white shadow-lg"
                style={{ borderRadius: '1rem' }}
              >
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-sm">مساعدة Ro الذكية</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-[10px] text-gray-400 font-bold">متصلة الآن</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition p-2">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#fafafa] custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 text-[11px] font-bold leading-relaxed shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-gray-800 border border-gray-100'
                  }`}
                  style={{ borderRadius: '1.2rem' }}
                >
                  <div className="flex items-center gap-2 mb-1 opacity-50">
                    {m.role === 'user' ? <User size={10}/> : <Sparkles size={10}/>}
                    <span className="text-[8px] uppercase tracking-widest">{m.role === 'user' ? 'أنتِ' : 'الخبيرة'}</span>
                  </div>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div 
                  className="bg-white border border-gray-100 text-primary p-4 flex items-center gap-2 shadow-sm rounded-2xl"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[10px] font-extrabold">جاري الكتابة...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="اسألي عن أي منتج..."
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 pr-12 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white flex items-center justify-center rounded-xl hover:bg-primary transition-all disabled:bg-gray-200"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;

