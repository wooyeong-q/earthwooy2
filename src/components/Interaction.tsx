import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INTERACTIONS, SPHERES } from '../constants';
import { SphereType, EarthComponent } from '../types';
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

interface InteractionProps {
  placedItems: Record<SphereType, EarthComponent[]>;
}

export default function Interaction({ placedItems }: InteractionProps) {
  const [selectedFrom, setSelectedFrom] = useState<SphereType | null>(null);
  const [selectedTo, setSelectedTo] = useState<SphereType | null>(null);
  
  // Track specific items dropped into slots
  const [slot1Item, setSlot1Item] = useState<EarthComponent | null>(null);
  const [slot2Item, setSlot2Item] = useState<EarthComponent | null>(null);

  const foundInteraction = INTERACTIONS.find(
    i => (i.from === selectedFrom && i.to === selectedTo) || (i.from === selectedTo && i.to === selectedFrom)
  );

  const handleDrop = (e: React.DragEvent, slot: 1 | 2) => {
    e.preventDefault();
    const itemData = e.dataTransfer.getData('item');
    const sphereData = e.dataTransfer.getData('sphereType');

    if (itemData) {
      const item = JSON.parse(itemData) as EarthComponent;
      if (slot === 1) {
        setSlot1Item(item);
        setSelectedFrom(item.category as SphereType);
      } else {
        setSlot2Item(item);
        setSelectedTo(item.category as SphereType);
      }
    } else if (sphereData) {
      const sphereType = sphereData as SphereType;
      if (slot === 1) {
        setSlot1Item(null);
        setSelectedFrom(sphereType);
      } else {
        setSlot2Item(null);
        setSelectedTo(sphereType);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 py-2 h-full overflow-hidden">
      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col gap-6 bg-white p-6 rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <RefreshCw className="w-6 h-6 text-blue-500 animate-[spin_4s_linear_infinite]" />
               <h2 className="text-2xl font-black tracking-tight">지구계 상호작용 실험실</h2>
            </div>
            <p className="text-stone-500 font-bold text-sm">권역 아이콘을 중앙으로 드래그하여 상호작용을 확인하세요.</p>
          </div>

          {/* Draggable Spheres Source */}
          <div className="flex gap-2 bg-stone-50 p-2 rounded-3xl border border-stone-100 shadow-inner">
            {Object.keys(SPHERES).map((key) => {
              const Icon = ICON_MAP[SPHERES[key as SphereType].icon as keyof typeof ICON_MAP];
              return (
                <motion.div 
                  key={key}
                  draggable
                  onDragStart={(e: any) => {
                    e.dataTransfer.setData('sphereType', key);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-16 h-20 rounded-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white transition-all shadow-sm border border-stone-200 group relative pt-2",
                    SPHERES[key as SphereType].color.split(' ')[0] // Using the background color from constants
                  )}
                >
                  <Icon className="w-8 h-8 text-stone-700" />
                  <span className="mt-1 text-[9px] font-black text-stone-600 group-hover:text-stone-900 transition-colors">{SPHERES[key as SphereType].name}</span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-stone-900 text-white text-[7px] font-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {SPHERES[key as SphereType].name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Drop Slots Area */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4 bg-stone-50/50 rounded-[32px] border-2 border-dashed border-stone-200">
           {/* Slot 1 */}
           <div 
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => handleDrop(e, 1)}
             className={cn(
               "w-48 h-48 rounded-[32px] border-4 flex flex-col items-center justify-center transition-all relative group",
               selectedFrom 
                ? "bg-white border-stone-900 shadow-xl scale-105" 
                : "bg-white/40 border-stone-200 border-dashed hover:border-blue-400 hover:bg-white"
             )}
           >
             {selectedFrom ? (
               <div className="flex flex-col items-center gap-3">
                 <div className="w-24 h-24 bg-stone-900 rounded-[28px] flex items-center justify-center shadow-lg">
                    {(() => {
                      const Icon = ICON_MAP[SPHERES[selectedFrom].icon as keyof typeof ICON_MAP];
                      return <Icon className="w-12 h-12 text-white" />;
                    })()}
                 </div>
                 <div className="text-center">
                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest leading-none mb-1">{SPHERES[selectedFrom].name}</p>
                    <p className="text-xl font-black">{slot1Item?.name || SPHERES[selectedFrom].name}</p>
                 </div>
                 <button 
                  onClick={() => { setSelectedFrom(null); setSlot1Item(null); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Zap className="w-3 h-3 fill-white" />
                 </button>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-3 opacity-30">
                 <div className="w-16 h-16 bg-stone-100/50 rounded-2xl flex items-center justify-center border-2 border-stone-200">
                    <Zap className="w-8 h-8 text-stone-300" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest">권역 A 선택</span>
               </div>
             )}
           </div>

           <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-white shadow-lg">
                 <ArrowRight className="w-5 h-5" />
              </div>
           </div>

           {/* Slot 2 */}
           <div 
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => handleDrop(e, 2)}
             className={cn(
               "w-48 h-48 rounded-[32px] border-4 flex flex-col items-center justify-center transition-all relative group",
               selectedTo 
                ? "bg-white border-stone-900 shadow-xl scale-105" 
                : "bg-white/40 border-stone-200 border-dashed hover:border-blue-400 hover:bg-white"
             )}
           >
             {selectedTo ? (
               <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 bg-stone-900 rounded-[28px] flex items-center justify-center shadow-lg">
                    {(() => {
                      const Icon = ICON_MAP[SPHERES[selectedTo].icon as keyof typeof ICON_MAP];
                      return <Icon className="w-12 h-12 text-white" />;
                    })()}
                 </div>
                 <div className="text-center">
                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest leading-none mb-1">{SPHERES[selectedTo].name}</p>
                    <p className="text-xl font-black">{slot2Item?.name || SPHERES[selectedTo].name}</p>
                 </div>
                 <button 
                  onClick={() => { setSelectedTo(null); setSlot2Item(null); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Zap className="w-3 h-3 fill-white" />
                 </button>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-3 opacity-30">
                 <div className="w-16 h-16 bg-stone-100/50 rounded-2xl flex items-center justify-center border-2 border-stone-200">
                    <Zap className="w-8 h-8 text-stone-300" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-widest">권역 B 선택</span>
               </div>
             )}
           </div>
        </div>

        {/* Interaction Content Area */}
        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {foundInteraction ? (
              <motion.div 
                key={foundInteraction.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden text-center"
              >
                <Zap className="absolute -top-4 -right-4 w-24 h-24 text-blue-500/10 rotate-12" />
                <div className="relative z-10 space-y-3">
                  <h4 className="text-xl font-black text-blue-400">
                    {foundInteraction.title}
                  </h4>
                  <p className="text-base text-stone-300 leading-relaxed max-w-lg mx-auto">
                    {foundInteraction.description}
                  </p>
                </div>
              </motion.div>
            ) : selectedFrom && selectedTo ? (
              <motion.div 
                key="ai-suggestion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50 p-6 rounded-[32px] border-2 border-dashed border-blue-200 text-center space-y-4"
              >
                <p className="text-blue-900 font-bold text-sm">이 두 권역 사이의 특별한 상호작용을 찾으시나요? AI 선생님께 물어보세요!</p>
                <button 
                  onClick={() => {
                    const chatInput = document.querySelector('input') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = `${slot1Item?.name || SPHERES[selectedFrom].name}와/과 ${slot2Item?.name || SPHERES[selectedTo].name}의 상호작용은 무엇이 있을까?`;
                      chatInput.focus();
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full text-sm font-black shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
                >
                  선생님께 자세히 물어보기
                </button>
              </motion.div>
            ) : null}
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

