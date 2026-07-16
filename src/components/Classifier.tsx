import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SPHERES } from '../constants';
import { EarthComponent, SphereType } from '../types';
import { getAIFeedback, getGlobalEvaluation } from '../services/geminiService';
import {
  Cloud,
  Mountain,
  Droplets,
  Leaf,
  Moon,
  CheckCircle2,
  Plus,
  ChevronRight,
  Globe2,
  Bot,
  Sparkles,
  X,
  Hand,
} from 'lucide-react';
import { cn } from '../lib/utils';

const ICON_MAP = { Cloud, Mountain, Droplets, Leaf, Moon };

type SelectedCard = {
  item: EarthComponent;
  sourceSphere?: SphereType;
} | null;

interface ClassifierProps {
  items: EarthComponent[];
  setItems: React.Dispatch<React.SetStateAction<EarthComponent[]>>;
  placedItems: Record<SphereType, EarthComponent[]>;
  setPlacedItems: React.Dispatch<React.SetStateAction<Record<SphereType, EarthComponent[]>>>;
  onNext: () => void;
}

// MOBILE_CLASSIFIER_ORDER_V1
export default function Classifier({
  items,
  setItems,
  placedItems,
  setPlacedItems,
  onNext,
}: ClassifierProps) {
  const [feedback, setFeedback] = useState<{ text: string } | null>(null);
  const [globalFeedback, setGlobalFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCard, setSelectedCard] = useState<SelectedCard>(null);

  const handleDrop = (
    item: EarthComponent,
    targetSphere: SphereType,
    sourceSphere?: SphereType,
  ) => {
    if (isLoading) return;

    if (sourceSphere === targetSphere) {
      setSelectedCard(null);
      return;
    }

    if (sourceSphere) {
      setPlacedItems((previous) => ({
        ...previous,
        [sourceSphere]: previous[sourceSphere].filter((candidate) => candidate.id !== item.id),
      }));
    } else {
      setItems((previous) => previous.filter((candidate) => candidate.id !== item.id));
    }

    setPlacedItems((previous) => ({
      ...previous,
      [targetSphere]: previous[targetSphere].some((candidate) => candidate.id === item.id)
        ? previous[targetSphere]
        : [...previous[targetSphere], item],
    }));
    setSelectedCard(null);
  };

  const selectCard = (item: EarthComponent, sourceSphere?: SphereType) => {
    setSelectedCard((current) =>
      current?.item.id === item.id ? null : { item, sourceSphere },
    );
  };

  const assignSelected = (targetSphere: SphereType) => {
    if (!selectedCard) return;
    handleDrop(selectedCard.item, targetSphere, selectedCard.sourceSphere);
  };

  const askFeedback = async (item: EarthComponent, sphereType: SphereType) => {
    if (isLoading) return;
    setIsLoading(true);
    const aiMessage = await getAIFeedback(item.name, SPHERES[sphereType].name);
    setFeedback({ text: aiMessage });
    setIsLoading(false);
    window.setTimeout(() => setFeedback(null), 4500);
  };

  const evaluateAll = async () => {
    const totalPlacedCount = Object.values(placedItems).reduce(
      (sum, list) => sum + list.length,
      0,
    );
    if (totalPlacedCount === 0) return;

    setIsGlobalLoading(true);
    const result = await getGlobalEvaluation(placedItems);
    setGlobalFeedback(result);
    setIsGlobalLoading(false);
  };

  const addNewItem = (event: React.FormEvent) => {
    event.preventDefault();
    const name = newItemName.trim();
    if (!name) return;

    const newItem: EarthComponent = {
      id: Date.now().toString(),
      name,
      category: 'geosphere',
      description: '학습자가 직접 추가한 요소',
    };

    setItems((previous) => [newItem, ...previous]);
    setNewItemName('');
  };

  const placedCount = Object.values(placedItems).reduce(
    (sum, list) => sum + list.length,
    0,
  );

  return (
    <div className="flex flex-col gap-2.5 sm:gap-4 h-full min-h-0 overflow-y-auto lg:overflow-hidden py-1 sm:py-2 pb-[calc(10px+env(safe-area-inset-bottom))]">
      <div className="bg-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-sm border border-stone-100 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-blue-100 rounded-xl shrink-0">
              <Globe2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black truncate">지구계 구성 요소 분류하기</h2>
              <p className="hidden sm:block lg:hidden text-[11px] text-stone-500 mt-0.5">카드를 고른 뒤 알맞은 권역을 누르세요.</p>
              <p className="hidden lg:block text-[11px] text-stone-500 mt-0.5">카드를 드래그하거나 선택한 뒤 권역을 눌러도 됩니다.</p>
            </div>
          </div>
          <div className="shrink-0 px-2.5 py-1.5 rounded-xl bg-stone-100 text-[10px] sm:text-xs font-black text-stone-600">
            {placedCount} / {placedCount + items.length}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="lg:hidden flex-shrink-0 bg-stone-900 text-white rounded-2xl px-3 py-2.5 flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Hand className="w-5 h-5 text-blue-300 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[9px] font-black uppercase tracking-widest text-blue-300">선택한 요소</span>
                <strong className="block text-sm truncate">{selectedCard.item.name}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="w-8 h-8 rounded-xl bg-white/10 grid place-items-center shrink-0"
              aria-label="선택 해제"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="order-3 lg:order-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 flex-none lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        {Object.entries(SPHERES).map(([key, sphere]) => {
          const sphereType = key as SphereType;
          const Icon = ICON_MAP[sphere.icon as keyof typeof ICON_MAP];
          const placed = placedItems[sphereType];

          return (
            <section
              key={key}
              onClick={() => assignSelected(sphereType)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const itemData = event.dataTransfer.getData('item');
                const sourceSphere = event.dataTransfer.getData('sourceSphere') as SphereType | undefined;
                if (itemData) handleDrop(JSON.parse(itemData), sphereType, sourceSphere);
              }}
              className={cn(
                'flex flex-col p-2.5 rounded-2xl border-2 border-dashed transition-all gap-2 min-h-[150px] lg:min-h-0 cursor-pointer',
                sphere.color,
                selectedCard && 'ring-2 ring-offset-1 ring-blue-300 active:scale-[.99]',
              )}
              aria-label={selectedCard ? `${selectedCard.item.name}을 ${sphere.name}으로 분류` : sphere.name}
            >
              <div className="flex flex-row lg:flex-col items-center gap-2 lg:gap-1 border-b border-black/5 pb-2 flex-shrink-0">
                <div className="p-1.5 lg:p-1 bg-white/60 rounded-lg shadow-inner shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 lg:text-center">
                  <span className="block font-black text-sm lg:text-xs leading-tight">{sphere.name}</span>
                  <span className="block lg:hidden text-[10px] opacity-65 truncate">{sphere.description}</span>
                </div>
                <span className="lg:hidden w-7 h-7 rounded-full bg-white/70 grid place-items-center text-[10px] font-black shrink-0">{placed.length}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 lg:gap-2 content-start flex-1 min-h-[78px] bg-white/25 p-2 rounded-2xl overflow-visible lg:overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {placed.map((item) => {
                    const selected = selectedCard?.item.id === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(event) => event.stopPropagation()}
                        className="group max-w-full"
                      >
                        <div
                          draggable
                          onDragStart={(event: React.DragEvent) => {
                            event.dataTransfer.setData('item', JSON.stringify(item));
                            event.dataTransfer.setData('sourceSphere', key);
                          }}
                          onClick={() => selectCard(item, sphereType)}
                          className={cn(
                            'bg-white/95 pl-2.5 pr-1.5 py-2 rounded-xl shadow-sm border text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-grab active:cursor-grabbing leading-none max-w-full',
                            selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-black/5',
                          )}
                        >
                          <span className="truncate max-w-[9rem] lg:max-w-[7rem]">{item.name}</span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              askFeedback(item, sphereType);
                            }}
                            className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors shrink-0"
                            aria-label={`${item.name} AI 피드백`}
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {placed.length === 0 && (
                  <div className="m-auto text-center px-2">
                    <span className="text-[10px] font-bold opacity-45">{selectedCard ? '여기를 눌러 분류' : '카드를 옮겨 놓으세요'}</span>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="contents lg:flex lg:flex-col lg:gap-4 lg:flex-shrink-0">
        <section
          className="order-2 lg:order-none shrink-0 bg-stone-50 p-2.5 sm:p-4 rounded-2xl sm:rounded-[32px] border border-stone-200 min-h-[176px] max-h-[248px] lg:min-h-[100px] lg:max-h-[145px] shadow-inner overflow-y-auto custom-scrollbar"
          aria-labelledby="unplaced-cards-title"
        >
          <div className="lg:hidden flex items-center justify-between gap-3 px-1 mb-2.5">
            <h3 id="unplaced-cards-title" className="text-xs font-black text-stone-700">
              분류할 카드
            </h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {items.length}개 남음
            </span>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:justify-center relative z-10">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const selected = selectedCard?.item.id === item.id;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="min-w-0"
                  >
                    <div
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData('item', JSON.stringify(item))}
                      onClick={() => selectCard(item)}
                      className={cn(
                        'w-full sm:w-auto bg-white px-2 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm border cursor-grab active:cursor-grabbing transition-all min-w-0 sm:min-w-[100px] text-center',
                        selected ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' : 'border-stone-200 hover:border-blue-400',
                      )}
                    >
                      <span className="block font-black text-xs sm:text-sm text-stone-700 leading-tight break-keep">{item.name}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {items.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-3 flex items-center justify-center gap-3 py-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <p className="font-black text-stone-800 text-sm">모든 요소를 분류했어요!</p>
              </motion.div>
            )}
          </div>
        </section>

        <div className="order-4 lg:order-none flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5 sm:gap-4 bg-white p-2.5 sm:p-4 rounded-2xl sm:rounded-[28px] border border-stone-100 shadow-lg">
          <form onSubmit={addNewItem} className="flex-1 min-w-0 flex gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
            <input
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="새 지구계 요소 입력"
              className="min-w-0 flex-1 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white border border-stone-200 focus:outline-none text-base sm:text-sm font-bold"
            />
            <button
              type="submit"
              className="px-3 sm:px-6 py-2.5 sm:py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 font-black text-xs sm:text-sm transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">요소 추가</span>
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            <button
              type="button"
              onClick={evaluateAll}
              disabled={isGlobalLoading || placedCount === 0}
              className={cn(
                'flex items-center justify-center gap-1.5 px-3 sm:px-5 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95',
                isGlobalLoading
                  ? 'bg-amber-100 text-amber-600 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200',
              )}
            >
              <Sparkles className={cn('w-4 h-4 sm:w-5 sm:h-5', isGlobalLoading && 'animate-spin')} />
              {isGlobalLoading ? '점검 중' : '전체 점검'}
            </button>

            <button
              type="button"
              onClick={onNext}
              className="flex items-center justify-center gap-1.5 px-3 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              상호작용 탐구
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[calc(14px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl sm:rounded-[28px] shadow-2xl z-50 border backdrop-blur-md max-w-md w-[calc(100%_-_1.5rem)] bg-white/95 border-blue-100"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-blue-500">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-0.5 text-blue-600">AI 과학 선생님</span>
              <p className="text-stone-800 font-bold text-sm sm:text-base leading-snug">{feedback.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {globalFeedback && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGlobalFeedback(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative bg-white w-full max-w-lg max-h-[calc(100dvh_-_1.25rem)] rounded-3xl sm:rounded-[40px] shadow-2xl overflow-y-auto border border-amber-100"
            >
              <div className="bg-amber-500 p-5 sm:p-8 text-white relative overflow-hidden">
                <Sparkles className="absolute -top-4 -right-4 w-28 sm:w-32 h-28 sm:h-32 opacity-20 rotate-12" />
                <div className="relative z-10 flex items-center gap-3 sm:gap-4 pr-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-md shrink-0">
                    <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black">지구쌤의 점검 결과</h3>
                    <p className="text-amber-100 font-bold text-xs sm:text-sm">고칠 부분이 있는지 확인해 보세요.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setGlobalFeedback(null)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full" aria-label="결과 닫기">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-8">
                <div className="bg-stone-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-100 min-h-[100px]">
                  <p className="text-stone-800 font-bold text-base sm:text-lg leading-relaxed whitespace-pre-wrap">{globalFeedback}</p>
                </div>
                <button type="button" onClick={() => setGlobalFeedback(null)} className="w-full mt-4 sm:mt-6 py-3.5 sm:py-4 bg-stone-900 text-white rounded-2xl font-black hover:bg-stone-800 shadow-lg shadow-stone-200">
                  확인했어요!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
