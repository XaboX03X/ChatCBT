// src/components/ExerciseModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Eye, Activity } from 'lucide-react'; // Swapped Brain for Activity

import BoxBreathing from './exercises/BoxBreathing';
import Grounding54321 from './exercises/Grounding54321';
import ProgressiveMuscleRelaxation from './exercises/ProgressiveMuscleRelaxation'; // Imported new physical exercise

export default function ExerciseModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('breathing');

  const tabs = [
    { id: 'grounding', icon: <Eye />, title: "5-4-3-2-1 Grounding" },
    { id: 'breathing', icon: <Wind />, title: "Box Breathing" },
    { id: 'muscle', icon: <Activity />, title: "Muscle Relaxation" } // Replaced Thought Record
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* INCREASED SIZE: max-w-5xl and h-[80vh] for maximum immersion */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[80vh] overflow-hidden relative z-10 flex flex-col"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-slate-800">CBT Safety Toolkit</h2>
              <button onClick={onClose} className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-80 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-4 p-5 rounded-2xl transition-all text-left ${
                      activeTab === tab.id 
                      ? 'bg-white shadow-md text-[#7B7AFA] ring-1 ring-[#7B7AFA]/20 font-bold' 
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-700 font-medium'
                    }`}
                  >
                    {React.cloneElement(tab.icon, { size: 24, className: activeTab === tab.id ? "text-[#7B7AFA]" : "text-slate-400" })}
                    <span className="text-lg">{tab.title}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Content Area - Swapped to strictly overflow-hidden to protect layouts */}
              <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
                {activeTab === 'breathing' && <BoxBreathing />}
                {activeTab === 'grounding' && <Grounding54321 />}
                {activeTab === 'muscle' && <ProgressiveMuscleRelaxation />}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}