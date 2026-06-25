import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Classifier from './components/Classifier';
import Interaction from './components/Interaction';
import SettingsModal from './components/SettingsModal';
import { Globe2, Layers, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import { EARTH_COMPONENTS } from './constants';
import { EarthComponent, SphereType } from './types';

type Tab = 'classifier' | 'interaction';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('classifier');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Lifted State for persistence
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
    <div className="h-screen flex flex-col bg-[#FDFDFC] text-stone-900 font-sans selection:bg-blue-100 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-100 blur-[80px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex-shrink-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4 flex flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">
              Earth System Study
            </h1>
            <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              지구계 탐구 학습 프로그램
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'interaction' && (
            <button 
              onClick={() => setActiveTab('classifier')}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-black transition-all"
            >
              <Layers className="w-4 h-4" />
              분류하기로 돌아가기
            </button>
          )}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-all relative group flex items-center gap-1.5 font-bold text-xs"
            title="API 설정"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">API 설정</span>
          </button>
          <div className="hidden sm:block px-3 py-1 bg-stone-100 text-stone-500 rounded-lg text-[10px] font-black tracking-widest uppercase">
            Science Room
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-hidden px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, type: "spring", damping: 25 }}
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

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Footer (Simplified) */}
      <footer className="flex-shrink-0 py-2 border-t border-stone-100 bg-white/50 px-6">
        <div className="max-w-[1700px] mx-auto flex justify-between items-center">
          <p className="text-[10px] text-stone-400 font-medium">© 2026 Earth System Explorer | Science Education Platform</p>
          <p className="text-[10px] text-stone-300 font-mono uppercase tracking-widest leading-none">Gemini 3 Flash</p>
        </div>
      </footer>
    </div>
  );
}
