import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Heart, Home, Edit, Settings } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar: Only visible on the chat page */}
      {isChatPage && (
        <aside className="w-20 flex flex-col items-center py-6 border-r border-slate-200 bg-[#F8FAFC] shrink-0 z-10">
          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mb-8 shadow-sm">
            <Heart size={20} fill="currentColor" strokeWidth={0} />
          </div>

          <nav className="flex flex-col gap-4 w-full px-4">
            <NavLink to="/" className={({ isActive }) => `w-full aspect-square flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-slate-200/70 text-slate-900 shadow-inner' : 'text-slate-500 hover:bg-slate-200/50'}`}>
              <Home size={22} strokeWidth={2.5} />
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `w-full aspect-square flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-slate-200/70 text-slate-900 shadow-inner' : 'text-slate-500 hover:bg-slate-200/50'}`}>
              <Edit size={22} strokeWidth={2.5} />
            </NavLink>
          </nav>

          <div className="mt-auto w-full px-4">
            <button className="w-full aspect-square flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200/50 transition-all cursor-pointer">
              <Settings size={22} strokeWidth={2.5} />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col h-full overflow-y-auto ${isChatPage ? '' : 'overflow-hidden'}`}>
        {isChatPage && (
          <header className="h-16 border-b border-slate-200 flex items-center px-8 shrink-0 bg-[#F8FAFC]">
            <h1 className="text-xl font-medium text-slate-800 tracking-tight">ChatCBT</h1>
          </header>
        )}
        <div className="flex-1 w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}