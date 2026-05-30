import React, { useState, useRef } from 'react';
import { Heart, Code, Database, Cpu, MessageSquare, Zap, BrainCircuit, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import TermsModal from '../components/TermsModal';

// FIX 1: Reduced py-24 to py-16 to give the content more vertical breathing room in the viewport
const Section = ({ children, className = "" }) => (
  <motion.section 
    initial={{ y: 50, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: false, amount: 0.2 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={`min-h-screen flex flex-col items-center justify-center py-16 px-6 ${className}`}
  >
    {children}
  </motion.section>
);

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const finaleRef = useRef(null);
  const isFinaleInView = useInView(finaleRef, { amount: 0.5 });

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

      {/* CLINICALLY VALIDATED SECTION */}
      <Section className="bg-white">
        {/* FIX 2: Reduced gap-16 to gap-10 to tighten the horizontal spread */}
        <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-10">
          
          {/* Left Column: UAT Proof */}
          <div className="flex-1 w-full relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 bg-indigo-100 rounded-[2rem] translate-x-4 translate-y-4 -z-10 max-h-[450px]"></div>
            {/* FIX 3: Changed to aspect-square and added max-h-[450px] to prevent vertical blowout */}
            <img 
              src="/UATPicture.jpeg" 
              alt="Clinical UAT Validation" 
              className="rounded-[2rem] shadow-xl w-full max-w-md object-cover border border-slate-100 aspect-square sm:aspect-video lg:aspect-square max-h-[450px]"
            />
            
            {/* Floating verification badge */}
            <div className="absolute -bottom-4 -left-2 sm:left-4 lg:-left-6 bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Status</p>
                <p className="text-sm font-bold text-slate-800">UAT Verified</p>
              </div>
            </div>
          </div>

          {/* Right Column: The PDF Metrics */}
          <div className="flex-1 w-full flex flex-col justify-center">
            {/* FIX 4: Scaled down text sizes and margins (mb-6 to mb-4, mb-10 to mb-6) */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-800 leading-tight">
              Clinically Validated <br/><span className="text-[#7B7AFA]">& Approved</span>
            </h2>
            <p className="text-base text-slate-600 mb-6 leading-relaxed">
              ChatCBT has undergone rigorous User Acceptance Testing (UAT) under the supervision of a licensed Clinical Psychologist to ensure maximum safety and psychological protocol adherence.
            </p>

            {/* FIX 5: Tightened spacing between cards and reduced internal padding */}
            <div className="space-y-4">
              
              {/* Metric 1 */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 transition-colors hover:bg-indigo-50">
                <div className="p-2.5 bg-indigo-100 text-[#7B7AFA] rounded-full shrink-0 mt-0.5">
                  <Heart size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">5/5 Empathy & Alliance</h3>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">Achieved a perfect score in establishing a safe, non-judgmental digital therapeutic alliance during severe crisis simulations.</p>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 transition-colors hover:bg-emerald-50">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-full shrink-0 mt-0.5">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Crisis Guardrails Verified</h3>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">Successfully bypassed generative responses during crisis prompts, accurately and safely mapping to local Malaysian hotlines.</p>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 transition-colors hover:bg-blue-50">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-full shrink-0 mt-0.5">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Clinical Insight Output</h3>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">Expert feedback highlighted the system's precise ability to validate distress while effectively encouraging cognitive reframing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

{/* TECH STACK */}
      <Section className="bg-slate-50">
        <h2 className="text-3xl font-bold mb-12 text-slate-800">Engineering the Future</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
           {[ 
              {
                icon: <Code size={32}/>, 
                title: "Seamless Interface (React)", 
                desc: "Ensures the application feels smooth, instant, and completely responsive across any device you use."
              }, 
              {
                icon: <Cpu size={32}/>, 
                title: "Private AI Brain (Ollama)", 
                desc: "A smart, on-device AI that understands your emotions instantly without ever sending your private chats to the internet."
              }, 
              {
                icon: <Database size={32}/>, 
                title: "Secure Vault (Appwrite)", 
                desc: "Acts as a locked digital vault, keeping your session data completely anonymous and safely stored only on your local network."
              },
              {
                icon: <Zap size={32}/>, 
                title: "Lightning Fast (Node/Express)", 
                desc: "The invisible engine running in the background, making sure your therapeutic feedback is delivered without any frustrating delays."
              },
              {
                icon: <MessageSquare size={32}/>, 
                title: "Clinical Rules (CBT Protocol)", 
                desc: "Built-in psychological guardrails that guarantee the AI's advice is always safe, grounded, and backed by real therapeutic science."
              },
              {
                icon: <Heart size={32}/>, 
                title: "Calming Animations (Framer)", 
                desc: "Gentle, fluid visual movements carefully designed to help lower your heart rate and prevent feeling visually overwhelmed."
              } 
           ].map((item, i) => (
            <div key={i} className="flex flex-col items-start p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                <div className="text-[#7B7AFA] mb-4">{item.icon}</div>
                <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
            </div>
           ))}
        </div>
      </Section>

      {/* GRAND FINALE */}
      <Section className="bg-linear-to-t from-slate-100 to-slate-50">
        <div ref={finaleRef} className="flex flex-col items-center max-w-2xl w-full">
            <BrainCircuit size={64} className="text-[#7B7AFA] mb-8" />
            <blockquote className="text-2xl sm:text-3xl font-medium text-slate-800 text-center italic mb-12 leading-snug">
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