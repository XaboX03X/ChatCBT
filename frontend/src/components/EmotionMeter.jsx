import React from 'react';
import { motion } from 'framer-motion';

export default function EmotionMeter({ currentScore, currentEmotion = "neutral" }) {
  // Clamp score between 1.0 and 10.0
  const score = Math.max(1.0, Math.min(10.0, currentScore || 1.0));
  
  // Calculate percentage for the height of the fluid (0% to 100%)
  const fillPercentage = ((score - 1) / 9) * 100;

  // Helper function to map the emotion string to an appropriate emoji
  const getEmotionDisplay = (emotionStr, fallbackScore) => {
    const raw = emotionStr.toLowerCase();
    
    // Check specific keywords from your AI emotion engine
    if (raw.includes('joy') || raw.includes('happy') || raw.includes('excit')) return { emoji: '😊', label: raw };
    if (raw.includes('sad') || raw.includes('depress') || raw.includes('grief')) return { emoji: '😔', label: raw };
    if (raw.includes('ang') || raw.includes('frustrat') || raw.includes('rage')) return { emoji: '😠', label: raw };
    if (raw.includes('anxi') || raw.includes('panic') || raw.includes('fear') || raw.includes('worry')) return { emoji: '😰', label: raw };
    if (raw.includes('calm') || raw.includes('relax') || raw.includes('content')) return { emoji: '😌', label: raw };

    // Smart fallback if the emotion string is missing or generic
    if (fallbackScore >= 7.5) return { emoji: '😰', label: 'Overwhelmed' };
    if (fallbackScore >= 4.0) return { emoji: '🤔', label: 'Unsettled' };
    return { emoji: '😌', label: 'Calm' };
  };

  const emotionData = getEmotionDisplay(currentEmotion, score);

  return (
    <div className="bg-white/60 backdrop-blur-xl w-full h-full max-w-sm rounded-3xl shadow-xl border border-white flex flex-col overflow-hidden">
      
      {/* 1. THE NEW HEADER BAR (Matches Chat Interface) */}
      <div className="h-16 flex items-center justify-center border-b border-white/20 bg-white/40 backdrop-blur-md shrink-0">
         <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Emotion Meter</h3>
      </div>
      
      {/* WRAPPER FOR CONTENT TO DISTRIBUTE EVENLY */}
      <div className="flex-1 w-full p-6 md:p-8 flex flex-col items-center justify-between">
        
        {/* 2. SCORE SECTION */}
        <div className="text-center">
          <motion.div 
            key={score}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-black text-slate-900 tracking-tighter"
          >
            {score.toFixed(1)}
          </motion.div>
          <span className="text-slate-400 text-xs font-semibold uppercase mt-2 block tracking-widest">Intensity Out of 10</span>
        </div>

        {/* 3. THE THERMOMETER TUBE */}
        <div className="relative h-56 md:h-64 w-full flex items-center justify-center gap-8">
          <div className="w-10 h-full rounded-full bg-slate-100 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] relative overflow-hidden border border-slate-200/50">
            <motion.div
              initial={{ height: "0%" }}
              animate={{ height: `${fillPercentage}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
              className="absolute bottom-0 left-0 w-full overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-10 h-[16rem] bg-linear-to-t from-[#2dd4bf] via-[#fbbf24] to-[#f43f5e]" />
            </motion.div>
            <div className="absolute inset-0 w-full h-full rounded-full bg-linear-to-r from-white/60 to-transparent opacity-50 pointer-events-none mix-blend-overlay"></div>
          </div>

          <div className="flex flex-col justify-between h-full py-2 text-xs font-bold text-slate-600">
              <div className="flex items-center h-[33%] text-[#f43f5e]">High Intensity (7-10)</div>
              <div className="flex items-center h-[33%] text-[#fbbf24]">Moderate (4-6)</div>
              <div className="flex items-center h-[33%] text-[#2dd4bf]">Calm / Low (0-3)</div>
          </div>
        </div>

        {/* 4. AI EMOTION INFERENCE */}
        <div className="flex flex-col items-center justify-center w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 shadow-sm shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">We indicate that you are feeling</span>
          <motion.div 
            key={emotionData.emoji}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl my-1 drop-shadow-sm"
          >
            {emotionData.emoji}
          </motion.div>
          <span className="text-sm font-bold text-slate-700 capitalize tracking-wide mt-1">{emotionData.label}</span>
        </div>

      </div>
    </div>
  );
}