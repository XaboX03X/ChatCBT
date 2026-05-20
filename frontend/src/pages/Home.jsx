import React, { useState, useRef } from 'react';
import { Heart, Code, Database, Cpu, MessageSquare, Zap, BrainCircuit, ShieldCheck } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import TermsModal from '../components/TermsModal';

const Section = ({ children, className = "" }) => (
  <motion.section 
    initial={{ y: 50, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: false, amount: 0.2 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={`min-h-screen flex flex-col items-center justify-center py-24 px-6 ${className}`}
  >
    {children}
  </motion.section>
);

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const finaleRef = useRef(null);
  const isFinaleInView = useInView(finaleRef, { amount: 0.5 });

  // Callback passed to AuthModal: When standard login succeeds, open Terms
  const handleAuthSuccess = () => {
    setIsTermsModalOpen(true);
  };

  return (
    <div className="w-full bg-slate-50 relative">
      
      {/* STICKY LOGO */}
      <div className="fixed top-0 left-0 p-8 z-50 flex items-center gap-3 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-[#7B7AFA] text-white flex items-center justify-center shadow-lg pointer-events-auto">
          <Heart size={20} fill="currentColor" strokeWidth={0} />
        </div>
        <span className="font-bold text-slate-800 text-lg tracking-tight">ChatCBT</span>
      </div>

      {/* FLOATING START SESSION BUTTON */}
      {!isFinaleInView && (
        <div className="fixed bottom-8 right-8 z-50">
          <motion.button
            layoutId="start-session-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-8 py-4 bg-[#7B7AFA] text-white rounded-full text-lg font-medium hover:bg-indigo-600 transition-colors shadow-xl hover:shadow-indigo-300 active:scale-95 cursor-pointer"
          >
            Start Session
          </motion.button>
        </div>
      )}

      {/* HERO SECTION */}
      <Section className="bg-linear-to-b from-white to-indigo-50/20">
        <div className="relative mb-8 flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0, 0.4, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute w-24 h-24 rounded-full bg-indigo-200/50 blur-xl z-0"/>
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 5, repeat: Infinity }} className="w-24 h-24 rounded-full bg-[#7B7AFA] text-white flex items-center justify-center shadow-xl z-10">
                <Heart size={48} fill="currentColor" strokeWidth={0} />
            </motion.div>
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-6 tracking-tight">ChatCBT</h1>
        <p className="text-2xl text-slate-600 max-w-lg text-center leading-relaxed">
          Your personal AI companion for evidence-based mental wellness, grounded in the present moment.
        </p>
      </Section>

      {/* CLINICAL VALIDATION */}
      <Section className="bg-white">
        <h2 className="text-3xl font-bold mb-24 text-slate-800">Clinically & Technically Verified</h2>
        <div className="flex flex-wrap gap-10 items-center justify-center">
           {[ {rot: -8, txt: "Community Research"}, {rot: 0, txt: "Clinical Protocol"}, {rot: 8, txt: "Expert Feedback"} ].map((card, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -20, rotate: 0 }}
              className="w-60 h-80 bg-slate-50 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center p-8 text-center"
              style={{ rotate: card.rot }}
            >
              <ShieldCheck className="text-indigo-400 mb-6" size={48} />
              <p className="font-bold text-slate-800 text-lg">{card.txt}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* TECH STACK */}
      <Section className="bg-slate-50">
        <h2 className="text-3xl font-bold mb-16 text-slate-800">Engineering the Future</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
           {[ 
              {icon: <Code size={32}/>, title: "React", desc: "Dynamic component architecture ensuring a fluid, responsive interface for session management."}, 
              {icon: <Cpu size={32}/>, title: "Ollama (Phi-3)", desc: "Privacy-first local LLM inference engine providing zero-latency clinical NLP classification."}, 
              {icon: <Database size={32}/>, title: "Appwrite", desc: "Containerized local edge-database managing secure anonymous guest tokens, encrypted user sessions, and CBT logs."},
              {icon: <Zap size={32}/>, title: "Node/Express", desc: "High-performance backend orchestration for real-time inference pipeline data flow."},
              {icon: <MessageSquare size={32}/>, title: "CBT Protocol", desc: "Embedded clinical logic ensuring adherence to evidence-based cognitive behavioral methodologies."},
              {icon: <Heart size={32}/>, title: "Framer Motion", desc: "Sophisticated motion design implemented to reduce cognitive load and enhance user calmness."} 
           ].map((item, i) => (
            <div key={i} className="flex flex-col items-start p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                <div className="text-[#7B7AFA] mb-6">{item.icon}</div>
                <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">{item.desc}</p>
            </div>
           ))}
        </div>
      </Section>

      {/* GRAND FINALE */}
      <Section className="bg-linear-to-t from-slate-100 to-slate-50">
        <div ref={finaleRef} className="flex flex-col items-center max-w-2xl w-full">
            <BrainCircuit size={64} className="text-[#7B7AFA] mb-8" />
            <blockquote className="text-3xl font-medium text-slate-800 text-center italic mb-12 leading-snug">
                "AI-powered clarity meets clinical precision. Our engine translates complex CBT methodologies into actionable, empathetic advice for your well-being."
            </blockquote>
            
            <div className="h-20 flex items-center justify-center">
              {isFinaleInView && (
                <motion.button
                  layoutId="start-session-btn"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-12 py-5 bg-[#7B7AFA] text-white rounded-full text-xl font-medium hover:bg-indigo-600 transition-colors shadow-xl hover:shadow-indigo-300 active:scale-95 cursor-pointer"
                >
                  Start Session
                </motion.button>
              )}
            </div>
        </div>
        
        <div className="absolute bottom-8 text-slate-400 text-sm">
            CSCI 4402 • ChatCBT © 2026
        </div>
      </Section>

      {/* MODAL COMPONENTS */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />
      
      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </div>
  );
}