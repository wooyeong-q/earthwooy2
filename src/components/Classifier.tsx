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

interface ClassifierProps {
  items: EarthComponent[];
  setItems: React.Dispatch<React.SetStateAction<EarthComponent[]>>;
  placedItems: Record<SphereType, EarthComponent[]>;
  setPlacedItems: React.Dispatch<React.SetStateAction<Record<SphereType, EarthComponent[]>>>;
  onNext: () => void;
}

export default function Classifier({ items, setItems, placedItems, setPlacedItems, onNext }: ClassifierProps) {
  const [feedback, setFeedback] = useState<{ text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');

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
      category: 'geosphere', 
      description: '학습자가 직접 추가한 요소'
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemName('');
  };

  return (
    <div className="flex flex-col gap-4 py-2 h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-stone-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 rounded-xl">
            <Globe2 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-base font-black">지구계 구성 요소 분류하기</h2>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-5 gap-3 min-h-0 flex-1 overflow-hidden">
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
                "flex flex-col p-2 rounded-2xl border-2 border-dashed transition-all gap-2 min-h-0",
                sphere.color,
              )}
            >
              <div className="flex flex-col items-center gap-1 border-b border-black/5 pb-2 flex-shrink-0">
                <div className="p-1 bg-white/50 rounded-lg shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-black text-xs leading-tight text-center">{sphere.name}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 content-start flex-1 bg-white/20 p-2.5 rounded-2xl overflow-y-auto custom-scrollbar">
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
                        className="bg-white/90 backdrop-blur-sm pl-3 pr-2.5 py-2.5 rounded-2xl shadow-sm border border-black/5 text-sm font-black flex items-center gap-2 group cursor-grab active:cursor-grabbing leading-none"
                      >
                        {item.name}
                        <button 
                          onClick={() => askFeedback(item, key as SphereType)}
                          className="p-1 px-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center translate-x-0.5"
                        >
                          <Bot className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Component Cards Pool & Footer Actions */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <div className="bg-stone-50 p-4 rounded-[32px] border border-stone-200 min-h-[100px] shadow-inner relative overflow-y-auto custom-scrollbar">
          <div className="flex flex-wrap gap-2.5 justify-center relative z-10">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('item', JSON.stringify(item));
                    }}
                    className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-stone-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-400 transition-all min-w-[100px] text-center"
                  >
                    <span className="font-black text-sm text-stone-700 leading-none">{item.name}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {items.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 py-2"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <p className="font-black text-stone-800 text-sm">모든 요소를 분류했어요! 상호작용을 탐구해 볼까요?</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Global Control Footer */}
        <div className="flex flex-row items-center gap-4 bg-white p-4 rounded-[28px] border border-stone-100 shadow-lg">
          <div className="flex-1 bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
            <form onSubmit={addNewItem} className="flex gap-2">
              <input 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="지구계의 새로운 요소를 제안해 보세요 (예: 미세먼지, 드론, 인공위성...)"
                className="flex-1 px-5 py-3 rounded-xl bg-white border border-stone-200 focus:outline-none text-sm font-bold"
              />
              <button 
                type="submit"
                className="px-8 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 font-black text-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                요소 추가하기
              </button>
            </form>
          </div>
          
          <button 
            onClick={onNext}
            className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] text-base font-black shadow-lg shadow-blue-200 transition-all group active:scale-95"
          >
            상호작용 탐구하러 가기
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
          </button>
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

