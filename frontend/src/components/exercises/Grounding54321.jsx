import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Hand, Ear, Wind, Coffee, Check, Loader2 } from 'lucide-react';

// 1. ADDED ANIMATION PROPERTIES FOR EACH SENSE
const GROUNDING_STAGES = [
  { 
    count: 5, sense: "see", icon: Eye, color: "text-emerald-500", bg: "bg-emerald-100", ring: "focus:ring-emerald-500 border-emerald-200", prompt: "Acknowledge things you can see around you.",
    animation: { x: [-8, 8, -8], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } } // Lively eyes looking left and right
  },
  { 
    count: 4, sense: "physically feel", icon: Hand, color: "text-amber-500", bg: "bg-amber-100", ring: "focus:ring-amber-500 border-amber-200", prompt: "Acknowledge things you can physically touch or feel.",
    animation: { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } } // Pulsing/tapping touch
  },
  { 
    count: 3, sense: "hear", icon: Ear, color: "text-sky-500", bg: "bg-sky-100", ring: "focus:ring-sky-500 border-sky-200", prompt: "Acknowledge things you can hear right now.",
    animation: { rotate: [-15, 15, -15], transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } } // Wiggling/listening ear
  },
  { 
    count: 2, sense: "smell", icon: Wind, color: "text-purple-500", bg: "bg-purple-100", ring: "focus:ring-purple-500 border-purple-200", prompt: "Acknowledge things you can smell.",
    animation: { y: [-5, 5, -5], opacity: [0.6, 1, 0.6], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } } // Floating scent wave
  },
  { 
    count: 1, sense: "taste", icon: Coffee, color: "text-rose-500", bg: "bg-rose-100", ring: "focus:ring-rose-500 border-rose-200", prompt: "Acknowledge one thing you can taste.",
    animation: { rotate: [-8, 8, -8], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } } // Gently rocking cup
  }
];

export default function Grounding54321() {
  const [stageIndex, setStageIndex] = useState(0); 
  const [answers, setAnswers] = useState([]); 
  const [currentInput, setCurrentInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const inputRef = useRef(null);
  const currentStage = GROUNDING_STAGES[stageIndex];

  // Auto-focus the input box
  useEffect(() => {
    if (!isCompleted && !isTransitioning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [stageIndex, isCompleted, isTransitioning, answers.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentInput.trim() !== '' && !isTransitioning) {
      e.preventDefault();
      
      const newAnswers = [...answers, currentInput.trim()];
      setAnswers(newAnswers);
      setCurrentInput('');

      // Auto-advance logic
      if (newAnswers.length === currentStage.count) {
        setIsTransitioning(true);
        if (stageIndex === GROUNDING_STAGES.length - 1) {
          setTimeout(() => setIsCompleted(true), 1200); 
        } else {
          setTimeout(() => {
            setAnswers([]);
            setStageIndex((prev) => prev + 1);
            setIsTransitioning(false);
          }, 1200);
        }
      }
    }
  };

  if (isCompleted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center p-8 overflow-hidden">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shrink-0">
          <Check size={48} strokeWidth={3} />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4">You did it.</h2>
        <p className="text-xl text-slate-500 max-w-lg mx-auto">You have successfully brought your mind back to the present moment. Take a deep breath.</p>
      </motion.div>
    );
  }

  const Icon = currentStage.icon;

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full h-full p-6 overflow-hidden">
      
      {/* HEADER */}
      <motion.div 
        key={`header-${stageIndex}`}
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 w-full shrink-0 mt-2"
      >
        {/* 2. INCREASED CONTAINER & ICON SIZE FOR BETTER VISUAL DESCRIPTIVENESS */}
        <div className={`w-20 h-20 mx-auto rounded-full ${currentStage.bg} ${currentStage.color} flex items-center justify-center mb-4 shadow-sm overflow-hidden`}>
          <motion.div animate={currentStage.animation}>
            <Icon size={40} strokeWidth={2.5} />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">
          Find {currentStage.count} {currentStage.count === 1 ? 'thing' : 'things'} you can {currentStage.sense}
        </h2>
        <p className="text-base text-slate-500">{currentStage.prompt}</p>
      </motion.div>

      {/* PROGRESS DOTS */}
      <div className="flex gap-3 justify-center mb-6 shrink-0">
        {[...Array(currentStage.count)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ 
              scale: i === answers.length ? 1.2 : 1,
              opacity: i <= answers.length ? 1 : 0.3 
            }}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              i < answers.length ? currentStage.bg.replace('100', '500') : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* SLIM INPUT AREA */}
      <div className="w-full max-w-md shrink-0 h-22.5 relative z-10">
        <AnimatePresence mode="wait">
          {!isTransitioning ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type 1 thing & press Enter...`}
                className={`w-full py-3 px-5 text-lg text-center bg-white border-2 border-slate-100 rounded-xl shadow-sm focus:outline-none focus:border-transparent focus:ring-2 transition-all ${currentStage.ring}`}
              />
              <p className="text-center text-slate-400 mt-3 font-medium uppercase tracking-widest text-xs">
                {currentStage.count - answers.length} left
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="transition"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-2 text-slate-500 font-bold text-lg gap-2 h-full"
            >
              <Loader2 className="animate-spin" size={24} />
              <p>Moving to next stage...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ANSWER CHIPS "BUCKET" */}
      <div className="flex-1 w-full flex flex-wrap content-start justify-center gap-2 mt-6">
        <AnimatePresence>
          {answers.map((ans, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`px-4 py-1.5 rounded-full ${currentStage.bg} ${currentStage.color} font-medium text-sm shadow-sm border border-white/50`}
            >
              {ans}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}