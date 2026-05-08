import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Film, Sparkles, Loader2, Minus, Maximize2 } from 'lucide-react';

const AskBro = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Yoo! I'm AskBro. What kind of cinematic masterpiece are we hunting for today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    const newChat = [...messages, { role: 'user', text: userText }];
    setMessages(newChat);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          prompt: userText
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Connection failed');
      
      setMessages([...newChat, { role: 'bot', text: data.message }]);
    } catch (err) {
      setMessages([
        ...newChat, 
        { role: 'error', text: err.message || "My cinematic circuits fried. Are we sure the API key is working?" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 z-[99999] bg-gradient-to-r from-red-600 to-red-800 text-white p-4 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-110 transition-all duration-300 group overflow-hidden"
      >
        <span className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        <Bot size={28} className="relative z-10" />
      </button>
    );
  }

  // Formatting helper for bold text parsing (primitive markdown)
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      // Very basic bold parsing (**text**)
      const parts = line.split(/\\*\\*(.*?)\\*\\*/g);
      return (
        <p key={i} className="mb-2 last:mb-0 leading-relaxed text-[13px]">
          {parts.map((part, index) => 
            index % 2 === 1 ? <strong key={index} className="text-white font-black">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[99999] flex flex-col transition-all duration-500 ease-in-out ${isMinimized ? 'w-[300px] h-[60px]' : 'w-[360px] sm:w-[400px] h-[600px] max-h-[85vh]'} bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden`}>
      
      {/* Header */}
      <div 
        className="h-[60px] bg-gradient-to-r from-zinc-900 to-black border-b border-white/10 flex items-center justify-between px-4 cursor-pointer shrink-0"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center relative overflow-hidden">
            <Bot size={20} className="text-red-500 relative z-10" />
            <div className="absolute inset-0 bg-red-600/20 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-outfit font-black italic tracking-wider text-white flex items-center gap-1.5">
              AskBro AI <Sparkles size={12} className="text-yellow-500" />
            </span>
            <span className="text-[9px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Cinematic Oracle</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="text-zinc-500 hover:text-white transition-colors p-1"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
          </button>
          <button 
            className="text-zinc-500 hover:text-red-500 transition-colors p-1"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body container (hides when minimized) */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 w-full ${isMinimized ? 'opacity-0 h-0' : 'opacity-100 h-full'}`}>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-gradient-to-b from-transparent to-black/40">
          
          <div className="flex justify-center mb-6">
            <span className="bg-white/5 border border-white/10 text-zinc-500 text-[9px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full">
              Powered by Gemini 2.5
            </span>
          </div>

          {messages.map((msg, idx) => {
            const isBot = msg.role === 'bot';
            const isErr = msg.role === 'error';
            return (
              <div key={idx} className={`flex ${!isBot && !isErr ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-lg ${
                  !isBot && !isErr 
                    ? 'bg-gradient-to-br from-red-600 to-red-800 text-white rounded-tr-sm border border-red-500/50' 
                    : isErr 
                      ? 'bg-red-950/50 text-red-400 border border-red-900/50 rounded-tl-sm'
                      : 'bg-zinc-900 border border-white/10 text-zinc-300 rounded-tl-sm'
                }`}>
                  {isBot ? formatText(msg.text) : <p className="text-[13px] font-medium leading-relaxed">{msg.text}</p>}
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black border-t border-white/10 pb-6 shrink-0 z-10">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Film size={18} className="absolute left-4 text-zinc-600" />
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Suggest a thriller twist..."
              disabled={isLoading}
              className="w-full bg-zinc-900 border border-white/10 focus:border-red-600/50 focus:bg-zinc-800 rounded-full py-3.5 pl-12 pr-14 text-sm text-white placeholder:text-zinc-600 outline-none transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white disabled:text-zinc-600 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AskBro;
