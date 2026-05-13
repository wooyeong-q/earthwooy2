import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Classifier from './components/Classifier';
import Interaction from './components/Interaction';
import AIChat from './components/AIChat';
import { Globe2, Layers, Zap, MessageSquare, BookOpen } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'classifier' | 'interaction' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('classifier');

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-stone-900 font-sans selection:bg-blue-100">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-emerald-100 blur-[80px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-bottom border-stone-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              Earth System Study
              <span className="text-[10px] bg-stone-100 text-stone-500 py-0.5 px-2 rounded-full font-mono font-bold tracking-widest">BETA</span>
            </h1>
            <p className="text-xs text-stone-400 font-medium font-mono uppercase tracking-wider">지구계 탐구 학습 프로그램</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex p-1 bg-stone-100 rounded-2xl shadow-inner border border-stone-200/50">
          {[
            { id: 'classifier' as Tab, label: '구성 요소 분류', icon: Layers },
            { id: 'interaction' as Tab, label: '상호작용 탐구 (AI 피드백)', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all",
                activeTab === tab.id ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-stone-200"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-10 px-6 max-w-[1700px] mx-auto min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {activeTab === 'classifier' && <Classifier />}
            {activeTab === 'interaction' && <Interaction />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-40">
              <BookOpen className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Science Guide</p>
            </div>
            <p className="text-sm text-stone-400 max-w-md">
              지구계는 기권, 지권, 수권, 생물권, 외권의 5가지 권역으로 이루어져 있으며, 
              각 권역은 서로 끊임없이 영향을 주고받으며 순환합니다.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-[10px] text-stone-300 font-mono uppercase tracking-[0.2em]">Crafted with Google AI</p>
            <p className="text-xs text-stone-400 font-medium">© 2026 Earth System Explorer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
