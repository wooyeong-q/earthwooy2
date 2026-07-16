import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Classifier from './components/Classifier';
import Interaction from './components/Interaction';
import SettingsModal from './components/SettingsModal';
import { Globe2, Layers, Settings } from 'lucide-react';
import { EARTH_COMPONENTS } from './constants';
import { EarthComponent, SphereType } from './types';

type Tab = 'classifier' | 'interaction';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('classifier');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  return (
    <div className="h-[100dvh] min-h-[100dvh] flex flex-col bg-[#FDFDFC] text-stone-900 font-sans selection:bg-blue-100 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-100 blur-[80px] rounded-full" />
      </div>

      <header className="flex-shrink-0 z-30 bg-white/88 backdrop-blur-md border-b border-stone-100 px-2.5 sm:px-6 h-14 sm:h-[72px] flex flex-row justify-between items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Globe2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl font-black tracking-tight leading-none truncate">Earth System Study</h1>
            <p className="hidden sm:flex text-[11px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-1.5 items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              지구계 탐구 학습 프로그램
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {activeTab === 'interaction' && (
            <button
              type="button"
              onClick={() => setActiveTab('classifier')}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-black transition-all"
              aria-label="분류하기로 돌아가기"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">분류하기로 돌아가기</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs"
            title="API 설정"
            aria-label="API 설정"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">API 설정</span>
          </button>
          <div className="hidden xl:block px-3 py-1 bg-stone-100 text-stone-500 rounded-lg text-[10px] font-black tracking-widest uppercase">
            Science Room
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 overflow-hidden px-2 sm:px-4 py-2 sm:py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, type: 'spring', damping: 25 }}
            className="w-full h-full"
          >
            {activeTab === 'classifier' && (
              <Classifier
                items={items}
                setItems={setItems}
                placedItems={placedItems}
                setPlacedItems={setPlacedItems}
                onNext={() => setActiveTab('interaction')}
              />
            )}
            {activeTab === 'interaction' && <Interaction placedItems={placedItems} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <footer className="hidden lg:block flex-shrink-0 py-2 border-t border-stone-100 bg-white/50 px-6">
        <div className="max-w-[1700px] mx-auto flex justify-between items-center">
          <p className="text-[10px] text-stone-400 font-medium">© 2026 Earth System Explorer | Science Education Platform</p>
          <p className="text-[10px] text-stone-300 font-mono uppercase tracking-widest leading-none">Gemini 3 Flash</p>
        </div>
      </footer>
    </div>
  );
}
