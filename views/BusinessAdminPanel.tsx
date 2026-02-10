
import React, { useState, useRef } from 'react';
import { Business, Product, Order, PlanType, Plan, HybridPlan } from '../types';
import { PLANS, CATEGORIES, MOCK_HYBRID_PLANS } from '../constants';
import { generateProductFromText, generateProductFromVoice, generateProductImage } from '../geminiService';

interface BusinessAdminPanelProps {
  business: Business;
  setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onLogout: () => void;
}

const BusinessAdminPanel: React.FC<BusinessAdminPanelProps> = ({ 
  business, setBusinesses, products, setProducts, orders, setOrders, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'profile' | 'subscription' | 'share'>('menu');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // States for Profile and Share configuration
  const [profileForm, setProfileForm] = useState<Business>({ 
    ...business,
    iva: business.iva ?? 0,
    deliveryValue: business.deliveryValue ?? 0,
    avatar: business.avatar || 'https://i.pravatar.cc/150',
    banner: business.banner || 'https://picsum.photos/seed/defaultbanner/1200/400',
    googleMapsIframe: business.googleMapsIframe || '',
    menuSlug: business.menuSlug || business.name.toLowerCase().replace(/\s+/g, '-'),
    menuSlugActive: business.menuSlugActive ?? false,
    customShareMessage: business.customShareMessage || `¡Hola! Te comparto nuestro menú digital. Haz tu pedido aquí:`,
    customShareImageUrl: business.customShareImageUrl || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const plan = PLANS[business.planId];
  const hybridPlan = MOCK_HYBRID_PLANS.find(p => p.id === business.hybridPlanId);
  const canUseVoiceAI = business.usage.voiceAICount < plan.maxVoiceAI;

  const publicUrl = `https://menuai.saas/menu/${profileForm.menuSlugActive ? profileForm.menuSlug : business.id}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'avatar' | 'banner' | 'share' | 'product' = 'product') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') setProfileForm(prev => ({ ...prev, logo: result }));
        else if (type === 'avatar') setProfileForm(prev => ({ ...prev, avatar: result }));
        else if (type === 'banner') setProfileForm(prev => ({ ...prev, banner: result }));
        else if (type === 'share') setProfileForm(prev => ({ ...prev, customShareImageUrl: result }));
        else setTempImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setBusinesses(prev => prev.map(b => b.id === business.id ? profileForm : b));
      setIsSaving(false);
      alert('Configuración guardada correctamente.');
    }, 800);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`${profileForm.customShareMessage}\n${publicUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setProfileForm({ ...profileForm, menuSlug: val });
  };

  const handleAIText = async () => {
    const prompt = window.prompt("Describe el plato que deseas agregar (ej: Hamburguesa Especial con doble queso y tocino, $25.000)");
    if (!prompt) return;

    setAiLoading(true);
    try {
      const productData = await generateProductFromText(prompt);
      const imageUrl = await generateProductImage(productData.name, productData.description, business.type);
      
      const newP: Product = {
        id: Math.random().toString(36).substr(2, 9),
        businessId: business.id,
        ...productData,
        image: imageUrl,
        status: 'active'
      };
      
      setProducts(prev => [...prev, newP]);
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, usage: { ...b.usage, productCount: b.usage.productCount + 1 } } : b));
    } catch (error) {
      console.error("Error al generar con IA:", error);
      alert("Hubo un error al procesar con IA. Por favor intenta de nuevo.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleManualAddOrEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      quantity: Number(formData.get('quantity')),
      status: 'active' as const
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData, image: tempImage || p.image } : p));
      setEditingProduct(null);
    } else {
      const newP: Product = {
        id: Math.random().toString(36).substr(2, 9),
        businessId: business.id,
        ...productData,
        image: tempImage || 'https://picsum.photos/400/300'
      };
      setProducts(prev => [...prev, newP]);
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, usage: { ...b.usage, productCount: b.usage.productCount + 1 } } : b));
      setIsAddingProduct(false);
    }
    setTempImage(null);
  };

  const startRecording = async () => {
    if (!canUseVoiceAI) return alert('Límite de IA alcanzado');
    setIsRecording(true);
    // Logic for capturing audio would go here
    setTimeout(() => setIsRecording(false), 2000);
  };

  const stopRecording = () => setIsRecording(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-emerald-700 text-white flex flex-col shadow-xl shrink-0">
        <div className="p-8 flex items-center gap-4 border-b border-emerald-800">
          <img src={business.logo} className="w-12 h-12 rounded-full border-2 border-white object-cover" alt="logo" />
          <div className="font-bold text-lg truncate">{business.name}</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('menu')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'menu' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
             Mi Menú
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'orders' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
             Pedidos <span className="ml-auto bg-rose-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{orders.filter(o => o.status === 'pending').length}</span>
          </button>
          <button onClick={() => setActiveTab('share')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'share' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
             Compartir Menú
          </button>
          <button onClick={() => setActiveTab('subscription')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'subscription' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
             Suscripción
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'profile' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
             Configuración
          </button>
        </nav>
        <button onClick={onLogout} className="p-6 border-t border-emerald-800 text-left text-sm font-medium hover:text-rose-200">Cerrar Sesión</button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {(activeTab === 'share' || activeTab === 'profile') && (
           <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">{activeTab === 'share' ? 'Compartir Menú' : 'Configuración'}</h2>
                <p className="text-slate-500 text-sm">Gestiona cómo ven tus clientes tu negocio en la web.</p>
              </div>
              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg transition ${isSaving ? 'opacity-50 animate-pulse' : 'hover:bg-indigo-700 active:scale-95'}`}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
           </header>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <header className="flex flex-col lg:flex-row justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-800">Gestión de Menú</h2>
              <div className="flex gap-2">
                <button onClick={() => setIsAddingProduct(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Nuevo Manual</button>
                <button 
                  onClick={handleAIText} 
                  disabled={aiLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition ${aiLoading ? 'bg-slate-300 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  {aiLoading ? 'Generando...' : 'IA Texto'}
                </button>
                <button onMouseDown={startRecording} onMouseUp={stopRecording} className={`px-4 py-2 rounded-lg font-medium transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                  {isRecording ? 'Grabando...' : 'IA Voz'}
                </button>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border p-4 group transition hover:shadow-md">
                   <img src={p.image} className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-[1.02] transition" />
                   <h3 className="font-bold">{p.name}</h3>
                   <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                   <div className="mt-4 flex justify-between items-center">
                     <span className="font-bold text-emerald-600">${p.price}</span>
                     <button onClick={() => setEditingProduct(p)} className="text-xs font-bold text-indigo-600 uppercase">Editar</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 pb-20">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656 5.656l1.1 1.1"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">URL Personalizada</h3>
                    <p className="text-xs text-slate-400 font-medium">Usa un alias fácil de recordar.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={profileForm.menuSlugActive} onChange={() => setProfileForm({...profileForm, menuSlugActive: !profileForm.menuSlugActive})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <div className="space-y-4">
                <div className={`transition-opacity ${profileForm.menuSlugActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alias del Menú</label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-medium text-sm">/menu/</span>
                    <input type="text" value={profileForm.menuSlug} onChange={handleSlugChange} className="w-full pl-16 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" placeholder="nombre-de-tu-negocio" />
                  </div>
                </div>
                <div className="p-6 bg-slate-900 rounded-[1.5rem] text-white">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Enlace Público</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium truncate opacity-80">{publicUrl}</span>
                    <button onClick={copyToClipboard} className={`shrink-0 p-3 rounded-xl transition ${copied ? 'bg-emerald-500' : 'bg-white/10 hover:bg-white/20'}`}>
                      {copied ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>) : (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Código QR del Menú</h3>
                <p className="text-xs text-slate-400">Descarga e imprime para tus mesas.</p>
              </div>
              <div className="w-48 h-48 bg-slate-50 rounded-3xl p-4 border border-slate-100 shadow-inner flex items-center justify-center">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`} className="w-full h-full object-contain mix-blend-multiply" alt="QR Code" />
              </div>
              <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 px-6 py-2 rounded-full transition">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Descargar QR (PNG)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl space-y-10 animate-in fade-in duration-500 pb-20">
             <form className="space-y-10">
                {/* IDENTIDAD VISUAL */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                   <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Identidad del Negocio</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <img src={profileForm.logo} className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-50 shadow-md group-hover:opacity-70 transition cursor-pointer" onClick={() => document.getElementById('logo-up')?.click()} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Logo Principal</label>
                          <input id="logo-up" type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
                          <p className="text-xs text-slate-400 mt-1">PNG o JPG cuadrado.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <img src={profileForm.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md group-hover:opacity-70 transition cursor-pointer" onClick={() => document.getElementById('avatar-up')?.click()} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Avatar Admin</label>
                          <input id="avatar-up" type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'avatar')} />
                        </div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Banner del Menú</label>
                      <div className="relative h-48 rounded-3xl overflow-hidden border-2 border-slate-50 group cursor-pointer" onClick={() => document.getElementById('banner-up')?.click()}>
                        <img src={profileForm.banner} className="w-full h-full object-cover transition group-hover:scale-105" />
                      </div>
                      <input id="banner-up" type="file" hidden accept="image/*" onChange={e => handleFileChange(e, 'banner')} />
                   </div>
                </div>

                {/* INFORMACIÓN DE CONTACTO */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                   <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Contacto y Ubicación</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                        <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Público</label>
                        <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                        <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ubicación</label>
                        <input type="text" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Instagram</label>
                        <input type="text" placeholder="@usuario" value={profileForm.socials.instagram} onChange={e => setProfileForm({...profileForm, socials: {...profileForm.socials, instagram: e.target.value}})} className="w-full p-4 bg-pink-50/50 border border-pink-100 rounded-2xl outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Pedidos</label>
                        <input type="text" value={profileForm.socials.whatsapp} onChange={e => setProfileForm({...profileForm, socials: {...profileForm.socials, whatsapp: e.target.value}})} className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl outline-none" />
                      </div>
                   </div>
                </div>

                {/* CONFIGURACIÓN OPERATIVA */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                   <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Parámetros Operativos</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IVA (%)</label>
                        <input type="number" value={profileForm.iva} onChange={e => setProfileForm({...profileForm, iva: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Valor Domicilio</label>
                        <input type="number" value={profileForm.deliveryValue} onChange={e => setProfileForm({...profileForm, deliveryValue: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
                      </div>
                   </div>
                   <div className="space-y-2 pt-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Google Maps Iframe</label>
                      <textarea value={profileForm.googleMapsIframe} onChange={e => setProfileForm({...profileForm, googleMapsIframe: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none h-24 text-xs font-mono" placeholder="<iframe>...</iframe>" />
                   </div>
                </div>
             </form>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
             <header>
                <h2 className="text-2xl font-bold text-slate-800">Tu Plan de Suscripción</h2>
                <p className="text-slate-500 text-sm">Gestiona cómo pagas por el servicio y descubre nuevos modelos híbridos.</p>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-indigo-500 relative">
                   <div className="absolute -top-3 left-8 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Plan Actual</div>
                   <h3 className="text-2xl font-black text-slate-800 mb-2">{business.hybridPlanId ? 'Híbrido' : `Fijo: ${plan.name}`}</h3>
                   <p className="text-sm text-slate-500 mb-6">Disfrutas de todas las funcionalidades activas.</p>
                   <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-end">
                         <span className="text-xs font-bold text-slate-400 uppercase">Cargo Fijo</span>
                         <span className="text-3xl font-black text-indigo-600">${business.hybridPlanId ? hybridPlan?.basePrice : plan.price}<span className="text-sm font-normal text-slate-400">/mes</span></span>
                      </div>
                      {business.hybridPlanId && (
                         <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                            <span className="text-xs font-bold text-slate-400 uppercase">Comisión por Pedido</span>
                            <span className="text-xl font-black text-indigo-400">${hybridPlan?.pricePerOrder}<span className="text-xs font-normal">/unidad</span></span>
                         </div>
                      )}
                   </div>
                   <ul className="space-y-2 mb-8">
                      {(business.hybridPlanId ? hybridPlan?.features : plan.features)?.map(f => (
                        <li key={f} className="text-xs flex items-center gap-2 text-slate-600">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          {f}
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="space-y-4">
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">Explorar Planes Híbridos</h4>
                   {MOCK_HYBRID_PLANS.filter(hp => hp.id !== business.hybridPlanId).map(hp => (
                     <div key={hp.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 transition cursor-pointer">
                        <div className="flex justify-between items-center mb-2">
                           <h5 className="font-black text-slate-800">{hp.name}</h5>
                           {hp.isPopular && <span className="bg-amber-100 text-amber-700 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Popular</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mb-4">{hp.description}</p>
                        <div className="flex justify-between items-center mb-4">
                           <div className="text-sm font-black">${hp.basePrice} base <span className="text-slate-300 font-normal">+</span> ${hp.pricePerOrder} orden</div>
                        </div>
                        <button className="w-full py-2 bg-slate-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-600 hover:text-white transition">Cambiar a este Plan</button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>

      {(isAddingProduct || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">{editingProduct ? 'Editar Plato' : 'Nuevo Plato'}</h3>
              <form onSubmit={handleManualAddOrEdit} className="space-y-4">
                 <input required name="name" defaultValue={editingProduct?.name} className="w-full p-3 border rounded-xl" placeholder="Nombre" />
                 <textarea required name="description" defaultValue={editingProduct?.description} className="w-full p-3 border rounded-xl" placeholder="Descripción" />
                 <input required name="price" type="number" defaultValue={editingProduct?.price} className="w-full p-3 border rounded-xl" placeholder="Precio" />
                 <input required name="quantity" type="number" defaultValue={editingProduct?.quantity ?? 10} className="w-full p-3 border rounded-xl" placeholder="Stock" />
                 <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl">Guardar Producto</button>
                 <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="w-full py-2 text-slate-400">Cancelar</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BusinessAdminPanel;
