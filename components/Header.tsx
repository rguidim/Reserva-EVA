
import React from 'react';
import Logo from './Logo';

interface HeaderProps {
  onAdminToggle?: () => void;
  isAdminMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onAdminToggle, isAdminMode }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Logo className="h-14" />
          
          <nav className="hidden lg:flex items-center gap-10">
            <button 
              onClick={onAdminToggle}
              className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl transition-all border
                ${isAdminMode 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
                  : 'text-slate-400 border-transparent hover:text-emerald-600 hover:bg-slate-50'}
              `}
            >
              {isAdminMode ? 'Painel do Usuário' : 'Administração'}
            </button>
          </nav>

          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Bem-vindo</p>
                <p className="text-xs font-bold text-slate-900">Visitante VIP</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
