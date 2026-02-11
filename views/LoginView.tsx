
import React, { useState } from 'react';
import { AppView } from '../types';
import { authService } from '../services/authService';

interface LoginViewProps {
  setView: (v: AppView) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(email, password);
      // El onAuthStateChange en App.tsx manejará la redirección
    } catch (error: any) {
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="px-8 py-10 bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
          </div>
          <h2 className="text-3xl font-black">Bienvenido</h2>
          <p className="opacity-60 text-xs font-bold uppercase tracking-widest mt-1">Accede a tu panel de control</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-10 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input
                required
                type="email"
                placeholder="ejemplo@email.com"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Entrar al Sistema'}
            </button>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setView('register')}
                className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition"
              >
                ¿No tienes cuenta? Regístrate
              </button>
              <button
                type="button"
                onClick={() => setView('landing')}
                className="text-center text-[10px] font-black text-slate-300 uppercase tracking-tighter hover:text-slate-500 transition"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
