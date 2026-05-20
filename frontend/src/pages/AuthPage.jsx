import React, { useState } from 'react';
import { Heart, Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '../lib/appwrite'; // Importing our local engine config

export default function AuthPage({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // PATH A: THE GUEST BYPASS (Psychological Safety Feature)
  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      // Triggers Appwrite's native anonymous session
      await account.createAnonymousSession();
      onAuthSuccess(); 
    } catch (error) {
      console.error("Guest login error:", error.message);
      alert("Database connection failed. Ensure Docker is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#7B7AFA] rounded-full flex items-center justify-center shadow-lg mb-4">
            <Heart size={32} fill="white" className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isSignUp ? 'Create Account' : 'Welcome to ChatCBT'}
          </h2>
        </div>

        {/* Immediate Support Option */}
        <div className="mb-6 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-center">
          <p className="text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mb-3">
            <ShieldAlert size={14} /> Need immediate support?
          </p>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGuestLogin}
            className="w-full bg-white text-slate-700 p-3.5 border border-slate-200 rounded-xl font-semibold shadow-sm hover:border-[#7B7AFA] hover:text-[#7B7AFA] transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? 'Connecting...' : 'Continue instantly as a Guest'}
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">or track progress</span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        {/* Standard Credentials (Path B) */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-slate-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-4 pl-12 bg-white rounded-2xl shadow-sm border border-slate-200 focus:ring-2 ring-[#7B7AFA] outline-none text-sm transition-all"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-slate-400" />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 pl-12 bg-white rounded-2xl shadow-sm border border-slate-200 focus:ring-2 ring-[#7B7AFA] outline-none text-sm transition-all"
            />
          </div>

          <button
            className="w-full bg-[#7B7AFA] text-white p-4 rounded-2xl font-semibold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isSignUp ? 'Create Secure Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#7B7AFA] text-xs font-semibold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}