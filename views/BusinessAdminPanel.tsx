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
  onLogout: () => void
}

const BusinessAdminPanel: React.FC<BusinessAdminPanelProps> = ({ 
  business, setBusinesses, products, setProducts, orders, setOrders, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'profile' | 'subscription' | 'share'>('menu');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Estados para búsqueda y filtrado de Menú
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  // Estados para búsqueda y filtrado de Pedidos
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Todos');
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPromptValue, setAiPromptValue] = useState('');
  
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    customShareImageUrl: business.customShareImageUrl || '',
    paymentMethods: business.paymentMethods || ['Efectivo'],
    paymentConfigs: business.paymentConfigs || {}
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const plan = PLANS[business.planId];
  const canUseVoiceAI = business.usage.voiceAICount < plan.maxVoiceAI;

  const publicUrl = `${window.location.origin}/?business=${profileForm.menuSlugActive ? profileForm.menuSlug : business.id}`;

  const availablePaymentMethods = [
    'Efectivo', 'Nequi', 'Daviplata', 'Bancolombia', 'Tarjeta de Crédito', 'PayPal', 'Mercado Pago', 'Bre-B'
  ];

  // Lógica de filtrado de productos (Menú)
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Lógica de filtrado de Pedidos
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
                         o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                         o.customerPhone.includes(orderSearchTerm);
    const matchesStatus = orderStatusFilter === 'Todos' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

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

  const togglePaymentMethod = (method: string) => {
    setProfileForm(prev => {
      const current = prev.paymentMethods || [];
      const updated = current.includes(method) 
        ? current.filter(m => m !== method)
        : [...current, method];
      return { ...prev, paymentMethods: updated };
    });
  };

  const updatePaymentConfig = (method: string, field: 'account' | 'instructions', value: string) => {
    setProfileForm(prev => ({
      ...prev,
      paymentConfigs: {
        ...prev.paymentConfigs,
        [method]: {
          ...(prev.paymentConfigs?.[method] || {}),
          [field]: value
        }
      }
    }));
  };

  const handlePaymentQRUpload = (e: React.ChangeEvent<HTMLInputElement>, method: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileForm(prev => ({
          ...prev,
          paymentConfigs: {
            ...prev.paymentConfigs,
            [method]: {
              ...(prev.paymentConfigs?.[method] || {}),
              qrImage: result
            }
          }
        }));
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

  const downloadQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicUrl)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${profileForm.name.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareOnWhatsApp = () => {
    const message = `${profileForm.customShareMessage}\n\n${publicUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`;
    window.open(fbUrl, '_blank');
  };

  const shareQuickCopy = (platform: string) => {
    copyToClipboard();
    alert(`¡Link copiado! Ahora puedes pegarlo en tu biografía o historias de ${platform}.`);
  };

  const executeAITextGeneration = async () => {
    if (!aiPromptValue.trim()) return;
    setAiLoading(true);
    setIsAiModalOpen(false);

    try {
      const data = await generateProductFromText(aiPromptValue);
      const img = await generateProductImage(data.name, data.description, business.type);
      
      const newProduct: Product = {
        id: `ia-${Date.now()}`,
        businessId: business.id,
        name: data.name || 'Nuevo Plato IA',
        description: data.description || '',
        price: Number(data.price) || 0,
        category: data.category || CATEGORIES[0],
        image: img,
        quantity: 10,
        status: 'active'
      };
      
      setProducts(prev => [...prev, newProduct]);
      setBusinesses(prev => prev.map(b => b.id === business.id ? { 
        ...b, 
        usage: { ...b.usage, productCount: b.usage.productCount + 1 } 
      } : b));
      setAiPromptValue('');
    } catch (error) {
      console.error("Error IA:", error);
      alert("La IA no pudo procesar tu solicitud.");
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
      setBusinesses(prev => prev.map(b => b.id === business.id ? { 
        ...b, 
        usage: { ...b.usage, productCount: b.usage.productCount + 1 } 
      } : b));
      setIsAddingProduct(false);
    }
    setTempImage(null);
  };

  const startRecording = async () => {
    if (!canUseVoiceAI) { alert('Límite alcanzado'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Error micrófono"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); }
  };

  const processAudio = async (blob: Blob) => {
    setAiLoading(true);
    try {
      const base64Audio = await blobToBase64(blob);
      const data = await generateProductFromVoice(base64Audio, business.type);
      const img = await generateProductImage(data.name, data.description, business.type);
      const newP: Product = {
        id: `v-${Date.now()}`,
        businessId: business.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: img,
        quantity: 10,
        status: 'active'
      };
      setProducts(prev => [...prev, newP]);
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, usage: { ...b.usage, productCount: b.usage.productCount + 1, voiceAICount: b.usage.voiceAICount + 1 } } : b));
    } finally { setAiLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-emerald-700 text-white flex flex-col shadow-xl shrink-0">
        <div className="p-8 flex items-center gap-4 border-b border-emerald-800">
          <img src={business.logo} className="w-12 h-12 rounded-full border-2 border-white object-cover" alt="logo" />
          <div className="font-bold text-lg truncate">{business.name}</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('menu')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'menu' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             Mi Menú
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'orders' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             Pedidos <span className="ml-auto bg-rose-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{orders.length}</span>
          </button>
          <button onClick={() => setActiveTab('share')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'share' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             Compartir
          </button>
          <button onClick={() => setActiveTab('subscription')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'subscription' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             Suscripción
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'profile' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>
             Configuración
          </button>
        </nav>
        <button onClick={onLogout} className="p-6 border-t border-emerald-800 hover:text-rose-200">Cerrar Sesión</button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <header className="flex flex-col lg:flex-row justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-800">Gestión de Menú</h2>
              <div className="flex gap-2 relative">
                <button onClick={() => setIsAddingProduct(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition shadow-sm active:scale-95">Nuevo Manual</button>
                <button onClick={() => setIsAiModalOpen(true)} disabled={aiLoading} className={`px-4 py-2 rounded-lg font-medium transition shadow-sm ${aiLoading ? 'bg-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {aiLoading ? 'Procesando...' : 'IA Texto'}
                </button>
                <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} disabled={aiLoading} className={`px-4 py-2 rounded-lg font-medium transition shadow-sm ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                  {isRecording ? 'Soltar' : 'IA Voz'}
                </button>
              </div>
            </header>

            {/* BUSCADOR Y FILTROS MENÚ */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar plato por nombre o descripción..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm"
                />
              </div>
              <div className="w-full md:w-64">
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm font-medium"
                >
                  <option value="Todas">Todas las categorías</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              {(searchTerm || categoryFilter !== 'Todas') && (
                <button 
                  onClick={() => { setSearchTerm(''); setCategoryFilter('Todas'); }}
                  className="text-xs font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition px-2"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* INFO DE RESULTADOS MENÚ */}
            <div className="flex justify-between items-center px-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border p-4 group transition hover:shadow-md animate-in fade-in duration-300">
                   <div className="h-40 relative overflow-hidden rounded-xl mb-4 bg-slate-100">
                      <img src={p.image} className="w-full h-full object-cover transition group-hover:scale-110" alt={p.name} />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-tighter text-slate-600 shadow-sm border border-white">
                        {p.category}
                      </div>
                   </div>
                   <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                   <p className="text-xs text-slate-500 line-clamp-2 h-8">{p.description}</p>
                   <div className="mt-4 flex justify-between items-center">
                     <span className="font-bold text-emerald-600">${p.price.toLocaleString()}</span>
                     <button onClick={() => setEditingProduct(p)} className="text-xs font-bold text-indigo-600 uppercase hover:bg-indigo-50 px-2 py-1 rounded-lg transition">Editar</button>
                   </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   </div>
                   <h3 className="font-bold text-slate-800">No hay platos que coincidan</h3>
                   <p className="text-sm text-slate-400 mt-1">Intenta con otros términos o cambia la categoría.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800">Gestión de Pedidos</h2>
            </header>

            {/* BUSCADOR Y FILTROS PEDIDOS */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center animate-in slide-in-from-top-2 duration-500">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar por ID, nombre cliente o teléfono..." 
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm"
                />
              </div>
              <div className="w-full md:w-64">
                <select 
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm font-medium"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="preparing">Preparando</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              {(orderSearchTerm || orderStatusFilter !== 'Todos') && (
                <button 
                  onClick={() => { setOrderSearchTerm(''); setOrderStatusFilter('Todos'); }}
                  className="text-xs font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition px-2"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* INFO DE RESULTADOS PEDIDOS */}
            <div className="flex justify-between items-center px-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Encontrados {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
              </p>
            </div>

            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest">ID / Fecha</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest">Total / Pago</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">#{o.id}</div>
                        <div className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{o.customerName}</div>
                        <div className="text-xs text-indigo-500">{o.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-emerald-600">${o.total.toLocaleString()}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">{o.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          o.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                          o.status === 'preparing' ? 'bg-indigo-100 text-indigo-600' :
                          o.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {o.status === 'pending' ? 'Pendiente' : 
                           o.status === 'preparing' ? 'Preparando' :
                           o.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin pedidos encontrados</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800">Tu Suscripción</h2>
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-3xl border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 bg-indigo-50 text-indigo-600 font-black text-xs uppercase tracking-widest rounded-bl-3xl">Plan {business.planId}</div>
                  <h3 className="text-3xl font-black text-slate-800 mb-2">{plan.name}</h3>
                  <div className="space-y-4 mt-6">
                     <div>
                        <div className="flex justify-between text-xs font-bold mb-1 uppercase text-slate-400">
                          <span>Productos</span>
                          <span>{business.usage.productCount} / {plan.maxProducts === 9999 ? '∞' : plan.maxProducts}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${Math.min((business.usage.productCount / plan.maxProducts) * 100, 100)}%` }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs font-bold mb-1 uppercase text-slate-400">
                          <span>IA Voz</span>
                          <span>{business.usage.voiceAICount} / {plan.maxVoiceAI === 9999 ? '∞' : plan.maxVoiceAI}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{ width: `${Math.min((business.usage.voiceAICount / plan.maxVoiceAI) * 100, 100)}%` }}></div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="bg-indigo-600 p-8 rounded-3xl text-white flex flex-col justify-between">
                  <h3 className="text-xl font-bold">Escala tu negocio</h3>
                  <p className="opacity-80 text-sm">Obtén productos ilimitados y soporte prioritario.</p>
                  <button className="mt-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl">Ver Planes</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="space-y-8 pb-32 animate-in fade-in duration-500">
            <header>
               <h2 className="text-3xl font-bold text-slate-800">Compartir Menú</h2>
               <p className="text-slate-500 text-sm mt-1">Personaliza cómo se ve tu menú al compartirlo y usa estas herramientas para llegar a más clientes.</p>
            </header>

            <form onSubmit={handleSaveSettings} className="space-y-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* URL PERSONALIZADA */}
                  <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
                     <div className="flex justify-between items-center border-b pb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656 5.656l-1.1 1.1"></path></svg>
                           </div>
                           <h3 className="font-bold text-slate-800">URL de Menú Personalizada</h3>
                        </div>
                        <label className="flex items-center cursor-pointer gap-2">
                           <input type="checkbox" checked={profileForm.menuSlugActive} onChange={e => setProfileForm({...profileForm, menuSlugActive: e.target.checked})} className="sr-only peer" />
                           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alias del Menú (Slug)</label>
                        <div className="flex items-center gap-2 p-4 bg-slate-50 border rounded-2xl">
                           <span className="text-sm text-slate-400 font-mono">menu.ia/</span>
                           <input 
                              disabled={!profileForm.menuSlugActive}
                              value={profileForm.menuSlug} 
                              onChange={e => setProfileForm({...profileForm, menuSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                              className="flex-1 bg-transparent outline-none font-mono text-sm disabled:opacity-50" 
                              placeholder="mi-restaurante" 
                           />
                        </div>
                        
                        <div className="pt-4 space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enlace Público Final</label>
                           <div className="flex gap-2 p-2 bg-indigo-50/50 border border-indigo-100 rounded-2xl items-center">
                              <span className="flex-1 px-4 text-xs font-mono text-indigo-600 truncate">{publicUrl}</span>
                              <button type="button" onClick={copyToClipboard} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">
                                 {copied ? 'Copiado' : 'Copiar'}
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* VISTA PREVIA REDES SOCIALES */}
                  <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
                     <div className="flex items-center gap-3 border-b pb-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 className="font-bold text-slate-800">Vista Previa en Redes Sociales</h3>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Imagen de Difusión (1200x630)</label>
                           <div className="h-40 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative group">
                              {profileForm.customShareImageUrl ? (
                                 <img src={profileForm.customShareImageUrl} className="w-full h-full object-cover" alt="preview" />
                              ) : (
                                 <div className="text-center p-4">
                                    <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <span className="text-[10px] text-slate-400 font-bold">Click para subir imagen</span>
                                 </div>
                              )}
                              <input type="file" onChange={e => handleFileChange(e, 'share')} className="absolute inset-0 opacity-0 cursor-pointer" />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mensaje de WhatsApp</label>
                           <textarea 
                              value={profileForm.customShareMessage} 
                              onChange={e => setProfileForm({...profileForm, customShareMessage: e.target.value})} 
                              className="w-full p-4 bg-slate-50 border rounded-2xl h-24 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Escribe el mensaje que tus clientes verán al compartir..."
                           />
                        </div>

                        <div className="space-y-3">
                           <button type="button" onClick={shareOnWhatsApp} className="w-full py-4 bg-[#25D366] text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:bg-[#20ba5a] transition flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                              WhatsApp
                           </button>

                           <div className="grid grid-cols-2 gap-3">
                              <button type="button" onClick={shareOnFacebook} className="py-3 bg-[#1877F2] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#166fe5] transition flex items-center justify-center gap-2">
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                 Facebook
                              </button>
                              <button type="button" onClick={() => shareQuickCopy('Instagram')} className="py-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-2">
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.365-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.607 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.607-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.365.332-2.633 1.308-3.608.975-.975 2.242-1.246 3.607-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.28.058-2.152.26-2.917.557-.79.307-1.458.718-2.122 1.381s-1.074 1.332-1.381 2.122c-.297.765-.499 1.637-.557 2.917-.059 1.28-.073 1.688-.073 4.947s.014 3.667.072 4.947c.058 1.28.26 2.152.557 2.917.307.79.718 1.458 1.381 2.122s1.332 1.074 2.122 1.381c.765.297 1.637.499 2.917.557 1.28.059 1.688.073 4.947.073s3.667-.014 4.947-.072c1.28-.058 2.152-.26 2.917-.557.79-.307 1.458-.718 2.122-1.381s1.074-1.332 1.381-2.122c.297-.765.499-1.637.557-2.917.059-1.28.073-1.688.073-4.947s-.014-3.667-.072-4.947c-.058-1.28-.26-2.152-.557-2.917-.307-.79-.718-1.458-1.381-2.122s-1.381-1.074-2.122-1.381c-.765-.297-1.637-.499-2.917-.557-1.28-.059-1.688-.073-4.947-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c0 .796-.646 1.442-1.442 1.442s-1.442-.646-1.442-1.442.646-1.442 1.442-1.442 1.442.646 1.442 1.442z"/></svg>
                                 Instagram
                              </button>
                              <button type="button" onClick={() => shareQuickCopy('TikTok')} className="py-3 bg-[#000000] text-white text-xs font-bold rounded-xl shadow-md hover:bg-slate-900 transition flex items-center justify-center gap-2 border border-slate-800">
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.59-5.71-.29-2.63.85-5.21 2.86-6.91 1.62-1.38 3.79-2.02 5.91-1.81.1.39.04.81.04 1.21-.01 1.1.02 2.2-.01 3.3-.81-.22-1.67-.18-2.43.14-.98.39-1.8 1.23-2.12 2.23-.42 1.15-.26 2.46.41 3.49.65.98 1.7 1.64 2.86 1.76 1.05.13 2.15-.1 3.05-.69.83-.52 1.44-1.34 1.62-2.3.06-1.43.02-2.86.03-4.29.01-4.66.01-9.33.01-13.99z"/></svg>
                                 TikTok
                              </button>
                              <button type="button" onClick={() => shareQuickCopy('YouTube')} className="py-3 bg-[#FF0000] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#e60000] transition flex items-center justify-center gap-2">
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                 YouTube
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* CÓDIGO QR */}
                  <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6 flex flex-col items-center justify-center text-center">
                     <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                     </div>
                     <h3 className="text-xl font-bold text-slate-800">Código QR del Menú</h3>
                     <p className="text-sm text-slate-500 max-w-xs">Imprime este código y colócalo en tus mesas para que los clientes accedan instantáneamente.</p>
                     
                     <div className="p-4 bg-white border-8 border-slate-50 rounded-[2.5rem] shadow-xl my-6">
                        <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`} 
                           className="w-48 h-48" 
                           alt="QR Code" 
                        />
                     </div>

                     <button type="button" onClick={downloadQRCode} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Descargar PNG
                     </button>
                  </div>

                  {/* INFO EXTRA / TIPS */}
                  <div className="bg-indigo-600 p-8 rounded-3xl text-white space-y-4">
                     <h3 className="text-xl font-bold">Consejos de Marketing</h3>
                     <ul className="space-y-3 opacity-90 text-sm">
                        <li className="flex gap-2">
                           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           Usa un alias corto y fácil de recordar para tu URL.
                        </li>
                        <li className="flex gap-2">
                           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           Sube una foto de tu plato estrella para la vista previa social.
                        </li>
                        <li className="flex gap-2">
                           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           Coloca el QR en la entrada y en cada mesa de tu local.
                        </li>
                     </ul>
                  </div>
               </div>

               {/* BOTÓN DE GUARDADO GLOBAL PARA LA PÁGINA */}
               <div className="flex justify-center md:justify-end">
                  <button type="submit" disabled={isSaving} className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition">
                    {isSaving ? 'Guardando Cambios...' : 'Guardar Configuración'}
                  </button>
               </div>
            </form>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8 pb-32">
            <h2 className="text-2xl font-bold text-slate-800">Configuración Completa</h2>
            <form onSubmit={handleSaveSettings} className="space-y-8">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                     {/* INFORMACIÓN BÁSICA */}
                     <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-2">Información de Contacto</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Negocio</label>
                              <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Pedidos</label>
                              <input value={profileForm.socials.whatsapp} onChange={e => setProfileForm({...profileForm, socials: {...profileForm.socials, whatsapp: e.target.value}})} className="w-full p-3 border rounded-xl bg-slate-50" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Instagram (@usuario)</label>
                              <input value={profileForm.socials.instagram} onChange={e => setProfileForm({...profileForm, socials: {...profileForm.socials, instagram: e.target.value}})} className="w-full p-3 border rounded-xl bg-slate-50" />
                           </div>
                           <div className="col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dirección Física</label>
                              <input value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50" />
                           </div>
                        </div>
                     </div>

                     {/* FINANZAS Y OPERACIONES */}
                     <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-2">Ventas y Costos</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IVA del Negocio (%)</label>
                              <input type="number" value={profileForm.iva} onChange={e => setProfileForm({...profileForm, iva: Number(e.target.value)})} className="w-full p-3 border rounded-xl bg-slate-50" />
                           </div>
                           <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Valor Domicilio Fijo</label>
                              <input type="number" value={profileForm.deliveryValue} onChange={e => setProfileForm({...profileForm, deliveryValue: Number(e.target.value)})} className="w-full p-3 border rounded-xl bg-slate-50" />
                           </div>
                        </div>
                     </div>

                     {/* OPCIONES DE PAGO - AMPLIADA CON CONFIGURACIÓN */}
                     <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-2">Opciones de Pago Disponibles</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Selecciona y configura los métodos que tus clientes verán al finalizar el pedido</p>
                        <div className="space-y-6">
                           {availablePaymentMethods.map(method => (
                              <div key={method} className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                 <button 
                                    type="button"
                                    onClick={() => togglePaymentMethod(method)}
                                    className={`w-full p-4 text-[10px] font-black uppercase tracking-widest transition flex items-center justify-between ${
                                       profileForm.paymentMethods.includes(method) 
                                          ? 'bg-emerald-50 text-emerald-700' 
                                          : 'text-slate-400 hover:bg-slate-100'
                                    }`}
                                 >
                                    <span className="flex items-center gap-3">
                                       <div className={`w-2 h-2 rounded-full ${profileForm.paymentMethods.includes(method) ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`}></div>
                                       {method}
                                    </span>
                                    {profileForm.paymentMethods.includes(method) && (
                                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    )}
                                 </button>
                                 
                                 {profileForm.paymentMethods.includes(method) && (
                                    <div className="p-6 border-t border-emerald-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                                       <div className="space-y-4">
                                          <div>
                                             <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número de Cuenta / ID</label>
                                             <input 
                                                value={profileForm.paymentConfigs?.[method]?.account || ''} 
                                                onChange={e => updatePaymentConfig(method, 'account', e.target.value)}
                                                className="w-full p-3 border rounded-xl bg-slate-50 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                                                placeholder={`Ej: Número de ${method}`}
                                             />
                                          </div>
                                          <div>
                                             <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Instrucciones de Pago</label>
                                             <textarea 
                                                value={profileForm.paymentConfigs?.[method]?.instructions || ''} 
                                                onChange={e => updatePaymentConfig(method, 'instructions', e.target.value)}
                                                className="w-full p-3 border rounded-xl bg-slate-50 text-xs h-20 resize-none focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                                                placeholder="Instrucciones para el cliente..."
                                             />
                                          </div>
                                       </div>
                                       <div className="space-y-3">
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-center block">Cargar Código QR</label>
                                          <div className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                                             {profileForm.paymentConfigs?.[method]?.qrImage ? (
                                                <img src={profileForm.paymentConfigs[method].qrImage} className="w-full h-full object-contain p-2" alt="QR Preview" />
                                             ) : (
                                                <div className="text-center opacity-40 group-hover:opacity-100 transition">
                                                   <svg className="w-8 h-8 mx-auto mb-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                   <span className="text-[8px] font-bold uppercase">Subir Imagen QR</span>
                                                </div>
                                             )}
                                             <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={e => handlePaymentQRUpload(e, method)}
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                             />
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* PERSONALIZACIÓN DE URL */}
                     <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Enlace Personalizado (Slug)</h3>
                           <label className="flex items-center cursor-pointer gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{profileForm.menuSlugActive ? 'Activo' : 'Inactivo'}</span>
                              <input type="checkbox" checked={profileForm.menuSlugActive} onChange={e => setProfileForm({...profileForm, menuSlugActive: e.target.checked})} className="sr-only peer" />
                              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                           </label>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border rounded-xl">
                           <span className="text-xs text-slate-400 font-mono">menu.ia/</span>
                           <input value={profileForm.menuSlug} onChange={e => setProfileForm({...profileForm, menuSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="flex-1 bg-transparent outline-none font-mono text-xs" placeholder="mi-negocio-vip" />
                        </div>
                     </div>

                     {/* UBICACIÓN MAPAS */}
                     <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-2">Google Maps</h3>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL Iframe de Google Maps</label>
                        <textarea value={profileForm.googleMapsIframe} onChange={e => setProfileForm({...profileForm, googleMapsIframe: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 h-20 text-xs resize-none" placeholder="Pega el src del iframe aquí..." />
                     </div>
                  </div>

                  {/* COLUMNA DE IMÁGENES */}
                  <div className="space-y-6">
                     <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block w-full text-center">Logo Principal</label>
                        <img src={profileForm.logo} className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-lg object-cover mb-4" />
                        <input type="file" onChange={e => handleFileChange(e, 'logo')} className="text-[10px] text-slate-400 cursor-pointer" />
                     </div>

                     <div className="bg-white p-6 rounded-3xl border shadow-sm">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block">Banner del Menú</label>
                        <div className="h-28 bg-slate-50 rounded-2xl overflow-hidden border mb-4">
                           <img src={profileForm.banner} className="w-full h-full object-cover" />
                        </div>
                        <input type="file" onChange={e => handleFileChange(e, 'banner')} className="text-[10px] text-slate-400 cursor-pointer" />
                     </div>

                     <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest border-b pb-2">Disfusión de WhatsApp</h3>
                        <textarea value={profileForm.customShareMessage} onChange={e => setProfileForm({...profileForm, customShareMessage: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 h-24 text-xs resize-none" />
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Imagen de Compartir</label>
                        {profileForm.customShareImageUrl && <img src={profileForm.customShareImageUrl} className="h-20 w-full object-cover rounded-xl mb-2" />}
                        <input type="file" onChange={e => handleFileChange(e, 'share')} className="text-[10px] text-slate-400" />
                     </div>
                  </div>
               </div>

               {/* BOTÓN DE GUARDADO AL FINAL DE LA PÁGINA */}
               <div className="flex justify-center md:justify-end">
                  <button type="submit" disabled={isSaving} className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition">
                    {isSaving ? 'Guardando Cambios...' : 'Guardar Configuración'}
                  </button>
               </div>
            </form>
          </div>
        )}

        {isAiModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-xl font-bold mb-4 text-slate-800">Crea con Inteligencia Artificial</h3>
                <p className="text-sm text-slate-500 mb-6">Describe el plato y la IA hará el resto.</p>
                <textarea autoFocus className="w-full p-4 bg-slate-50 border rounded-2xl h-32 outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-6" placeholder="Ej: Pizza Napolitana con masa madre..." value={aiPromptValue} onChange={(e) => setAiPromptValue(e.target.value)} />
                <div className="flex gap-3">
                   <button onClick={() => { setIsAiModalOpen(false); setAiPromptValue(''); }} className="flex-1 py-3 text-slate-400 font-bold">Cancelar</button>
                   <button onClick={executeAITextGeneration} disabled={!aiPromptValue.trim()} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Generar Producto</button>
                </div>
             </div>
          </div>
        )}

        {(isAddingProduct || editingProduct) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xl font-bold mb-6 text-slate-800">{editingProduct ? 'Editar Plato' : 'Nuevo Plato'}</h3>
                <form onSubmit={handleManualAddOrEdit} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre</label>
                        <input required name="name" defaultValue={editingProduct?.name} className="w-full p-3 border rounded-xl bg-slate-50" />
                     </div>
                     <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Descripción</label>
                        <textarea required name="description" defaultValue={editingProduct?.description} className="w-full p-3 border rounded-xl bg-slate-50 h-24 resize-none" />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Precio</label>
                        <input required name="price" type="number" defaultValue={editingProduct?.price} className="w-full p-3 border rounded-xl bg-slate-50" />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Categoría</label>
                        <select name="category" defaultValue={editingProduct?.category || CATEGORIES[0]} className="w-full p-3 border rounded-xl bg-slate-50">
                           {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                   </div>
                   <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition">Cancelar</button>
                     <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition">Guardar</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  )
};

export default BusinessAdminPanel;