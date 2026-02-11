
import React, { useState, useEffect } from 'react';
import { AppView, Business, PlanType } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabaseClient';

interface RegistrationFormProps {
  onRegister: (b: Business) => void;
  setView: (v: AppView) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister, setView }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Restaurante',
    email: '',
    password: '',
    phone: '',
    location: '',
    planId: PlanType.BASIC
  });
  
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Comprobar si ya hay un usuario logueado al cargar el componente
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsUserAuthenticated(true);
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let userId = '';

      if (!isUserAuthenticated) {
        // 1. Intentar registrar nuevo usuario
        try {
          const authData = await authService.register(formData.email, formData.password);
          if (authData.user) {
            userId = authData.user.id;
          }
        } catch (authError: any) {
          // Si el usuario ya existe, informamos y no dejamos continuar aquí para evitar el 422
          if (authError.message?.toLowerCase().includes('already registered')) {
            alert("Este correo ya tiene una cuenta. Por favor, inicia sesión primero.");
            setView('login');
            return;
          }
          throw authError;
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || '';
      }

      if (userId) {
        const businessPayload: any = {
          name: formData.name,
          type: formData.type,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          planId: formData.planId,
          logo: `https://picsum.photos/seed/${formData.name}/200/200`,
          socials: { whatsapp: formData.phone },
          paymentMethods: ['Efectivo'],
          usage: { voiceAICount: 0, productCount: 0 }
        };

        // 2. Crear el negocio vinculado al usuario
        await onRegister(businessPayload as Business);
      }
    } catch (error: any) {
      console.error("Error en el proceso:", error);
      alert(`No pudimos completar el registro: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="px-8 py-10 bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h2 className="text-3xl font-black">
            {isUserAuthenticated ? 'Configura tu Negocio' : 'Empezar ahora'}
          </h2>
          <p className="opacity-80 text-sm font-medium mt-1">
            {isUserAuthenticated 
              ? `Hola, completemos los datos de tu comercio.` 
              : 'Crea tu cuenta de acceso y registra tu negocio.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Nombre de tu Negocio</label>
              <input
                required
                type="text"
                placeholder="Ej: Sabores del Mundo"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-slate-700"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Tipo de Negocio</label>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-slate-700"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option>Restaurante</option>
                  <option>Cafetería</option>
                  <option>Tienda</option>
                  <option>Bar</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">WhatsApp de Pedidos</label>
                <input
                  required
                  type="tel"
                  placeholder="3001234567"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-slate-700"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {!isUserAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="col-span-full mb-2">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Datos de Acceso al Panel</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="admin@tuemail.com"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Contraseña</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            {isUserAuthenticated && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Cuenta Vinculada</p>
                  <p className="text-xs font-bold text-slate-600">{formData.email}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              disabled={submitting}
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : isUserAuthenticated ? 'Finalizar Registro de Negocio' : 'Crear mi Cuenta y Negocio'}
            </button>
            
            {!isUserAuthenticated && (
              <button
                type="button"
                onClick={() => setView('login')}
                className="mt-4 w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition"
              >
                ¿Ya tienes cuenta? Inicia Sesión
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
