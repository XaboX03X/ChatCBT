import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square } from 'lucide-react';

export default function BoxBreathing() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); 
  const [timeLeft, setTimeLeft] = useState(4);
  const [sessionKey, setSessionKey] = useState(0); 

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 1) return prevTime - 1;

          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') return 'holdFull';
            if (currentPhase === 'holdFull') return 'exhale';
            if (currentPhase === 'exhale') return 'holdEmpty';
            if (currentPhase === 'holdEmpty') return 'inhale';
            return 'inhale';
          });
          return 4; 
        });
      }, 1000);
    } else {
      setPhase('idle');
      setTimeLeft(4);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleBreathing = () => {
    if (!isActive) {
      setSessionKey(prev => prev + 1);
      setPhase('inhale');
      setTimeLeft(4);
      setIsActive(true);
    } else {
      setIsActive(false);
      setPhase('idle');
      setTimeLeft(4);
    }
  };

  const phaseText = {
    idle: "Ready",
    inhale: "Inhale...",
    holdFull: "Hold...",
    exhale: "Exhale...",
    holdEmpty: "Hold..."
  };

  const subText = {
    idle: "Press start to begin.",
    inhale: "Breathe in deeply through your nose.",
    holdFull: "Hold it there.",
    exhale: "Exhale slowly through your mouth.",
    holdEmpty: "Rest in the stillness."
  };

  const ringVariants = {
    idle: { scale: 1, opacity: 0.5 },
    inhale: { scale: 1.5, opacity: 1, transition: { duration: 4, ease: "linear" } },
    holdFull: { scale: 1.5, opacity: 1, transition: { duration: 4, ease: "linear" } },
    exhale: { scale: 1, opacity: 0.5, transition: { duration: 4, ease: "linear" } },
    holdEmpty: { scale: 1, opacity: 0.5, transition: { duration: 4, ease: "linear" } }
  };

  return (
    // THE FIX: Changed to 'justify-center' and added 'gap-6' to cluster everything safely in the middle
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-white px-6 py-6 overflow-hidden">
      
      <div className="text-center flex-none">
        <h2 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">Box Breathing</h2>
        <p className="text-slate-500 text-base">{subText[phase]}</p>
      </div>

      <div className="relative flex items-center justify-center w-72 h-72 flex-none">
          
          {/* Base circle shrunk slightly to w-44 to ensure it has plenty of scale room */}
          <div className="absolute w-44 h-44 bg-sky-50 rounded-full shadow-inner border border-sky-100"></div>

          {isActive ? (
            <motion.div 
              key={`active-ring-${sessionKey}`} 
              className="absolute w-44 h-44 rounded-full border-[3px] border-sky-400 bg-sky-100/40"
              variants={ringVariants}
              initial="idle"
              animate={phase}
            />
          ) : (
            <motion.div 
              key="static-ring" 
              className="absolute w-44 h-44 rounded-full border-[3px] border-sky-400 bg-sky-100/40"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ duration: 0.2 }}
            />
          )}
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-sky-600 z-10">
             <span className="text-base font-bold tracking-widest uppercase mb-1">
               {phaseText[phase]}
             </span>
             {isActive && (
               <span className="text-6xl font-extrabold tabular-nums leading-none text-sky-500 drop-shadow-sm mt-1">
                 {timeLeft}
               </span>
             )}
          </div>
      </div>

      {/* Added a bottom margin to act as a physical bumper against the modal's floor */}
      <div className="flex-none mb-6">
        <button
            onClick={toggleBreathing}
            className={`flex items-center justify-center gap-3 w-64 py-3.5 rounded-full font-bold text-lg shadow-md transition-all hover:scale-105 active:scale-95 ${
                isActive 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200' 
                : 'bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/30'
            }`}
        >
            {isActive ? <><Square size={20} fill="currentColor" /> Stop Exercise</> : <><Play size={20} fill="currentColor" /> Start Breathing</>}
        </button>
      </div>

    </div>
  );
}