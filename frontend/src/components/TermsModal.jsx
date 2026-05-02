import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function TermsModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleAgree = () => {
    onClose();
    navigate('/chat');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Frosted Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Spring-based entrance animation */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/50 relative z-10"
          >
            <h3 className="text-xl font-semibold text-slate-800 mb-6 tracking-tight">
              Before we begin, please review the following:
            </h3>

            {/* Readability refined with better spacing */}
            <ol className="list-decimal pl-5 space-y-4 text-sm text-slate-600 mb-10 leading-relaxed">
              <li>This chatbot provides CBT-informed guidance, but it is not a substitute for professional mental health care, diagnosis, or treatment.</li>
              <li>Your messages may be processed to generate supportive responses. No real-time human monitoring is involved.</li>
              <li>If you are in a crisis, please seek immediate help from local emergency services or trained professionals. This chatbot cannot respond to crises.</li>
              <li>By continuing, you agree to use this tool responsibly.</li>
            </ol>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAgree}
                className="px-6 py-2.5 bg-[#7B7AFA] hover:bg-indigo-600 text-white font-medium rounded-xl transition-all shadow-md"
              >
                Agree & Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}