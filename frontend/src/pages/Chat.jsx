import React, { useState, useEffect, useRef } from 'react';
import { Send, BrainCircuit, Heart, User, AlertTriangle, LifeBuoy } from 'lucide-react'; // Added LifeBuoy
import { motion, AnimatePresence } from 'framer-motion';
import AnxietyMeter from '../components/AnxietyMeter';
import ExerciseModal from '../components/ExerciseModal'; // Import the new modal

export default function Chat() {
  const [inputText, setInputText] = useState('');
  const [anxietyScore, setAnxietyScore] = useState(2.0);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Dynamic CBT Engine States
  const [cbtFlow, setCbtFlow] = useState('idle');
  const [cbtStage, setCbtStage] = useState(1); 
  
  // Toolkit State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // CBT Phase Timing & Reset Logic
  useEffect(() => {
    let timer1, timer2, resetTimer;
    
    if (isTyping && cbtFlow !== 'idle') {
      setCbtStage(1);
      timer1 = setTimeout(() => setCbtStage(2), 1000);
      timer2 = setTimeout(() => setCbtStage(3), 2200);
    } else if (!isTyping && cbtFlow !== 'idle') {
      resetTimer = setTimeout(() => {
        setCbtFlow('idle');
      }, 3000);
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(resetTimer);
    };
  }, [isTyping, cbtFlow]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentText = inputText;
    setInputText('');
    
    setMessages((prev) => [...prev, { 
      id: Date.now(), 
      text: currentText, 
      sender: 'user', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }]);

    try {
      const intentResponse = await fetch('http://localhost:5000/api/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentText })
      });
      const intentData = await intentResponse.json();
      
      setCbtFlow(intentData.intent === 'CRISIS' ? 'crisis' : 'standard');
      setIsTyping(true);

      const chatResponse = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentText, history: messages.map(m => ({ role: m.sender, content: m.text })) })
      });
      const chatData = await chatResponse.json();
      
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        text: chatData.reply || chatData.cbt_response, 
        sender: 'ai', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
      
      if (chatData.anxietyScore) setAnxietyScore(chatData.anxietyScore);

    } catch (error) {
      console.error("Chat Pipeline Error:", error);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: "System connection error.", sender: 'ai', time: "now" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderFlow = () => {
    if (cbtFlow === 'idle') {
      return (
        <motion.span 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-slate-400 font-medium italic flex items-center gap-2"
        >
          <BrainCircuit size={16} />
          CBT stage flow shown here
        </motion.span>
      );
    }

    const stages = cbtFlow === 'crisis' 
      ? ["Risk Assessment", "De-escalation", "Immediate Intervention"]
      : ["Thought", "Problem", "Reflection"];
      
    const activeColor = cbtFlow === 'crisis' ? "text-rose-500" : "text-[#7B7AFA]";
    const badgeColor = cbtFlow === 'crisis' ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-indigo-50/80 text-[#7B7AFA] border-indigo-100";
    const spinnerColor = cbtFlow === 'crisis' ? "border-rose-500" : "border-[#7B7AFA]";

    return (
      <>
        <div className="flex items-center gap-3 text-sm font-bold tracking-wide">
          {stages.map((stageName, index) => {
            const step = index + 1;
            const isActive = cbtStage === step && isTyping;
            const isPast = cbtStage >= step;

            return (
              <React.Fragment key={stageName}>
                <motion.span
                  animate={{ opacity: isPast ? 1 : 0.3 }}
                  className={`transition-colors duration-500 ${isActive ? `${activeColor} drop-shadow-md` : "text-slate-500"}`}
                >
                  {stageName}
                </motion.span>
                {step < 3 && (
                  <motion.span animate={{ opacity: cbtStage >= step + 1 ? 1 : 0.2 }} className="text-slate-300">→</motion.span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <AnimatePresence>
            {isTyping && (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${badgeColor}`}
                >
                    {cbtFlow === 'crisis' ? <AlertTriangle size={12} className="animate-pulse" /> : <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${spinnerColor}`} />}
                    {cbtFlow === 'crisis' ? "Priority Protocol" : "Analyzing"}
                </motion.div>
            )}
        </AnimatePresence>
      </>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full p-4 gap-4 bg-slate-50/50 relative">
      <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-3xl overflow-hidden relative">
        
        <div className="h-16 flex items-center justify-between px-8 border-b border-white/20 bg-white/40 backdrop-blur-md shrink-0">
            {renderFlow()}
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <BrainCircuit size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">I'm here to listen. What's on your mind?</p>
                </div>
            ) : (
                messages.map((msg) => (
                    <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex items-end gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-slate-200 text-slate-500' 
                                : 'bg-[#7B7AFA] text-white'
                            }`}>
                                {msg.sender === 'user' ? <User size={16} strokeWidth={2.5} /> : <Heart size={16} strokeWidth={2.5} fill="currentColor" />}
                            </div>

                            <div className={`p-4 px-6 rounded-2xl shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-[#7B7AFA] text-white rounded-br-sm' 
                                : 'bg-white border border-slate-100 rounded-bl-sm text-slate-800'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
          </AnimatePresence>
          
          {isTyping && (
             <div className="flex items-end gap-3 w-full justify-start mt-2">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#7B7AFA] text-white flex items-center justify-center shadow-sm">
                    <Heart size={16} strokeWidth={2.5} fill="currentColor" />
                </div>
                <div className="bg-white border border-slate-100 p-4 px-5 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center h-13">
                    {[0, 0.15, 0.3].map((delay) => (
                        <motion.div key={delay} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay }} className="w-2 h-2 bg-indigo-300 rounded-full" />
                    ))}
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Updated Input Dock with Toolkit Button */}
        <div className="p-4 bg-white/50 border-t border-white shrink-0">
            <div className="flex items-center max-w-3xl mx-auto gap-3">
                {/* TOOLKIT BUTTON */}
                <button
                    type="button"
                    onClick={() => setIsExerciseModalOpen(true)}
                    className="p-3.5 bg-white text-[#7B7AFA] rounded-full shadow-sm border border-slate-200 hover:bg-indigo-50 hover:scale-105 transition-all flex items-center justify-center"
                    title="CBT Safety Toolkit"
                >
                    <LifeBuoy size={22} strokeWidth={2.5} />
                </button>

                {/* EXISTING FORM */}
                <form onSubmit={handleSend} className="relative flex-1 flex items-center">
                    <input 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        className="w-full p-4 pl-6 pr-16 bg-white rounded-full shadow-inner border border-slate-200 focus:ring-2 ring-[#7B7AFA] outline-none" 
                        placeholder="Type your message..." 
                    />
                    <button type="submit" disabled={isTyping} className="absolute right-2 p-3 bg-[#7B7AFA] text-white rounded-full hover:bg-indigo-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
      </div>
      
      <div className="w-80 shrink-0">
          <AnxietyMeter currentScore={anxietyScore} />
      </div>

      {/* Render the Modal */}
      <ExerciseModal 
        isOpen={isExerciseModalOpen} 
        onClose={() => setIsExerciseModalOpen(false)} 
      />
    </div>
  );
}