
import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (success: boolean) => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'eva1997') {
      onLogin(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Área Restrita</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Identifique-se para prosseguir</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text"
              placeholder="Usuário"
              className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password"
              placeholder="Senha"
              className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce">Credenciais Inválidas</p>
          )}

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
            >
              Acessar Painel
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
