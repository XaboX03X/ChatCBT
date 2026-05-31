import React, { useState, useEffect, useRef } from 'react';
import { Send, BrainCircuit, Heart, User, AlertTriangle, LifeBuoy, Activity, X, Volume2, VolumeX } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import AnxietyMeter from '../components/EmotionMeter';
import ExerciseModal from '../components/ExerciseModal'; 

// 🔥 Import Database configurations
import { account, databases, DATABASE_ID, COLLECTION_ID, ID, Query } from '../lib/appwrite';

export default function Chat() {
  const [inputText, setInputText] = useState('');
  const [anxietyScore, setAnxietyScore] = useState(2.0);
  const [currentEmotion, setCurrentEmotion] = useState('neutral'); // NEW: Emotion text state
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const [cbtFlow, setCbtFlow] = useState('idle');
  const [cbtStage, setCbtStage] = useState(1); 
  
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [showMobileMeter, setShowMobileMeter] = useState(false); 
  const [speakingId, setSpeakingId] = useState(null); 
  
  // 🔥 Track if the toolkit icon should be highlighted
  const [highlightToolkit, setHighlightToolkit] = useState(false);
  
  // 🔥 Track the current session user
  const [currentUser, setCurrentUser] = useState(null);
  
  const messagesEndRef = useRef(null);
  
  // Safe context extraction
  const { textSize, voiceEnabled } = useOutletContext() || { textSize: 'normal', voiceEnabled: false };

  const getTextClass = () => {
    if (textSize === 'large') return 'text-base md:text-lg';
    if (textSize === 'xlarge') return 'text-lg md:text-xl';
    return 'text-sm md:text-base'; 
  };

  // 🔥 1. FETCH PAST CONVERSATIONS ON LOAD
  useEffect(() => {
    const initChat = async () => {
      try {
        const user = await account.get();
        if (!user) return;
        setCurrentUser(user);

        // Fetch using ONLY the userId to bypass complex indexing
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
            Query.limit(100) 
          ]
        );

        if (response && response.documents && response.documents.length > 0) {
          // Sort chronologically using JavaScript
          const sortedDocs = response.documents.sort((a, b) => {
            const timeA = a.$createdAt ? new Date(a.$createdAt) : new Date(0);
            const timeB = b.$createdAt ? new Date(b.$createdAt) : new Date(0);
            return timeA - timeB;
          });

          const loadedMessages = sortedDocs.map(doc => ({
            id: doc.$id || Date.now(),
            text: doc.text || "",
            sender: doc.sender || "user",
            time: doc.timestamp || ""
          }));
          setMessages(loadedMessages);
          
          const lastAiMsg = [...sortedDocs].reverse().find(d => d.sender === 'ai' && d.anxietyScore);
          if (lastAiMsg && lastAiMsg.anxietyScore) {
             setAnxietyScore(lastAiMsg.anxietyScore);
          }
        }
      } catch (error) {
        console.error("Appwrite Fetch Error:", error); 
      }
    };

    initChat();
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    let timer1, timer2, resetTimer;
    if (isTyping && cbtFlow !== 'idle') {
      setCbtStage(1);
      timer1 = setTimeout(() => setCbtStage(2), 1000);
      timer2 = setTimeout(() => setCbtStage(3), 2200);
    } else if (!isTyping && cbtFlow !== 'idle') {
      resetTimer = setTimeout(() => { setCbtFlow('idle'); }, 3000);
    }
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(resetTimer); };
  }, [isTyping, cbtFlow]);

  const handleSpeak = (msgId, text) => {
    if (!window.speechSynthesis) return;
    
    if (speakingId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
    }

    window.speechSynthesis.cancel(); 
    
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; 
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Zira')) 
                            || voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) 
                            || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
            utterance.lang = preferredVoice.lang;
        }
        
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        
        setSpeakingId(msgId);
        window.speechSynthesis.speak(utterance);
    }, 50); 
  };

  useEffect(() => {
      return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  }, []);

  // 🔥 2. FULLY BULLETPROOF DATABASE SAVER (With Fallback)
  const saveMessageToDB = async (sender, text, currentScore = null) => {
    if (!currentUser) return null;
    
    try {
      const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const safeText = typeof text === 'string' ? text : String(text);

      const payload = {
        userId: currentUser.$id,
        sender: sender,
        text: safeText,
        timestamp: timestamp
      };

      let hasScore = false;
      if (currentScore !== null && currentScore !== undefined) {
          const parsedScore = parseFloat(currentScore);
          if (!isNaN(parsedScore)) {
              payload.anxietyScore = parsedScore;
              hasScore = true;
          }
      }

      try {
        const doc = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          payload
        );
        return doc.$id;
        
      } catch (primaryError) {
        if (hasScore) {
            console.warn("Appwrite rejected the anxietyScore column. Attempting fallback save...");
            delete payload.anxietyScore; 
            
            const fallbackDoc = await databases.createDocument(
              DATABASE_ID,
              COLLECTION_ID,
              ID.unique(),
              payload
            );
            return fallbackDoc.$id;
        } else {
            throw primaryError; 
        }
      }
      
    } catch (err) {
      console.error(`❌ Final Appwrite Save Failed for ${sender}:`, err);
      return null; 
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentText = inputText;
    const timeNow = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setInputText('');

    const userMsgId = await saveMessageToDB('user', currentText);
    const validUserMsgId = userMsgId || Date.now();
    setMessages((prev) => [...prev, { id: validUserMsgId, text: currentText, sender: 'user', time: timeNow }]);

    try {
      const intentResponse = await fetch('http://localhost:5000/api/analyze-intent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: currentText })
      });
      const intentData = await intentResponse.json();
      
      setCbtFlow(intentData.intent === 'CRISIS' ? 'crisis' : 'standard');
      setIsTyping(true);

      const chatResponse = await fetch('http://localhost:5000/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: currentText, history: messages.map(m => ({ role: m.sender, content: m.text })) })
      });
      const chatData = await chatResponse.json();
      
      // NEW: Destructure both the score AND the emotion
      const newScore = chatData.anxietyScore || anxietyScore;
      if (chatData.anxietyScore) setAnxietyScore(chatData.anxietyScore);
      if (chatData.detectedEmotion) setCurrentEmotion(chatData.detectedEmotion);
      
      if (chatData.triggerToolkitGlow === true) {
          setHighlightToolkit(true); 
      }

      const aiResponseText = chatData.reply; 
      const aiMsgId = await saveMessageToDB('ai', aiResponseText, newScore);
      const validAiMsgId = aiMsgId || Date.now() + 1;
      
      setMessages((prev) => [...prev, { id: validAiMsgId, text: aiResponseText, sender: 'ai', time: timeNow }]);

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
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 font-medium italic flex items-center gap-2">
          <BrainCircuit size={16} />
          <span className="hidden sm:inline">CBT stage flow shown here</span>
          <span className="sm:hidden">CBT Engine Idle</span>
        </motion.span>
      );
    }

    const stages = cbtFlow === 'crisis' ? ["Risk Assessment", "De-escalation", "Immediate Intervention"] : ["Thought", "Problem", "Reflection"];
    const activeColor = cbtFlow === 'crisis' ? "text-rose-500" : "text-[#7B7AFA]";
    const badgeColor = cbtFlow === 'crisis' ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-indigo-50/80 text-[#7B7AFA] border-indigo-100";
    const spinnerColor = cbtFlow === 'crisis' ? "border-rose-500" : "border-[#7B7AFA]";

    return (
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="hidden md:flex items-center gap-3 text-sm font-bold tracking-wide">
          {stages.map((stageName, index) => {
            const step = index + 1;
            const isActive = cbtStage === step && isTyping;
            const isPast = cbtStage >= step;
            return (
              <React.Fragment key={stageName}>
                <motion.span animate={{ opacity: isPast ? 1 : 0.3 }} className={`transition-colors duration-500 ${isActive ? `${activeColor} drop-shadow-md` : "text-slate-500"}`}>
                  {stageName}
                </motion.span>
                {step < 3 && <motion.span animate={{ opacity: cbtStage >= step + 1 ? 1 : 0.2 }} className="text-slate-300">→</motion.span>}
              </React.Fragment>
            );
          })}
        </div>

        <AnimatePresence>
            {isTyping && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className={`flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${badgeColor}`}>
                    {cbtFlow === 'crisis' ? <AlertTriangle size={12} className="animate-pulse" /> : <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin ${spinnerColor}`} />}
                    <span className="hidden sm:inline">{cbtFlow === 'crisis' ? "Priority Protocol" : "Analyzing"}</span>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full p-2 md:p-4 gap-4 bg-slate-50/50 relative overflow-hidden">
      
      <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-3xl overflow-hidden relative z-10">
        
        <div className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/20 bg-white/40 backdrop-blur-md shrink-0">
            {renderFlow()}
            <button onClick={() => setShowMobileMeter(!showMobileMeter)} className="lg:hidden flex shrink-0 items-center gap-1.5 px-3 py-1.5 bg-white text-[#7B7AFA] border border-slate-100 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95">
               <Activity size={14} /> Meter: {anxietyScore.toFixed(1)}
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <BrainCircuit size={48} className="mb-4 opacity-50" />
                    <p className={`text-center px-4 ${getTextClass()}`}>I'm here to listen. What's on your mind?</p>
                </div>
            ) : (
                messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 md:gap-3 max-w-[90%] md:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            <div className={`hidden sm:flex w-8 h-8 shrink-0 rounded-full items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-slate-200 text-slate-500' : 'bg-[#7B7AFA] text-white'}`}>
                                {msg.sender === 'user' ? <User size={16} strokeWidth={2.5} /> : <Heart size={16} strokeWidth={2.5} fill="currentColor" />}
                            </div>

                            <div className={`relative p-3 md:p-4 px-4 md:px-6 rounded-2xl shadow-sm leading-relaxed ${getTextClass()} ${msg.sender === 'user' ? 'bg-[#7B7AFA] text-white rounded-br-sm' : 'bg-white border border-slate-100 rounded-bl-sm text-slate-800'}`}>
                                {msg.text}

                                {msg.sender === 'ai' && voiceEnabled && (
                                    <button onClick={() => handleSpeak(msg.id, msg.text)} className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-[#7B7AFA] hover:bg-white rounded-full shadow-sm transition-all bg-transparent cursor-pointer" title={speakingId === msg.id ? "Stop reading" : "Read aloud"}>
                                      {speakingId === msg.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
          </AnimatePresence>
          
          {isTyping && (
             <div className="flex items-end gap-3 w-full justify-start mt-2">
                <div className="hidden sm:flex w-8 h-8 shrink-0 rounded-full bg-[#7B7AFA] text-white items-center justify-center shadow-sm">
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
        
        <div className="p-3 md:p-4 bg-white/50 border-t border-white shrink-0">
            <div className="flex items-center max-w-3xl mx-auto gap-2 md:gap-3">
                <button 
                    type="button" 
                    onClick={() => {
                        setIsExerciseModalOpen(true);
                        setHighlightToolkit(false); 
                    }} 
                    className={`p-3 md:p-3.5 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${
                        highlightToolkit 
                        ? 'bg-rose-50 text-rose-500 border-2 border-rose-400 animate-pulse ring-4 ring-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                        : 'bg-white text-[#7B7AFA] shadow-sm border border-slate-200 hover:bg-indigo-50 hover:scale-105'
                    }`} 
                    title="CBT Safety Toolkit"
                >
                    <LifeBuoy size={20} strokeWidth={2.5} />
                </button>

                <form onSubmit={handleSend} className="relative flex-1 flex items-center">
                    <input value={inputText} onChange={(e) => setInputText(e.target.value)} className={`w-full p-3 md:p-4 pl-4 md:pl-6 pr-12 md:pr-16 bg-white rounded-full shadow-inner border border-slate-200 focus:ring-2 ring-[#7B7AFA] outline-none ${getTextClass()}`} placeholder="Type your message..." />
                    <button type="submit" disabled={isTyping} className="absolute right-1.5 md:right-2 p-2.5 md:p-3 bg-[#7B7AFA] text-white rounded-full hover:bg-indigo-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
      </div>
      
      {/* --- THE LAYOUT FIX: Added flex-col and justify-end to align bottom edges --- */}
      <div className="hidden lg:flex flex-col justify-end w-80 shrink-0 h-full">
          <AnxietyMeter currentScore={anxietyScore} currentEmotion={currentEmotion} />
      </div>

      <AnimatePresence>
        {showMobileMeter && (
            <motion.div initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} className="absolute top-20 right-4 z-40 lg:hidden">
                <div className="relative">
                    <button onClick={() => setShowMobileMeter(false)} className="absolute -top-3 -left-3 z-50 p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-full text-slate-500 shadow-md transition-all cursor-pointer">
                        <X size={16} />
                    </button>
                    <AnxietyMeter currentScore={anxietyScore} currentEmotion={currentEmotion} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <ExerciseModal isOpen={isExerciseModalOpen} onClose={() => setIsExerciseModalOpen(false)} />
    </div>
  );
}