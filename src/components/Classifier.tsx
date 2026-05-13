import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EARTH_COMPONENTS, SPHERES } from '../constants';
import { EarthComponent, SphereType } from '../types';
import { getAIFeedback } from '../services/geminiService';
import { Cloud, Mountain, Droplets, Leaf, Moon, CheckCircle2, XCircle, Info, Plus, ChevronRight, Globe2, Bot } from 'lucide-react';
import { cn } from '../lib/utils';

const ICON_MAP = {
  Cloud,
  Mountain,
  Droplets,
  Leaf,
  Moon,
};

export default function Classifier() {
  const [items, setItems] = useState<EarthComponent[]>(
    [...EARTH_COMPONENTS].sort(() => Math.random() - 0.5)
  );
  const [placedItems, setPlacedItems] = useState<Record<SphereType, EarthComponent[]>>({
    atmosphere: [],
    geosphere: [],
    hydrosphere: [],
    biosphere: [],
    exosphere: [],
  });
  const [feedback, setFeedback] = useState<{ text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleDrop = (item: EarthComponent, targetSphere: SphereType, sourceSphere?: SphereType) => {
    if (isLoading) return;
    
    // Remove from source (pool or another sphere)
    if (sourceSphere) {
      setPlacedItems(prev => ({
        ...prev,
        [sourceSphere]: prev[sourceSphere].filter(i => i.id !== item.id)
      }));
    } else {
      setItems(prev => prev.filter(i => i.id !== item.id));
    }

    // Add to target sphere
    setPlacedItems(prev => ({
      ...prev,
      [targetSphere]: [...prev[targetSphere], item]
    }));
  };

  const askFeedback = async (item: EarthComponent, sphereType: SphereType) => {
    if (isLoading) return;
    setIsLoading(true);
    const aiMsg = await getAIFeedback(item.name, SPHERES[sphereType].name);
    setFeedback({ text: aiMsg });
    setIsLoading(false);

    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const addNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: EarthComponent = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: 'geosphere', // Internal category placeholder
       description: '학습자가 직접 추가한 요소'
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemName('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto">
      {/* Header & Add Item Info */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100 items-center">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-2xl">
                  <Globe2 className="w-6 h-6 text-blue-600" />
                </div>
                지구계 구성 요소 분류
              </h2>
              <p className="text-stone-500 font-medium mt-2">다양한 요소를 탐구하며 분류해보세요. 궁금할 때 로봇 아이콘을 누르면 AI 선생님이 설명해줘요!</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-2xl border border-stone-100 italic text-stone-400 text-xs">
              <Plus className="w-3 h-3" />
              직접 요소를 추가해서 분류해볼 수 있습니다
            </div>
          </div>
          
          {/* Inline Add Item Form - Always Visible */}
          <div className="bg-stone-50/50 p-4 rounded-3xl border border-stone-100">
            <form onSubmit={addNewItem} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <input 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="새로운 요소의 이름을 입력하세요 (예: 고래, 화강암, 구름...)"
                  className="w-full px-6 py-4 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-base font-bold shadow-sm transition-all"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  type="submit"
                  className="flex-1 px-8 py-4 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-xl font-black flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  항목 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {Object.entries(SPHERES).map(([key, sphere]) => {
          const Icon = ICON_MAP[sphere.icon as keyof typeof ICON_MAP];
          const placed = placedItems[key as SphereType];
          return (
            <div
              key={key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const itemData = e.dataTransfer.getData('item');
                const sourceSphere = e.dataTransfer.getData('sourceSphere') as SphereType | undefined;
                if (itemData) {
                  handleDrop(JSON.parse(itemData), key as SphereType, sourceSphere);
                }
              }}
              className={cn(
                "flex flex-col p-4 rounded-[32px] border-2 border-dashed transition-all min-h-[280px] gap-4",
                sphere.color,
              )}
            >
              <div className="flex flex-col items-center gap-1 border-b border-black/5 pb-3">
                <div className="p-2.5 bg-white/50 rounded-xl shadow-inner mb-1">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-black text-base">{sphere.name}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 content-start flex-1 bg-white/20 p-2 rounded-2xl min-h-[140px]">
                <AnimatePresence>
                  {placed.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group"
                    >
                      <div
                        draggable
                        onDragStart={(e: React.DragEvent) => {
                          e.dataTransfer.setData('item', JSON.stringify(item));
                          e.dataTransfer.setData('sourceSphere', key);
                        }}
                        className="bg-white/90 backdrop-blur-sm pl-2.5 pr-1.5 py-1.5 rounded-xl shadow-sm border border-black/5 text-[13px] font-bold flex items-center gap-1.5 group cursor-grab active:cursor-grabbing"
                      >
                        {item.name}
                        <button 
                          onClick={() => askFeedback(item, key as SphereType)}
                          className="p-1 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                          title="AI 선생님께 물어보기"
                        >
                          <Bot className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {placed.length === 0 && (
                  <div className="w-full flex items-center justify-center p-4 border-2 border-dashed border-black/5 rounded-xl">
                    <span className="text-[10px] text-black/20 font-bold">EMPTY</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Component Cards Pool */}
      <div className="bg-stone-50 p-8 rounded-[40px] border border-stone-200 min-h-[220px] shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 p-4 opacity-40">
          <ChevronRight className="w-12 h-12 text-stone-200 rotate-90" />
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center relative z-10">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="group"
              >
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('item', JSON.stringify(item));
                  }}
                  className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-stone-200 cursor-grab active:cursor-grabbing hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all min-w-[140px] text-center"
                >
                  <span className="font-black text-base text-stone-700">{item.name}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="font-bold text-stone-800">모든 요소를 완벽하게 분류했어요!</p>
                <p className="text-sm text-stone-500">새로운 요소를 더 추가해서 계속 학습해봐요.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* AI Feedback Popup */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-5 rounded-[28px] shadow-2xl z-50 border backdrop-blur-md max-w-md w-[calc(100%-2rem)] bg-white/90 border-blue-100"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-blue-500">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-widest mb-0.5 text-blue-600">
                AI 과학 선생님
              </span>
              <p className="text-stone-800 font-bold text-base leading-tight">{feedback.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

