
import React, { useState, useRef } from 'react';
import { Business, PlanType, HybridPlan, GlobalPaymentConfig } from '../types';
import { PLANS, MOCK_HYBRID_PLANS } from '../constants';

interface SuperAdminPanelProps {
  businesses: Business[];
  setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
  onLogout: () => void;
}

type SuperTab = 'businesses' | 'plans' | 'hybrid-plans' | 'payment-methods' | 'services' | 'modules' | 'integrations';

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ businesses, setBusinesses, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SuperTab>('payment-methods');
  const [hybridPlans] = useState<HybridPlan[]>(MOCK_HYBRID_PLANS);
  const [isSaving, setIsSaving] = useState(false);

  // Initial Mock Global Payment Config con todos los métodos requeridos
  const [paymentConfig, setPaymentConfig] = useState<GlobalPaymentConfig>({
    nequi: { enabled: true, accountNumber: '3001234567', accountHolder: 'SaaS Admin', instructions: 'Envía captura por WhatsApp', qrImage: '' },
    bancolombia: { enabled: false, accountNumber: '', accountHolder: '', instructions: '', qrImage: '' },
    daviplata: { enabled: false, accountNumber: '', accountHolder: '', instructions: '', qrImage: '' },
    breB: { enabled: false, accountKey: '', instructions: '', qrImage: '' },
    stripe: { enabled: true, publicKey: 'pk_test_...', secretKey: 'sk_test_...', mode: 'sandbox', instructions: 'Pago seguro con tarjeta' },
    mercadoPago: { enabled: false, publicKey: '', accessToken: '', mode: 'sandbox', instructions: '', qrImage: '' },
    paypal: { enabled: false, clientId: '', secretKey: '', mode: 'sandbox', instructions: '', qrImage: '' },
    hotmartGlobal: { enabled: true, instructions: 'Finaliza tu suscripción en Hotmart' }
  });

  const handleSavePayments = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configuración de pagos actualizada correctamente.');
    }, 1500);
  };

  const updateBusinessPlan = (id: string, newPlanId: PlanType) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, planId: newPlanId } : b));
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>, method: keyof GlobalPaymentConfig) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPaymentConfig(prev => ({
          ...prev,
          [method]: { 
            ...(prev[method] as object), 
            qrImage: result 
          }
        }));
      };
      reader.readAsDataURL(file);
    }
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
          <button onClick={() => setActiveTab('businesses')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'businesses' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Negocios
          </button>
          <button onClick={() => setActiveTab('plans')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'plans' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Planes Fijos
          </button>
          <button onClick={() => setActiveTab('hybrid-plans')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'hybrid-plans' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Planes Híbridos
          </button>
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 pt-4">Finanzas</div>
          <button onClick={() => setActiveTab('payment-methods')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'payment-methods' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Pasarelas de Pago
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 pt-4 text-white/50">Sistema</div>
          <button onClick={() => setActiveTab('services')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'services' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg> Servicios</button>
          <button onClick={() => setActiveTab('modules')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'modules' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a2 2 0 002 2h1a2 2 0 110 4h-1a2 2 0 00-2 2v1a2 2 0 11-4 0V11a2 2 0 00-2-2H7a2 2 0 110-4h1a2 2 0 002-2V4z"></path></svg> Módulos</button>
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
              {activeTab.replace('-', ' ')}
            </h2>
            <p className="text-slate-500 text-sm">Control global de transacciones y facturación.</p>
          </div>
          {activeTab === 'payment-methods' && (
            <button 
              onClick={handleSavePayments}
              disabled={isSaving}
              className={`px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg transition flex items-center gap-2 ${isSaving ? 'opacity-70 animate-pulse cursor-wait' : 'hover:bg-indigo-700'}`}
            >
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          )}
        </header>

        {activeTab === 'payment-methods' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Columna Izquierda: Pasarelas */}
            <div className="lg:col-span-2 space-y-6 pb-20">
              
              {/* STRIPE */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13.962 10.935a1.334 1.334 0 0 1-.1.197l-2.341 4.104a1.214 1.214 0 0 1-1.058.59H8.697a1.214 1.214 0 0 1-1.058-.59L5.3 11.132a1.334 1.334 0 0 1-.1-.197V6.84a1.214 1.214 0 0 1 1.214-1.214h6.334a1.214 1.214 0 0 1 1.214 1.214v4.095z"/></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Stripe Global</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Checkout Automático</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={paymentConfig.stripe.enabled} onChange={() => setPaymentConfig({...paymentConfig, stripe: {...paymentConfig.stripe, enabled: !paymentConfig.stripe.enabled}})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                {paymentConfig.stripe.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Public Key</label>
                      <input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={paymentConfig.stripe.publicKey} onChange={e => setPaymentConfig({...paymentConfig, stripe: {...paymentConfig.stripe, publicKey: e.target.value}})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Secret Key</label>
                      <input type="password" placeholder="••••••••••••" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={paymentConfig.stripe.secretKey} onChange={e => setPaymentConfig({...paymentConfig, stripe: {...paymentConfig.stripe, secretKey: e.target.value}})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Modo</label>
                      <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.stripe.mode} onChange={e => setPaymentConfig({...paymentConfig, stripe: {...paymentConfig.stripe, mode: e.target.value as 'sandbox' | 'production'}})}>
                        <option value="sandbox">Sandbox (Pruebas)</option>
                        <option value="production">Producción</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* MERCADO PAGO */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-black">MP</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Mercado Pago</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Latam Checkout</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={paymentConfig.mercadoPago.enabled} onChange={() => setPaymentConfig({...paymentConfig, mercadoPago: {...paymentConfig.mercadoPago, enabled: !paymentConfig.mercadoPago.enabled}})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
                {paymentConfig.mercadoPago.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Public Key</label>
                      <input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.mercadoPago.publicKey} onChange={e => setPaymentConfig({...paymentConfig, mercadoPago: {...paymentConfig.mercadoPago, publicKey: e.target.value}})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Access Token</label>
                      <input type="password" placeholder="••••••••••••" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.mercadoPago.accessToken} onChange={e => setPaymentConfig({...paymentConfig, mercadoPago: {...paymentConfig.mercadoPago, accessToken: e.target.value}})} />
                    </div>
                    <div className="md:col-span-2 space-y-2 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código QR Mercado Pago</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden">
                          {paymentConfig.mercadoPago.qrImage ? (
                            <img src={paymentConfig.mercadoPago.qrImage} className="w-full h-full object-contain" alt="QR" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleQRUpload(e, 'mercadoPago')}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PAYPAL */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center font-black">P</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">PayPal</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Global Payments</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={paymentConfig.paypal.enabled} onChange={() => setPaymentConfig({...paymentConfig, paypal: {...paymentConfig.paypal, enabled: !paymentConfig.paypal.enabled}})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {paymentConfig.paypal.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Client ID</label>
                      <input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.paypal.clientId} onChange={e => setPaymentConfig({...paymentConfig, paypal: {...paymentConfig.paypal, clientId: e.target.value}})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Secret Key</label>
                      <input type="password" placeholder="••••••••••••" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.paypal.secretKey} onChange={e => setPaymentConfig({...paymentConfig, paypal: {...paymentConfig.paypal, secretKey: e.target.value}})} />
                    </div>
                    <div className="md:col-span-2 space-y-2 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código QR PayPal</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden">
                          {paymentConfig.paypal.qrImage ? (
                            <img src={paymentConfig.paypal.qrImage} className="w-full h-full object-contain" alt="QR" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleQRUpload(e, 'paypal')}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* NEQUI */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black">N</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Nequi (QR Manual)</h3>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={paymentConfig.nequi.enabled} onChange={() => setPaymentConfig({...paymentConfig, nequi: {...paymentConfig.nequi, enabled: !paymentConfig.nequi.enabled}})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>
                {paymentConfig.nequi.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Número</label><input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.nequi.accountNumber} onChange={e => setPaymentConfig({...paymentConfig, nequi: {...paymentConfig.nequi, accountNumber: e.target.value}})} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Titular</label><input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.nequi.accountHolder} onChange={e => setPaymentConfig({...paymentConfig, nequi: {...paymentConfig.nequi, accountHolder: e.target.value}})} /></div>
                    <div className="md:col-span-2 space-y-2 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código QR Nequi</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden">
                          {paymentConfig.nequi.qrImage ? (
                            <img src={paymentConfig.nequi.qrImage} className="w-full h-full object-contain" alt="QR" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleQRUpload(e, 'nequi')}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BANCOLOMBIA */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-400 text-black rounded-2xl flex items-center justify-center font-black">B</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Bancolombia (QR Manual)</h3>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={paymentConfig.bancolombia.enabled} onChange={() => setPaymentConfig({...paymentConfig, bancolombia: {...paymentConfig.bancolombia, enabled: !paymentConfig.bancolombia.enabled}})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                {paymentConfig.bancolombia.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Cuenta de Ahorros</label><input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.bancolombia.accountNumber} onChange={e => setPaymentConfig({...paymentConfig, bancolombia: {...paymentConfig.bancolombia, accountNumber: e.target.value}})} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Titular</label><input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.bancolombia.accountHolder} onChange={e => setPaymentConfig({...paymentConfig, bancolombia: {...paymentConfig.bancolombia, accountHolder: e.target.value}})} /></div>
                    <div className="md:col-span-2 space-y-2 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código QR Bancolombia</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden">
                          {paymentConfig.bancolombia.qrImage ? (
                            <img src={paymentConfig.bancolombia.qrImage} className="w-full h-full object-contain" alt="QR" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleQRUpload(e, 'bancolombia')}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DAVIPLATA */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black">D</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Daviplata</h3>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={paymentConfig.daviplata.enabled} onChange={() => setPaymentConfig({...paymentConfig, daviplata: {...paymentConfig.daviplata, enabled: !paymentConfig.daviplata.enabled}})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                {paymentConfig.daviplata.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Número Daviplata</label><input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.daviplata.accountNumber} onChange={e => setPaymentConfig({...paymentConfig, daviplata: {...paymentConfig.daviplata, accountNumber: e.target.value}})} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Titular</label><input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.daviplata.accountHolder} onChange={e => setPaymentConfig({...paymentConfig, daviplata: {...paymentConfig.daviplata, accountHolder: e.target.value}})} /></div>
                    <div className="md:col-span-2 space-y-2 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código QR Daviplata</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden">
                          {paymentConfig.daviplata.qrImage ? (
                            <img src={paymentConfig.daviplata.qrImage} className="w-full h-full object-contain" alt="QR" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleQRUpload(e, 'daviplata')}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BRE-B */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black">B</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Bre-B (Pagos Rápidos)</h3>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={paymentConfig.breB.enabled} onChange={() => setPaymentConfig({...paymentConfig, breB: {...paymentConfig.breB, enabled: !paymentConfig.breB.enabled}})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                {paymentConfig.breB.enabled && (
                  <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Llave Bre-B (ID Cuenta)</label>
                      <input type="text" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={paymentConfig.breB.accountKey} onChange={e => setPaymentConfig({...paymentConfig, breB: {...paymentConfig.breB, accountKey: e.target.value}})} />
                    </div>
                    <div className="space-y-2 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código QR Bre-B</label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden">
                          {paymentConfig.breB.qrImage ? (
                            <img src={paymentConfig.breB.qrImage} className="w-full h-full object-contain" alt="QR" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleQRUpload(e, 'breB')}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Columna Derecha: Hotmart Global Settings */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-black">H</div>
                  <h3 className="text-lg font-black text-slate-800">Checkout Hotmart</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-600">Habilitar Hotmart</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={paymentConfig.hotmartGlobal.enabled} onChange={() => setPaymentConfig({...paymentConfig, hotmartGlobal: {...paymentConfig.hotmartGlobal, enabled: !paymentConfig.hotmartGlobal.enabled}})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {paymentConfig.hotmartGlobal.enabled && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Planes de Suscripción</div>
                      {Object.values(PlanType).map(pt => (
                        <div key={pt} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Plan {pt}</label>
                          <input type="text" className="w-full p-2 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-orange-500" placeholder="Pegar link de Hotmart..." />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listado de Negocios (Vista por defecto) */}
        {activeTab === 'businesses' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase">Negocio</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase">Plan Actual</th>
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
                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase">Gestionar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminPanel;
