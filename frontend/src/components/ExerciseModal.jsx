import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Eye, Activity } from 'lucide-react'; 

import BoxBreathing from './exercises/BoxBreathing';
import Grounding54321 from './exercises/Grounding54321';
import ProgressiveMuscleRelaxation from './exercises/ProgressiveMuscleRelaxation'; 

export default function ExerciseModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('breathing');

  const tabs = [
    { id: 'grounding', icon: <Eye />, title: "5-4-3-2-1 Grounding" },
    { id: 'breathing', icon: <Wind />, title: "4-7-8 Breathing" },
    { id: 'muscle', icon: <Activity />, title: "Muscle Relaxation" } 
  ];

  const microBenefits = {
    grounding: "Helps you stop overthinking by focusing on what's around you.",
    breathing: "Naturally slows down your heartbeat to help you feel calm.",
    muscle: "Relaxes tight muscles so your body knows it is safe."
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            /* FIX 1: Changed h-[85vh] lg:h-[80vh] to h-[90vh] lg:h-[85vh]. 
               This gives the modal the exact amount of extra vertical room needed 
               to fit the new micro-benefit text without crushing the exercises.
            */
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] lg:h-[85vh] overflow-hidden relative z-10 flex flex-col"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-4 sm:p-5 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">CBT Safety Toolkit</h2>
                <p className="text-xs sm:text-sm text-[#7B7AFA] font-medium mt-1">
                  {microBenefits[activeTab]}
                </p>
              </div>
              <button onClick={onClose} className="p-2 sm:p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors cursor-pointer shrink-0 mt-1 sm:mt-0">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Layout Container */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* Sidebar */}
              <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-3 sm:p-6 flex flex-row md:flex-col gap-2 md:gap-3 overflow-x-auto shrink-0 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center md:justify-start gap-2 sm:gap-4 p-3 md:p-5 rounded-xl md:rounded-2xl transition-all whitespace-nowrap text-left ${
                      activeTab === tab.id 
                      ? 'bg-white shadow-md text-[#7B7AFA] ring-1 ring-[#7B7AFA]/20 font-bold' 
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-700 font-medium'
                    }`}
                  >
                    {React.cloneElement(tab.icon, { className: `w-4 h-4 sm:w-6 sm:h-6 ${activeTab === tab.id ? "text-[#7B7AFA]" : "text-slate-400"}` })}
                    <span className="text-xs sm:text-base md:text-lg">{tab.title}</span>
                  </button>
                ))}
              </div>

              {/* FIX 2: Completely removed my toxic padding and wrappers. 
                  This is restored exactly to your original, clean code so your 
                  components have their full space back and the buttons won't clip.
              */}
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