import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, HelpCircle, Save, Check, AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('USER_GEMINI_API_KEY') || '';
    setApiKey(savedKey);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('USER_GEMINI_API_KEY', apiKey.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('USER_GEMINI_API_KEY');
    setApiKey('');
    setTestStatus('idle');
    setTestMessage('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('먼저 API Key를 입력해 주세요.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('연결 테스트 중...');

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'Hello, respond with a single word "OK"' }] }],
      });

      if (response.text) {
        setTestStatus('success');
        setTestMessage('연결에 성공했습니다! AI 기능이 정상 작동합니다. 👍');
      } else {
        throw new Error('응답이 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setTestMessage(err.message || 'API 키가 올바르지 않거나 네트워크 오류가 발생했습니다. 키를 다시 확인해 주세요.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-stone-100 flex flex-col"
          >
            {/* Header */}
            <div className="bg-stone-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg">환경 설정 & API Key</h3>
                  <p className="text-xs text-stone-400">외부 내보내기용 Gemini API 설정</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Informational Help */}
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-2">
                <h4 className="font-black text-xs text-blue-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  외부로 내보냈을 때 AI가 안 되는 이유
                </h4>
                <p className="text-[11px] text-blue-900/80 leading-relaxed font-bold">
                  AI Studio에서 만든 앱을 외부(GitHub Pages, 개인 컴퓨터 등)로 내보내면, 보안상 서버에 저장되어 있던 <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">GEMINI_API_KEY</code>가 전달되지 않으므로 AI 기능이 동작하지 않게 됩니다.
                </p>
                <div className="text-[10px] text-blue-800/70 font-semibold pt-1 border-t border-blue-200/50 space-y-1">
                  <p>💡 <strong>해결 방법:</strong></p>
                  <p className="pl-2">1. 여기에 본인의 개인 Gemini API Key를 입력하여 브라우저에 안전하게 저장합니다. (가장 간편한 방법)</p>
                  <p className="pl-2">2. 혹은 배포 서버 환경 변수에 <code className="bg-blue-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code>를 추가합니다.</p>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <label className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  Gemini API Key 입력
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setIsSaved(false);
                    }}
                    placeholder="AI_STUDY_GEMINI_API_KEY..."
                    className="flex-1 px-4 py-3 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-mono"
                  />
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-3 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-black transition-all active:scale-95"
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    {isSaved ? '저장됨' : '저장'}
                  </button>
                </div>
                {apiKey && (
                  <button
                    onClick={handleClear}
                    className="text-[10px] text-stone-400 hover:text-red-500 font-bold underline transition-colors block ml-auto"
                  >
                    API 키 삭제하기
                  </button>
                )}
              </div>

              {/* Test Connection */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-600">입력한 API 키 연결 테스트</span>
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !apiKey.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 disabled:opacity-50 text-stone-700 rounded-lg text-[10px] font-black transition-all active:scale-95"
                  >
                    <RefreshCw className={`w-3 h-3 ${testStatus === 'testing' && 'animate-spin'}`} />
                    테스트 시작
                  </button>
                </div>

                {testStatus !== 'idle' && (
                  <div className={`p-3 rounded-xl border text-[11px] font-bold leading-relaxed flex items-start gap-2 ${
                    testStatus === 'success' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                      : testStatus === 'error' 
                      ? 'bg-red-50 border-red-100 text-red-800' 
                      : 'bg-stone-100 border-stone-200 text-stone-600 animate-pulse'
                  }`}>
                    {testStatus === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
                    {testStatus === 'success' && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-black transition-all active:scale-95"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
