import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square } from 'lucide-react';

export default function BoxBreathing() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); 
  const [timeLeft, setTimeLeft] = useState(4);
  const [sessionKey, setSessionKey] = useState(0); 

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 1) return prevTime - 1;

          if (phaseRef.current === 'inhale') {
            setPhase('hold');
            return 7; 
          } else if (phaseRef.current === 'hold') {
            setPhase('exhale');
            return 8; 
          } else if (phaseRef.current === 'exhale') {
            setPhase('inhale');
            return 4; 
          }
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
    hold: "Hold...",
    exhale: "Exhale..."
  };

  const subText = {
    idle: "Press start to begin.",
    inhale: "Breathe in quietly through your nose.",
    hold: "Hold your breath.",
    exhale: "Exhale completely through your mouth."
  };

  const ringVariants = {
    idle: { 
        scale: 1, 
        borderColor: '#bae6fd', 
        backgroundColor: 'rgba(224, 242, 254, 0)', 
        boxShadow: '0px 0px 0px rgba(0,0,0,0)',
        transition: { duration: 0.2 }
    },
    inhale: { 
        scale: 1.5, 
        borderColor: '#38bdf8', 
        backgroundColor: 'rgba(186, 230, 253, 0.3)', 
        boxShadow: '0px 0px 30px rgba(56, 189, 248, 0.5)', 
        transition: { duration: 4, ease: "linear" } 
    },
    hold: { 
        scale: 1.5, 
        borderColor: '#fb7185', 
        backgroundColor: 'rgba(254, 205, 211, 0.3)', 
        boxShadow: '0px 0px 30px rgba(251, 113, 133, 0.5)', 
        transition: { duration: 7, ease: "linear" } 
    },
    exhale: { 
        scale: 1, 
        borderColor: '#34d399', 
        backgroundColor: 'rgba(167, 243, 208, 0.3)', 
        boxShadow: '0px 0px 30px rgba(52, 211, 153, 0.5)', 
        transition: { duration: 8, ease: "linear" } 
    }
  };

  // THE FIX: Added a quick 0.2s transition to the idle state to ensure a smooth reset
  const sphereVariants = {
      idle: { backgroundColor: '#f0f9ff', borderColor: '#e0f2fe', transition: { duration: 0.2 } },
      inhale: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd', transition: { duration: 4, ease: "linear" } },
      hold: { backgroundColor: '#ffe4e6', borderColor: '#fecdd3', transition: { duration: 7, ease: "linear" } },
      exhale: { backgroundColor: '#d1fae5', borderColor: '#a7f3d0', transition: { duration: 8, ease: "linear" } }
  };

  const getTextColor = () => {
      if (phase === 'hold') return 'text-rose-500';
      if (phase === 'exhale') return 'text-emerald-500';
      return 'text-sky-500'; 
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-white px-6 py-6 overflow-hidden">
      
      <div className="text-center flex-none">
        <h2 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">4-7-8 Calm Breathing</h2>
        <p className="text-slate-500 text-base">{subText[phase]}</p>
      </div>

      <div className="relative flex items-center justify-center w-72 h-72 flex-none">
          
          {/* THE FIX: Apply Nuclear Unmount to the inner sphere to prevent cache freezing */}
          {isActive ? (
            <motion.div 
              key={`active-sphere-${sessionKey}`}
              className="absolute w-44 h-44 rounded-full shadow-inner border-2"
              variants={sphereVariants}
              initial="idle"
              animate={phase}
            />
          ) : (
            <motion.div 
              key="static-sphere"
              className="absolute w-44 h-44 rounded-full shadow-inner border-2"
              variants={sphereVariants}
              initial="idle"
              animate="idle"
            />
          )}

          {/* THE LIVELY OUTER RING */}
          {isActive ? (
            <motion.div 
              key={`active-ring-${sessionKey}`} 
              className="absolute w-44 h-44 rounded-full border-[3px]"
              variants={ringVariants}
              initial="idle"
              animate={phase}
            />
          ) : (
            <motion.div 
              key="static-ring" 
              className="absolute w-44 h-44 rounded-full border-[3px]"
              variants={ringVariants}
              initial="idle"
              animate="idle"
            />
          )}
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
             <span className={`text-base font-bold tracking-widest uppercase mb-1 transition-colors duration-500 ${getTextColor()}`}>
               {phaseText[phase]}
             </span>
             {isActive && (
               <span className={`text-6xl font-extrabold tabular-nums leading-none drop-shadow-sm mt-1 transition-colors duration-500 ${getTextColor()}`}>
                 {timeLeft}
               </span>
             )}
          </div>
      </div>

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