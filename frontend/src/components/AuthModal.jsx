import React, { useState } from 'react';
import { Heart, User, Mail, Lock, ArrowRight, ShieldAlert, X, Eye, EyeOff } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const navigate = useNavigate();
  
  const [authMode, setAuthMode] = useState('choice'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    setAuthMode('choice');
    setEmail('');
    setPassword('');
    setName('');
    setAuthError('');
    setShowPassword(false);
    onClose();
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setAuthError('');
    setShowPassword(false);
  };

  const getNextGuestName = () => {
    const currentCount = parseInt(localStorage.getItem('chatcbt_guest_index') || '0');
    const nextCount = currentCount + 1;
    localStorage.setItem('chatcbt_guest_index', nextCount.toString());
    return `Guest ${nextCount}`;
  };

  const handleGuestBypass = async () => {
  if (import.meta.env.VITE_USE_MOCK_DB === 'true') {
      handleClose();
      navigate('/chat');
      return;
  }
    try {
      setIsLoading(true);
      setAuthError('');

      try {
        await account.deleteSession('current');
      } catch (err) {}

      await account.createAnonymousSession();

      const guestName = getNextGuestName();
      await account.updateName(guestName);
      
      handleClose();
      navigate('/chat'); 
      
    } catch (error) {
      console.error("Guest access error:", error.message);
      setAuthError("Database connection failed. Please verify the system is online.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Email and password are required.');
      return;
    }

    if (password.length < 8) {
        setAuthError('Password must be at least 8 characters long.');
        return;
    }

    try {
      setIsLoading(true);

      try {
        await account.deleteSession('current');
      } catch (err) {}

      if (authMode === 'signup') {
        await account.create('unique()', email, password, name || 'User');
      }
      
      await account.createEmailPasswordSession(email, password);
      
      handleClose();
      onAuthSuccess(); 
    } catch (error) {
      console.error("Authentication crash:", error.message);
      const errorMessage = error.message.includes("already exists") 
        ? "An account with this email already exists." 
        : error.message || "Credential verification failed. Please try again.";
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white/90 backdrop-blur-xl w-full max-w-md p-8 rounded-3xl border border-white shadow-2xl relative z-10 overflow-hidden"
          >
            <button onClick={handleClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <X size={18} />
            </button>

            {authMode === 'choice' && (
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-5 text-[#7B7AFA]">
                  <Heart size={28} fill="currentColor" strokeWidth={0} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Configure Session Access</h3>
                <p className="text-sm text-slate-500 mb-8 max-w-xs">
                  Choose how you wish to engage with the framework.
                </p>

                {authError && (
                  <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2 text-left">
                    <ShieldAlert size={16} className="shrink-0" />
                    <p>{authError}</p>
                  </div>
                )}

                <div className="w-full bg-[#FFFAEB] border border-[#FDE6A8] rounded-2xl p-5 mb-6 shadow-sm">
                  <p className="text-[#B45309] text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 mb-4">
                    <ShieldAlert size={15} /> Low Friction Bypass
                  </p>
                  <button
                    onClick={handleGuestBypass}
                    disabled={isLoading}
                    className="w-full bg-white text-slate-800 py-3.5 border border-slate-200 rounded-xl font-semibold shadow-sm hover:border-[#7B7AFA] hover:text-[#7B7AFA] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {isLoading ? "Provisioning..." : "Proceed instantly as Guest"}
                    <ArrowRight size={18} />
                  </button>
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => switchMode('login')} 
                    className="py-3.5 border border-slate-200 rounded-xl font-medium text-slate-600 text-sm hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => switchMode('signup')} 
                    className="py-3.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 shadow-md transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {(authMode === 'login' || authMode === 'signup') && (
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {authMode === 'signup' ? 'Secure Registration' : 'Account Authentication'}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {authMode === 'signup' ? 'Track log sets across device nodes.' : 'Sync persistent session states.'}
                </p>

                {authError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                    <ShieldAlert size={16} className="shrink-0" />
                    <p>{authError}</p>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {authMode === 'signup' && (
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-4 text-slate-400" />
                      <input
                        type="text" 
                        name="decoy-user-id"
                        required 
                        placeholder="User Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-[#7B7AFA] focus:bg-white transition-all"
                        autoComplete="off"
                        spellCheck="false"
                        data-lpignore="true"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-4 text-slate-400" />
                    <input
                      type="text"
                      name="decoy-email-identifier"
                      required 
                      placeholder="Email Address" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-[#7B7AFA] focus:bg-white transition-all"
                      autoComplete="chrome-off-random-string"
                      spellCheck="false"
                      data-lpignore="true"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-4 text-slate-400" />
                    {/* 🔥 THE MAGIC TRICK: Always text, CSS handles the masking */}
                    <input
                      type="text"
                      name="decoy-secure-key"
                      required 
                      placeholder={authMode === 'signup' ? "e.g., P@ssw0rd123 (Min. 8 chars)" : "Security Password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3.5 pl-11 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-[#7B7AFA] focus:bg-white transition-all"
                      autoComplete="new-password-bypass"
                      spellCheck="false"
                      data-lpignore="true"
                      style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-slate-400 hover:text-[#7B7AFA] transition-colors cursor-pointer"
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAuthSubmit} 
                  disabled={isLoading}
                  className="w-full bg-[#7B7AFA] text-white p-3.5 rounded-xl font-medium shadow-md hover:bg-indigo-600 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : authMode === 'signup' ? "Complete Registration" : "Authorize Entry"}
                </button>

                <button
                  type="button" 
                  onClick={() => switchMode('choice')}
                  className="mt-4 text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  ← Back to access choices
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}