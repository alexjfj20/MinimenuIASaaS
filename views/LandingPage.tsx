
import React, { useRef } from 'react';
import { AppView, PlanType, Plan } from '../types';
import { PLANS } from '../constants';

interface LandingPageProps {
  setView: (v: AppView) => void;
}

const SUBSCRIPTION_PLANS_ORDER: PlanType[] = [PlanType.BASIC, PlanType.PRO, PlanType.ENTERPRISE];

const formatPrice = (price: number): string => {
  if (price === 0) return 'Gratis';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(price);
};

const LandingPage: React.FC<LandingPageProps> = ({ setView }) => {
  const preciosSectionRef = useRef<HTMLElement>(null);

  const scrollToPrecios = (): void => {
    preciosSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navegación Refinada */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                MenuAI SaaS
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button className="hover:text-indigo-600 transition">Características</button>
              <button type="button" onClick={scrollToPrecios} className="hover:text-indigo-600 transition">Precios</button>
              <button 
                onClick={() => setView('login')}
                className="text-indigo-600 font-bold hover:text-indigo-800 transition"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => setView('register')}
                className="bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition shadow-sm"
              >
                Empezar Gratis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Persuasivo */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Impulsado por Gemini 3.0
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Digitaliza tu negocio con <span className="text-indigo-600">Inteligencia Artificial</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Crea menús digitales irresistibles en segundos. Toma pedidos por WhatsApp, gestiona inventario y escala tus ventas con una plataforma diseñada para el éxito.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setView('register')}
                  className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100 text-lg flex items-center justify-center gap-2"
                >
                  Registrar mi negocio
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  onClick={() => setView('publicmenu')}
                  className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-lg"
                >
                  Ver Menús Públicos
                </button>
              </div>
            </div>
            
            {/* Visual Mockup */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 rounded-[3rem] blur-3xl"></div>
              <div className="relative bg-slate-100 rounded-[2.5rem] border-8 border-slate-900 overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
                  alt="SaaS Interface"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
                  <div className="glass p-6 rounded-2xl w-full flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold text-lg">Pedidos Hoy</p>
                      <p className="text-indigo-200 text-2xl font-black">+45% vs ayer</p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Beneficios Pro */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Por qué elegirnos</h2>
            <p className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Todo lo que necesitas para dominar el mercado digital</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Creación por Voz",
                desc: "Describe tu plato con la voz y nuestra IA generará el nombre, descripción técnica e imagen publicitaria.",
                icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              },
              {
                title: "Pedidos WhatsApp",
                desc: "Tus clientes piden desde el menú y tú recibes los detalles directamente en tu WhatsApp listo para procesar.",
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              },
              {
                title: "Analítica Real",
                desc: "Entiende qué platos se venden más y cuáles necesitan impulso. Toma decisiones basadas en datos reales.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes de suscripción */}
      <section ref={preciosSectionRef} id="precios" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Planes</h2>
            <p className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Planes de suscripción para tu negocio</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {SUBSCRIPTION_PLANS_ORDER.map((planKey) => {
              const plan: Plan = PLANS[planKey];
              if (!plan) return null;
              const isPro = plan.id === PlanType.PRO;
              return (
                <div
                  key={plan.id}
                  className={`relative p-8 rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isPro ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500' : 'border-slate-100 bg-white'
                  }`}
                >
                  {isPro && (
                    <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-slate-900">{formatPrice(plan.price)}</span>
                    {plan.price > 0 && <span className="text-slate-500 font-medium">/mes</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm">
                        <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setView('register')}
                    className={`w-full py-3 px-4 rounded-2xl font-bold transition-all ${
                      isPro
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {plan.price === 0 ? 'Empezar Gratis' : 'Elegir plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer / Admin Links */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-50 grayscale">
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900">MenuAI SaaS</span>
            </div>
            
            <p className="text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} MenuAI Solutions. Hecho con pasión por el comercio local.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
