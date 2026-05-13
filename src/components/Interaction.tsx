import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INTERACTIONS, SPHERES } from '../constants';
import { SphereType } from '../types';
import { Cloud, Mountain, Droplets, Leaf, Moon, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import AIChat from './AIChat';

const ICON_MAP = {
  Cloud,
  Mountain,
  Droplets,
  Leaf,
  Moon,
};

export default function Interaction() {
  const [selectedFrom, setSelectedFrom] = useState<SphereType | null>(null);
  const [selectedTo, setSelectedTo] = useState<SphereType | null>(null);

  const foundInteraction = INTERACTIONS.find(
    i => (i.from === selectedFrom && i.to === selectedTo) || (i.from === selectedTo && i.to === selectedFrom)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-[1700px] mx-auto h-[calc(100vh-120px)] overflow-hidden">
      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col gap-3 bg-white p-5 rounded-[40px] border border-stone-100 shadow-lg shadow-stone-200/50 overflow-hidden">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
             <div className="p-1.5 bg-blue-50 rounded-lg">
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin-slow" />
             </div>
             <h2 className="text-xl font-black tracking-tight">지구계 상호작용 탐구</h2>
          </div>
          <p className="text-stone-500 font-bold text-xs">두 개의 권역을 선택하여 상호작용을 알아보세요.</p>
        </div>

        {/* Sphere Selector Row */}
        <div className="flex justify-center flex-wrap gap-1.5 px-1">
          {Object.entries(SPHERES).map(([key, sphere]) => {
            const Icon = ICON_MAP[sphere.icon as keyof typeof ICON_MAP];
            const isSelected = selectedFrom === key || selectedTo === key;
            const isPrimary = selectedFrom === key;
            const isSecondary = selectedTo === key;
 
            return (
              <button
                key={key}
                onClick={() => {
                  if (isSelected) {
                    if (isPrimary) setSelectedFrom(null);
                    else setSelectedTo(null);
                  } else {
                    if (!selectedFrom) setSelectedFrom(key as SphereType);
                    else setSelectedTo(key as SphereType);
                  }
                }}
                className={cn(
                  "flex flex-col items-center p-2.5 min-w-[100px] rounded-[20px] border-2 transition-all gap-1.5 group",
                  isSelected 
                    ? "bg-white border-stone-900 shadow-sm scale-105" 
                    : "bg-stone-50 border-transparent hover:border-stone-200 hover:bg-white"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-[14px] flex items-center justify-center transition-all",
                  isSelected ? "bg-stone-900 shadow-md" : "bg-white shadow-sm group-hover:shadow-md"
                )}>
                  <Icon className={cn("w-5 h-5", isSelected ? "text-white" : "text-stone-400")} />
                </div>
                <div className="text-center">
                  <span className={cn("text-[13px] font-black", isSelected ? "text-stone-900" : "text-stone-400")}>
                    {sphere.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Result Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {!selectedFrom || !selectedTo ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                 <div className="w-20 h-20 bg-stone-50 rounded-[32px] flex items-center justify-center mb-4 border border-stone-100">
                    <RefreshCw className="w-8 h-8 text-stone-200" />
                 </div>
                 <h3 className="text-lg font-bold text-stone-400 uppercase tracking-widest">Select Two Spheres</h3>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center p-4 gap-4"
              >
                <div className="flex items-center justify-center gap-4 max-w-xl w-full">
                   <div className="flex-1 text-center bg-white p-3 rounded-[20px] border border-stone-100 shadow-sm relative">
                      <div className={cn("absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[7px] font-black text-white", SPHERES[selectedFrom].color.split(' ')[2])}>SPHERE A</div>
                      <span className="text-lg font-black">{SPHERES[selectedFrom].name}</span>
                   </div>
                   <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-md">
                      <ArrowRight className="w-4 h-4" />
                   </div>
                   <div className="flex-1 text-center bg-white p-3 rounded-[20px] border border-stone-100 shadow-sm relative">
                      <div className={cn("absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[7px] font-black text-white", SPHERES[selectedTo].color.split(' ')[2])}>SPHERE B</div>
                      <span className="text-lg font-black">{SPHERES[selectedTo].name}</span>
                   </div>
                </div>
 
                <div className="w-full max-w-2xl">
                  {foundInteraction ? (
                    <motion.div 
                      initial={{ scale: 0.98 }}
                      animate={{ scale: 1 }}
                      className="bg-stone-900 text-white p-5 rounded-[32px] shadow-lg relative overflow-hidden"
                    >
                       <Zap className="absolute -top-2 -right-2 w-16 h-16 text-white/5 rotate-12" />
                       <div className="relative z-10 space-y-1 text-center">
                          <h4 className="text-xl font-black text-blue-400">
                             {foundInteraction.title}
                          </h4>
                          <p className="text-sm text-stone-300 leading-snug max-w-lg mx-auto">
                             {foundInteraction.description}
                          </p>
                       </div>
                    </motion.div>
                  ) : (
                    <div className="bg-stone-50 p-6 rounded-[36px] border-2 border-dashed border-stone-200 text-center space-y-3">
                      <p className="text-stone-400 font-bold text-sm">새로운 상호작용을 발견했나요? 궁금한 점은 AI 선생님께 물어보세요!</p>
                      <button 
                        onClick={() => {
                          const chatInput = document.querySelector('input') as HTMLInputElement;
                          if (chatInput) {
                            chatInput.value = `${SPHERES[selectedFrom].name}과 ${SPHERES[selectedTo].name}의 상호작용은 뭐가 있어?`;
                            chatInput.focus();
                          }
                        }}
                        className="px-5 py-2 bg-white border border-stone-200 rounded-full text-[10px] font-bold hover:bg-stone-100 transition-all"
                      >
                         선생님께 질문 준비하기
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar AI Chat */}
      <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col h-full bg-blue-50/50 rounded-[40px] border border-blue-100 overflow-hidden">
        <AIChat />
      </div>
    </div>
  );
}

