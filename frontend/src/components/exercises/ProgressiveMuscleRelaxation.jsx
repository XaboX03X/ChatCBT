import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, ArrowRight, Square } from 'lucide-react';

const PMR_STAGES = [
  { id: 1, name: "FACE", tense: "Tense your face: squeeze eyes shut, frown, clench jaw.", release: "Slowly relax your face and notice the warmth.", tIcon: "😖", rIcon: "😌" },
  { id: 2, name: "SHOULDERS & NECK", tense: "Lift your shoulders to your ears and tense your neck.", release: "Drop your shoulders and feel the tension leave.", tIcon: "🏋️", rIcon: "🧘" },
  { id: 3, name: "ARMS & HANDS", tense: "Clench your fists and tense your forearms tightly.", release: "Unclench your fists and open your fingers.", tIcon: "✊", rIcon: "🖐️" },
  { id: 4, name: "STOMACH & CHEST", tense: "Tense your abdomen and chest as if bracing for impact.", release: "Relax your stomach and breathe freely.", tIcon: "🛡️", rIcon: "😮‍💨" },
  { id: 5, name: "LEGS & FEET", tense: "Stretch your legs and tense your thighs and calves.", release: "Relax your legs and notice heaviness and warmth.", tIcon: "🦵", rIcon: "🦶" }
];

export default function ProgressiveMuscleRelaxation() {
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [phase, setPhase] = useState('tense'); 
  const [timeLeft, setTimeLeft] = useState(10); 

  const currentStage = PMR_STAGES[stageIndex];

  useEffect(() => {
    let interval;
    if (isActive && !isDone) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 1) return prev - 1;
          handleNextPhase();
          return 0; 
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isDone, phase, stageIndex]);

  const handleNextPhase = () => {
    if (phase === 'tense') {
      setPhase('release');
      setTimeLeft(10); 
    } else {
      if (stageIndex < PMR_STAGES.length - 1) {
        setStageIndex(prev => prev + 1);
        setPhase('tense');
        setTimeLeft(10); 
      } else {
        setIsDone(true);
        setIsActive(false);
      }
    }
  };

  const startExercise = () => {
    setStageIndex(0);
    setPhase('tense');
    setTimeLeft(10); 
    setIsDone(false);
    setIsActive(true);
  };

  const resetExercise = () => {
    setIsActive(false);
    setIsDone(false);
    setStageIndex(0);
    setPhase('tense');
  };

  // --- RENDER: DONE STATE ---
  if (isDone) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center w-full h-full px-6 py-4 bg-white overflow-hidden text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 shrink-0">
          <Check size={40} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Done</h2>
        <p className="text-lg text-slate-500 mb-6 max-w-sm">Your whole body is more relaxed now. Well done.</p>
        <button onClick={resetExercise} className="px-8 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition-all">
          Close
        </button>
      </motion.div>
    );
  }

  // --- RENDER: IDLE/START STATE ---
  if (!isActive) {
    return (
      // SHRUNK: padding reduced to px-6 py-4, justify-between to keep it anchored
      <div className="w-full h-full flex flex-col items-center justify-between bg-white px-6 py-4 overflow-hidden">
        
        {/* SHRUNK: Margins and text sizes slightly reduced */}
        <div className="text-center shrink-0 mb-2 mt-2">
          <h2 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Progressive Muscle Relaxation</h2>
          <p className="text-slate-500 text-sm">Tense and release muscles to ease tension and anxiety.</p>
        </div>

        {/* SHRUNK: space-y-3 to space-y-2, p-3 to px-3 py-2, w-8 to w-7 */}
        <div className="w-full max-w-xs flex-1 flex flex-col justify-center space-y-2 my-2">
          {PMR_STAGES.map((stage) => (
            <div key={stage.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50">
              <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-xs">
                {stage.rIcon}
              </div>
              <span className="text-sm font-medium text-slate-600">{stage.name}</span>
            </div>
          ))}
        </div>

        {/* SHRUNK: Button width and padding reduced */}
        <div className="shrink-0 mt-2 mb-2">
            <button onClick={startExercise} className="flex items-center justify-center gap-2 w-56 py-3 rounded-full font-bold text-base bg-[#7B7AFA] text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95">
            Start exercise
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE EXERCISE STATE (SIDE-BY-SIDE) ---
  const isTense = phase === 'tense';

  return (
    <div className="w-full h-full flex flex-col bg-white px-6 py-4 overflow-hidden">
      
      {/* SHRUNK Header */}
      <div className="text-center shrink-0 mb-1 mt-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{currentStage.name}</h2>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase mt-0.5">Stage {currentStage.id} of 5</p>
      </div>

      {/* SHRUNK 50/50 Split Area */}
      <div className="flex-1 flex flex-row items-center justify-center w-full min-h-[200px] gap-4 shrink-0 my-2">
        
        {/* LEFT SIDE: Text & Timer */}
        <div className="w-1/2 flex flex-col items-center justify-center text-center p-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase + stageIndex}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="flex flex-col items-center w-full"
            >
              <h3 className={`text-xl font-extrabold tracking-wide mb-2 ${isTense ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isTense ? 'TENSE' : 'RELEASE'}
              </h3>
              
              <p className="text-base text-slate-600 font-medium h-16 flex items-center justify-center leading-snug px-1">
                {isTense ? currentStage.tense : currentStage.release}
              </p>

              <div className={`text-6xl font-black tabular-nums mt-1 ${isTense ? 'text-rose-400' : 'text-emerald-400'}`}>
                {timeLeft}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE: Dynamic Literal Visualizer (Shrunk to 40x40 from 48x48) */}
        <div className="w-1/2 flex items-center justify-center">
            <motion.div
                animate={{
                    scale: isTense ? [1, 1.05, 1] : 1,
                    backgroundColor: isTense ? '#fff1f2' : '#ecfdf5', 
                    borderColor: isTense ? '#fda4af' : '#6ee7b7',
                    boxShadow: isTense ? '0px 0px 20px rgba(244,63,94,0.3)' : '0px 0px 15px rgba(16,185,129,0.2)'
                }}
                transition={isTense ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
                className="w-40 h-40 rounded-full border-4 flex items-center justify-center text-[4rem] shadow-inner"
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={isTense ? currentStage.tIcon : currentStage.rIcon}
                        initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="drop-shadow-lg"
                    >
                        {isTense ? currentStage.tIcon : currentStage.rIcon}
                    </motion.span>
                </AnimatePresence>
            </motion.div>
        </div>

      </div>

      {/* SHRUNK Bottom Controls */}
      <div className="shrink-0 flex flex-col items-center mt-auto pb-1">
        <div className="flex gap-1.5 mb-3">
          {PMR_STAGES.map((_, idx) => (
            <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${idx === stageIndex ? 'bg-slate-800' : idx < stageIndex ? 'bg-slate-300' : 'bg-slate-200'}`} />
          ))}
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={resetExercise}
                className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full font-bold text-sm text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all hover:scale-105 active:scale-95 border border-rose-100"
            >
                <Square size={14} fill="currentColor" /> Stop
            </button>
            <button
                onClick={handleNextPhase}
                className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full font-bold text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 border border-slate-200"
            >
                Skip <ArrowRight size={14} />
            </button>
        </div>
      </div>

    </div>
  );
}