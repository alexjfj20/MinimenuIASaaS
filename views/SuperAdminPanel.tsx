
import React, { useState, useEffect } from 'react';
import { Business, PlanType } from '../types';
import { PLANS } from '../constants';

interface SuperAdminPanelProps {
  businesses: Business[];
  setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
  onLogout: () => void;
}

type SuperTab = 'businesses' | 'plans' | 'services' | 'modules' | 'integrations';

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ businesses, setBusinesses, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SuperTab>('businesses');
  
  // Mock data for new sections
  const [systemServices, setSystemServices] = useState([
    { id: 'api', name: 'API Core', status: 'online', uptime: '99.9%', latency: '45ms' },
    { id: 'db', name: 'Database Cluster', status: 'online', uptime: '100%', latency: '12ms' },
    { id: 'ai', name: 'Gemini AI Bridge', status: 'online', uptime: '98.5%', latency: '450ms' },
    { id: 'storage', name: 'CDN & Storage', status: 'online', uptime: '99.9%', latency: '20ms' },
  ]);

  const [platformModules, setPlatformModules] = useState([
    { id: 'voice', name: 'IA por Voz', description: 'Permite a los comercios crear platos mediante comandos de voz.', enabled: true },
    { id: 'whatsapp', name: 'Integración WhatsApp', description: 'Envío automático de notificaciones de pedido al cliente.', enabled: true },
    { id: 'analytics', name: 'Panel de Estadísticas Pro', description: 'Gráficas avanzadas de ventas y productos más vendidos.', enabled: false },
    { id: 'multi-branch', name: 'Gestión Multi-Sucursal', description: 'Permite a un negocio gestionar múltiples sedes físicas.', enabled: false },
  ]);

  const [integrations, setIntegrations] = useState([
    { id: 'gemini', name: 'Google Gemini API', status: 'connected', lastSync: 'Hace 5 min' },
    { id: 'stripe', name: 'Stripe Payments', status: 'connected', lastSync: 'Hace 2 horas' },
    { id: 'wa-cloud', name: 'WhatsApp Cloud API', status: 'disconnected', lastSync: 'Ayer' },
  ]);

  const updateBusinessPlan = (id: string, newPlanId: PlanType) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, planId: newPlanId } : b));
  };

  const toggleModule = (id: string) => {
    setPlatformModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const refreshServices = () => {
    const btn = document.getElementById('refresh-btn');
    btn?.classList.add('animate-spin');
    setTimeout(() => btn?.classList.remove('animate-spin'), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 font-bold text-xl border-b border-slate-800 flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
          Super Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Gestión Core</div>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'businesses' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Negocios
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'plans' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Planes & Límites
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 pt-4">Sistema</div>
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'services' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
            Servicios
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'modules' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a2 2 0 002 2h1a2 2 0 110 4h-1a2 2 0 00-2 2v1a2 2 0 11-4 0V11a2 2 0 00-2-2H7a2 2 0 110-4h1a2 2 0 002-2V4z"></path></svg>
            Módulos
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'integrations' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            Integraciones
          </button>
        </nav>
        <button onClick={onLogout} className="p-6 border-t border-slate-800 hover:text-red-400 transition text-left text-sm font-bold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Cerrar Sesión
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 capitalize">
              {activeTab === 'businesses' && 'Negocios'}
              {activeTab === 'plans' && 'Planes & Tarifas'}
              {activeTab === 'services' && 'Servicios del Sistema'}
              {activeTab === 'modules' && 'Módulos de la Plataforma'}
              {activeTab === 'integrations' && 'Integraciones'}
            </h2>
            <p className="text-slate-500 text-sm">Panel de control administrativo global.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Comercios</div>
              <div className="text-2xl font-black text-indigo-600">{businesses.length}</div>
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ingresos Mensuales</div>
              <div className="text-2xl font-black text-emerald-600">
                ${businesses.reduce((acc, b) => acc + PLANS[b.planId].price, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'businesses' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase">Negocio</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase">Plan Actual</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase">Uso IA Voz</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase">Platos</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businesses.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{b.name}</div>
                        <div className="text-xs text-gray-400">{b.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={b.planId}
                          onChange={(e) => updateBusinessPlan(b.id, e.target.value as PlanType)}
                          className="text-xs font-bold border-slate-200 rounded-lg p-2 bg-white border outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {Object.values(PlanType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold mb-1">
                          {b.usage.voiceAICount} / {PLANS[b.planId].maxVoiceAI}
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${Math.min(100, (b.usage.voiceAICount / PLANS[b.planId].maxVoiceAI) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-slate-700">{b.usage.productCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase">Gestionar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
            {Object.values(PLANS).map(plan => (
              <div key={plan.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-300 transition group">
                <h3 className="text-xl font-black mb-1">Plan {plan.name}</h3>
                <div className="text-4xl font-black text-indigo-600 mb-6 group-hover:scale-105 transition-transform">${plan.price}<span className="text-sm text-gray-400 font-normal">/mes</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase">Máx. Productos:</span>
                    <span className="font-black text-slate-800">{plan.maxProducts === 9999 ? 'Ilimitado' : plan.maxProducts}</span>
                  </li>
                  <li className="flex justify-between text-xs">
                    <span className="text-gray-500 font-bold uppercase">Usos IA Voz:</span>
                    <span className="font-black text-slate-800">{plan.maxVoiceAI === 9999 ? 'Ilimitado' : plan.maxVoiceAI}</span>
                  </li>
                  {plan.features.map(f => (
                    <li key={f} className="text-xs flex items-center gap-2 text-slate-600">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-sm">Configurar Plan</button>
              </div>
            ))}
          </div>
        )}

        {/* SECCIÓN: SERVICIOS DEL SISTEMA */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Todos los sistemas operando correctamente
              </span>
              <button 
                id="refresh-btn" 
                onClick={refreshServices}
                className="p-2 text-slate-400 hover:text-indigo-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemServices.map(service => (
                <div key={service.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{service.name}</h4>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-black text-slate-800">{service.uptime}</div>
                      <div className="text-[10px] text-emerald-500 font-bold uppercase">Uptime Mensual</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-600">{service.latency}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Latencia</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Saludable</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Logs Viewer Mock */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logs de Actividad en Tiempo Real</h3>
                  <div className="flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                     <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
               </div>
               <div className="font-mono text-[10px] space-y-2 max-h-48 overflow-y-auto custom-scrollbar text-slate-300">
                  <p><span className="text-emerald-500">[OK]</span> 14:02:11 - Sincronización de base de datos completada satisfactoriamente.</p>
                  <p><span className="text-indigo-400">[INFO]</span> 14:01:45 - Nuevo negocio registrado: "Sushi Zen Hub".</p>
                  <p><span className="text-amber-400">[WARN]</span> 14:00:22 - Latencia inusual detectada en Gemini API (670ms).</p>
                  <p><span className="text-emerald-500">[OK]</span> 13:58:30 - Certificados SSL renovados para subdominios.</p>
                  <p><span className="text-slate-500">[DEBUG]</span> 13:55:12 - Limpieza de caché temporal iniciada...</p>
               </div>
            </div>
          </div>
        )}

        {/* SECCIÓN: MÓDULOS DE LA PLATAFORMA */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {platformModules.map(module => (
              <div key={module.id} className={`p-6 rounded-3xl border transition-all ${module.enabled ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-50 border-slate-200 grayscale opacity-70'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${module.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                    {module.id === 'voice' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>}
                    {module.id === 'whatsapp' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>}
                    {module.id === 'analytics' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                    {module.id === 'multi-branch' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
                  </div>
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${module.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${module.enabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
                <h3 className="text-lg font-black text-slate-800">{module.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{module.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* SECCIÓN: INTEGRACIONES */}
        {activeTab === 'integrations' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-800">Proveedores de Terceros</h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition">Añadir Integración</button>
               </div>
               
               <div className="space-y-4">
                  {integrations.map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${integration.status === 'connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          </div>
                          <div>
                             <div className="font-bold text-slate-800">{integration.name}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Última Sincronización: {integration.lastSync}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${integration.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                             {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
                          </span>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2">Seguridad Global de APIs</h3>
                  <p className="text-indigo-200 text-sm max-w-lg mb-6">Todas las comunicaciones con proveedores externos están cifradas con AES-256. El sistema detecta automáticamente si una llave API ha sido comprometida.</p>
                  <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-2xl text-xs hover:bg-indigo-50 transition">Ver Registro de Auditoría</button>
               </div>
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminPanel;
