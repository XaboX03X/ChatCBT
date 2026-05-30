import React from 'react';
import { motion } from 'framer-motion';

export default function EmotionMeter({ currentScore }) {
  // Clamp score between 1.0 and 10.0
  const score = Math.max(1.0, Math.min(10.0, currentScore || 1.0));
  
  // Calculate percentage for the height of the fluid (0% to 100%)
  const fillPercentage = ((score - 1) / 9) * 100;

  return (
    <div className="bg-white/60 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-xl border border-white p-8 flex flex-col items-center">
      
      {/* 1. Header updated to Emotion Meter */}
      <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Emotion Meter</h3>
      
      <div className="text-center mb-10">
        <motion.div 
          key={score}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black text-slate-900 tracking-tighter"
        >
          {score.toFixed(1)}
        </motion.div>
        {/* 2. Sub-label updated to track Intensity */}
        <span className="text-slate-400 text-xs font-semibold uppercase mt-2 block tracking-widest">Intensity Out of 10</span>
      </div>

      <div className="relative h-64 w-full flex items-center justify-center gap-8">
        
        {/* THE THERMOMETER TUBE */}
        <div className="w-10 h-64 rounded-full bg-slate-100 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] relative overflow-hidden border border-slate-200/50">
          
          {/* THE RISING FLUID WRAPPER */}
          <motion.div
            initial={{ height: "0%" }}
            animate={{ height: `${fillPercentage}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            className="absolute bottom-0 left-0 w-full overflow-hidden"
          >
            {/* THE LOCKED GRADIENT */}
            <div className="absolute bottom-0 left-0 w-10 h-64 bg-linear-to-t from-[#2dd4bf] via-[#fbbf24] to-[#f43f5e]" />
          </motion.div>

          {/* Glass Reflection Highlight */}
          <div className="absolute inset-0 w-full h-full rounded-full bg-linear-to-r from-white/60 to-transparent opacity-50 pointer-events-none mix-blend-overlay"></div>
        </div>

        {/* 3. Labels shifted to dimensional intensity instead of clinical levels */}
        <div className="flex flex-col justify-between h-full py-2 text-xs font-bold text-slate-600">
            <div className="flex items-center h-[33%] text-[#f43f5e]">High Intensity (7-10)</div>
            <div className="flex items-center h-[33%] text-[#fbbf24]">Moderate (4-6)</div>
            <div className="flex items-center h-[33%] text-[#2dd4bf]">Calm / Low (0-3)</div>
        </div>
      </div>
      
    </div>
  );
}