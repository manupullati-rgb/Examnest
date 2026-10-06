import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'sagar' && password === 'SAGAR!') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Invalid credentials! Username must be "sagar" and password "SAGAR!"');
    }
  };

  const handleQuickFill = () => {
    setUsername('sagar');
    setPassword('SAGAR!');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto w-full py-8 px-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Question Bank Preparation & Result Checking
          </p>
        </div>

        {/* Credentials Notice Box */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-300">Authorized Admin Credentials:</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <Sparkles className="w-3 h-3" /> Quick Fill
            </button>
          </div>
          <div className="font-mono text-slate-400 space-y-0.5">
            <div>Username: <span className="text-indigo-400 font-bold">sagar</span></div>
            <div>Password: <span className="text-indigo-400 font-bold">SAGAR!</span></div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sagar"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white text-sm outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Authenticate as Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
