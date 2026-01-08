
import React, { useState, useRef, useEffect } from 'react';
import { getTravelRecommendation } from '../services/gemini';

const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: 'Olá! Sou a EVA, sua assistente pessoal de reservas. Qual destino despertou seu interesse hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await getTravelRecommendation(userMsg);
    setMessages(prev => [...prev, { role: 'bot', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[550px] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(5,150,105,0.2)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-black text-lg">
                E
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">EVA Concierge</p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Atendimento Premium</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFBFF]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-100' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-50">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Como a EVA pode ajudar?"
                className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 text-white rounded-xl transition-all shadow-md shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-emerald-600 text-white p-5 rounded-full shadow-2xl hover:shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 group border-4 border-white"
        >
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 font-black text-xs uppercase tracking-widest pl-0 group-hover:pl-2">Falar com EVA</span>
          <div className="w-6 h-6 flex items-center justify-center font-black text-lg">E</div>
        </button>
      )}
    </div>
  );
};

export default AIConcierge;
