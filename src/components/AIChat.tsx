import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2, MessageCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: '안녕! 나는 지구과학 전문가 AI 선생님이야. 지구계에 대해 궁금한 게 있다면 무엇이든 물어봐! 🌍' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = await getAIChatResponse(userMsg, "지구계 구성 요소와 상호작용 학습 중", messages.slice(-5));
    
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#FAE100] p-4 text-stone-900 flex items-center gap-3 border-b border-black/5">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
          <Bot className="w-6 h-6 text-[#1A1A1A]" />
        </div>
        <div>
          <h3 className="font-black text-sm">지구계 AI 선생님</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-stone-600 font-black uppercase tracking-wider">MODEL: GEMINI 1.5 FLASH</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#BACEE0] scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-start gap-2 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {msg.role === 'model' && (
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-black/5">
                <Bot className="w-5 h-5 text-stone-800" />
              </div>
            )}
            
            <div className={cn(
              "p-3 rounded-xl text-[14px] shadow-sm leading-relaxed relative",
              msg.role === 'user' 
                ? "bg-[#FAE100] text-stone-900 ml-2" 
                : "bg-white text-stone-800 border border-black/5 mr-2"
            )}>
              <Markdown>{msg.content}</Markdown>
              {/* Triangle Tail */}
              <div className={cn(
                "absolute top-3 w-0 h-0 border-[6px] border-transparent",
                msg.role === 'user' 
                  ? "left-full border-l-[#FAE100]" 
                  : "right-full border-r-white"
              )} />
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 mr-auto"
          >
            <div className="w-9 h-9 bg-white/50 rounded-xl flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-stone-500 animate-spin" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white">
        <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="선생님께 질문해보세요..."
            className="flex-1 bg-transparent px-4 py-3 outline-none text-[15px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <p className="text-[10px] text-center text-stone-400 mt-2 flex items-center justify-center gap-1">
          <MessageCircle className="w-3 h-3" />
          질문하면 AI 선생님이 답변해 줍니다.
        </p>
      </div>
    </div>
  );
}
