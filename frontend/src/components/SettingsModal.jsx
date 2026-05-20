import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Volume2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, textSize, setTextSize, voiceEnabled, setVoiceEnabled }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white/90 backdrop-blur-xl w-full max-w-sm p-6 sm:p-8 rounded-3xl border border-white shadow-2xl relative z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Accessibility Settings</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Font Scaling Control */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <Type size={18} className="text-[#7B7AFA]" />
                <span>Text Size</span>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['normal', 'large', 'xlarge'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                      textSize === size 
                        ? 'bg-white shadow-sm text-[#7B7AFA]' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {size === 'xlarge' ? 'X-Large' : size}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Control */}
            <div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <Volume2 size={18} className="text-[#7B7AFA]" />
                <span>Text-to-Speech (Read Aloud)</span>
              </div>
              <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <span className="text-sm text-slate-600 font-medium">Enable AI Voice</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={voiceEnabled}
                    onChange={() => setVoiceEnabled(!voiceEnabled)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B7AFA]"></div>
                </div>
              </label>
              <p className="text-xs text-slate-400 mt-2 ml-1">Adds a speaker icon to AI messages to read them aloud.</p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}