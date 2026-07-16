import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INTERACTIONS, SPHERES } from '../constants';
import { SphereType, EarthComponent } from '../types';
import {
  Cloud,
  Mountain,
  Droplets,
  Leaf,
  Moon,
  ArrowRight,
  Zap,
  RefreshCw,
  MessageCircle,
  X,
  Hand,
} from 'lucide-react';
import { cn } from '../lib/utils';
import AIChat from './AIChat';

const ICON_MAP = { Cloud, Mountain, Droplets, Leaf, Moon };

interface InteractionProps {
  placedItems: Record<SphereType, EarthComponent[]>;
}

export default function Interaction({ placedItems }: InteractionProps) {
  const [selectedFrom, setSelectedFrom] = useState<SphereType | null>(null);
  const [selectedTo, setSelectedTo] = useState<SphereType | null>(null);
  const [slot1Item, setSlot1Item] = useState<EarthComponent | null>(null);
  const [slot2Item, setSlot2Item] = useState<EarthComponent | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const foundInteraction = INTERACTIONS.find(
    (interaction) =>
      (interaction.from === selectedFrom && interaction.to === selectedTo) ||
      (interaction.from === selectedTo && interaction.to === selectedFrom),
  );

  const setSlot = (sphereType: SphereType, slot: 1 | 2, item: EarthComponent | null = null) => {
    if (slot === 1) {
      setSelectedFrom(sphereType);
      setSlot1Item(item);
    } else {
      setSelectedTo(sphereType);
      setSlot2Item(item);
    }
  };

  const handleDrop = (event: React.DragEvent, slot: 1 | 2) => {
    event.preventDefault();
    const itemData = event.dataTransfer.getData('item');
    const sphereData = event.dataTransfer.getData('sphereType');

    if (itemData) {
      const item = JSON.parse(itemData) as EarthComponent;
      setSlot(item.category, slot, item);
    } else if (sphereData) {
      setSlot(sphereData as SphereType, slot);
    }
  };

  const handleSphereTap = (sphereType: SphereType) => {
    if (selectedFrom === sphereType) {
      setSelectedFrom(null);
      setSlot1Item(null);
      return;
    }
    if (selectedTo === sphereType) {
      setSelectedTo(null);
      setSlot2Item(null);
      return;
    }
    if (!selectedFrom) {
      setSlot(sphereType, 1);
      return;
    }
    if (!selectedTo) {
      setSlot(sphereType, 2);
      return;
    }

    setSelectedFrom(selectedTo);
    setSlot1Item(slot2Item);
    setSelectedTo(sphereType);
    setSlot2Item(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-4 h-full min-h-0 overflow-hidden py-1 sm:py-2">
      <section className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-5 bg-white p-3 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[32px] lg:rounded-[40px] border border-stone-100 shadow-sm overflow-y-auto lg:overflow-hidden overscroll-contain pb-[calc(80px+env(safe-area-inset-bottom))] lg:pb-6">
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-3 flex-shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-[spin_4s_linear_infinite] shrink-0" />
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">지구계 상호작용 실험실</h2>
            </div>
            <p className="text-stone-500 font-bold text-xs sm:text-sm">
              <span className="lg:hidden">권역을 차례로 눌러 A와 B를 선택하세요.</span>
              <span className="hidden lg:inline">권역 아이콘을 중앙으로 드래그하거나 차례로 눌러 선택하세요.</span>
            </p>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-stone-50 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-stone-100 shadow-inner w-full xl:w-auto">
            {Object.keys(SPHERES).map((key) => {
              const sphereType = key as SphereType;
              const Icon = ICON_MAP[SPHERES[sphereType].icon as keyof typeof ICON_MAP];
              const selected = selectedFrom === sphereType || selectedTo === sphereType;
              const order = selectedFrom === sphereType ? 1 : selectedTo === sphereType ? 2 : null;
              return (
                <motion.button
                  type="button"
                  key={key}
                  draggable
                  onDragStart={(event: any) => event.dataTransfer.setData('sphereType', key)}
                  onClick={() => handleSphereTap(sphereType)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    'min-w-0 h-16 sm:h-20 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all shadow-sm border group relative px-1',
                    SPHERES[sphereType].color.split(' ')[0],
                    selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-stone-200',
                  )}
                  aria-label={`${SPHERES[sphereType].name} 선택`}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-stone-700" />
                  <span className="mt-1 text-[8px] sm:text-[9px] font-black text-stone-600 truncate w-full text-center">{SPHERES[sphereType].name}</span>
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-white/80 text-[7px] font-black grid place-items-center text-stone-600">
                    {placedItems[sphereType].length}
                  </span>
                  {order && (
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-black grid place-items-center shadow">{order}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="lg:hidden rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2.5 flex items-center gap-2.5 flex-shrink-0">
          <Hand className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-xs font-bold text-blue-900">첫 번째 권역은 A, 두 번째 권역은 B에 들어갑니다. 다시 누르면 선택이 해제돼요.</p>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-5 py-2 sm:py-4 bg-stone-50/60 rounded-2xl sm:rounded-[32px] border-2 border-dashed border-stone-200 flex-shrink-0 min-h-[170px] sm:min-h-[220px]">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, 1)}
            className={cn(
              'w-[38vw] h-[38vw] min-w-[126px] min-h-[126px] max-w-48 max-h-48 rounded-2xl sm:rounded-[32px] border-4 flex flex-col items-center justify-center transition-all relative group',
              selectedFrom
                ? 'bg-white border-stone-900 shadow-xl'
                : 'bg-white/40 border-stone-200 border-dashed hover:border-blue-400 hover:bg-white',
            )}
          >
            {selectedFrom ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3 px-2">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-stone-900 rounded-2xl sm:rounded-[28px] flex items-center justify-center shadow-lg">
                  {(() => {
                    const Icon = ICON_MAP[SPHERES[selectedFrom].icon as keyof typeof ICON_MAP];
                    return <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />;
                  })()}
                </div>
                <div className="text-center min-w-0">
                  <p className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-widest leading-none mb-1">A · {SPHERES[selectedFrom].name}</p>
                  <p className="text-sm sm:text-xl font-black truncate max-w-[8rem] sm:max-w-[10rem]">{slot1Item?.name || SPHERES[selectedFrom].name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFrom(null);
                    setSlot1Item(null);
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-stone-900 text-white rounded-full grid place-items-center shadow"
                  aria-label="권역 A 선택 해제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 sm:gap-3 opacity-35">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-stone-100/50 rounded-2xl grid place-items-center border-2 border-stone-200">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-stone-300" />
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">권역 A</span>
              </div>
            )}
          </div>

          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-900 rounded-full grid place-items-center text-white shadow-lg shrink-0">
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, 2)}
            className={cn(
              'w-[38vw] h-[38vw] min-w-[126px] min-h-[126px] max-w-48 max-h-48 rounded-2xl sm:rounded-[32px] border-4 flex flex-col items-center justify-center transition-all relative group',
              selectedTo
                ? 'bg-white border-stone-900 shadow-xl'
                : 'bg-white/40 border-stone-200 border-dashed hover:border-blue-400 hover:bg-white',
            )}
          >
            {selectedTo ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3 px-2">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-stone-900 rounded-2xl sm:rounded-[28px] flex items-center justify-center shadow-lg">
                  {(() => {
                    const Icon = ICON_MAP[SPHERES[selectedTo].icon as keyof typeof ICON_MAP];
                    return <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />;
                  })()}
                </div>
                <div className="text-center min-w-0">
                  <p className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-widest leading-none mb-1">B · {SPHERES[selectedTo].name}</p>
                  <p className="text-sm sm:text-xl font-black truncate max-w-[8rem] sm:max-w-[10rem]">{slot2Item?.name || SPHERES[selectedTo].name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTo(null);
                    setSlot2Item(null);
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-stone-900 text-white rounded-full grid place-items-center shadow"
                  aria-label="권역 B 선택 해제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 sm:gap-3 opacity-35">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-stone-100/50 rounded-2xl grid place-items-center border-2 border-stone-200">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-stone-300" />
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">권역 B</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-[150px] lg:min-h-0 overflow-visible lg:overflow-y-auto px-0 sm:px-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {foundInteraction ? (
              <motion.div
                key={foundInteraction.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-[32px] shadow-xl relative overflow-hidden text-center"
              >
                <Zap className="absolute -top-4 -right-4 w-24 h-24 text-blue-500/10 rotate-12" />
                <div className="relative z-10 space-y-2 sm:space-y-3">
                  <h4 className="text-lg sm:text-xl font-black text-blue-400">{foundInteraction.title}</h4>
                  <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-lg mx-auto">{foundInteraction.description}</p>
                </div>
              </motion.div>
            ) : selectedFrom && selectedTo ? (
              <motion.div
                key="ai-suggestion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50 p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border-2 border-dashed border-blue-200 text-center space-y-3 sm:space-y-4"
              >
                <p className="text-blue-900 font-bold text-sm">등록된 예시가 없는 조합이에요. AI 선생님에게 새로운 사례를 질문해 보세요.</p>
                <button
                  type="button"
                  onClick={() => setMobileChatOpen(true)}
                  className="lg:hidden px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-black shadow-lg shadow-blue-200"
                >
                  AI 선생님 열기
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[130px] grid place-items-center text-center text-stone-300">
                <div>
                  <Zap className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm font-black text-stone-400">두 권역을 선택하면 상호작용이 나타납니다.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <aside className="hidden lg:flex w-[360px] xl:w-[400px] flex-shrink-0 flex-col h-full bg-blue-50/50 rounded-[40px] border border-blue-100 overflow-hidden">
        <AIChat />
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileChatOpen(true)}
          className="fixed right-3 bottom-[calc(14px+env(safe-area-inset-bottom))] z-40 h-12 px-4 rounded-full bg-[#FAE100] text-stone-900 shadow-xl flex items-center gap-2 font-black text-sm border border-black/5"
        >
          <MessageCircle className="w-5 h-5" /> AI 선생님
        </button>

        <AnimatePresence>
          {mobileChatOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-stone-950/55 backdrop-blur-sm flex items-end"
              onClick={() => setMobileChatOpen(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full h-[min(78dvh,680px)] rounded-t-3xl overflow-hidden bg-white shadow-2xl pb-[env(safe-area-inset-bottom)]"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setMobileChatOpen(false)}
                  className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full bg-white/90 shadow grid place-items-center text-stone-700"
                  aria-label="AI 채팅 닫기"
                >
                  <X className="w-4 h-4" />
                </button>
                <AIChat />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
