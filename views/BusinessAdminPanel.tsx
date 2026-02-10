
import React, { useState, useRef } from 'react';
import { Business, Product, Order, PlanType, Plan } from '../types';
import { PLANS, CATEGORIES } from '../constants';
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
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'profile'>('menu');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isAITextModalOpen, setIsAITextModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  
  // States for Profile configuration
  const [profileForm, setProfileForm] = useState<Business>({ 
    ...business,
    iva: business.iva ?? 0,
    deliveryValue: business.deliveryValue ?? 0,
    avatar: business.avatar || 'https://i.pravatar.cc/150',
    banner: business.banner || 'https://picsum.photos/seed/defaultbanner/1200/400',
    googleMapsIframe: business.googleMapsIframe || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isHoldingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const plan = PLANS[business.planId];
  const canAddProduct = products.length < plan.maxProducts;
  const canUseVoiceAI = business.usage.voiceAICount < plan.maxVoiceAI;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'avatar' | 'banner' | 'product' = 'product') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') setProfileForm(prev => ({ ...prev, logo: result }));
        else if (type === 'avatar') setProfileForm(prev => ({ ...prev, avatar: result }));
        else if (type === 'banner') setProfileForm(prev => ({ ...prev, banner: result }));
        else setTempImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateMapIframe = (input: string): string => {
    if (!input.trim()) return '';
    if (!input.includes('<iframe')) {
      throw new Error("El código debe empezar con una etiqueta <iframe.");
    }
    const srcMatch = input.match(/src="([^"]+)"/);
    if (!srcMatch || !srcMatch[1]) {
      throw new Error("No se encontró un atributo 'src' válido en el iframe.");
    }
    const src = srcMatch[1];
    if (!src.startsWith('https://www.google.com/maps/embed')) {
      throw new Error("La fuente del mapa debe ser de https://www.google.com/maps/embed.");
    }
    return src;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMapError(null);
    try {
      const sanitizedSrc = validateMapIframe(profileForm.googleMapsIframe || '');
      const finalForm = { ...profileForm, googleMapsIframe: sanitizedSrc };
      setIsSavingProfile(true);
      setTimeout(() => {
        setBusinesses(prev => prev.map(b => b.id === business.id ? finalForm : b));
        setIsSavingProfile(false);
        alert('Configuración guardada correctamente.');
      }, 800);
    } catch (err: any) {
      setMapError(err.message);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setProfileForm(prev => {
      const methods = prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method];
      return { ...prev, paymentMethods: methods };
    });
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'preparing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
    }
  };

  const handleManualAddOrEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get('quantity'));
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      quantity: quantity,
      status: (quantity > 0 ? 'active' : 'inactive') as 'active' | 'inactive'
    };
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData, image: tempImage || p.image } : p));
      setEditingProduct(null);
    } else {
      if (!canAddProduct) return alert('Límite de platos alcanzado.');
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        businessId: business.id,
        ...productData,
        image: tempImage || 'https://picsum.photos/seed/' + Math.random() + '/400/300',
      };
      setProducts(prev => [...prev, newProduct]);
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, usage: { ...b.usage, productCount: b.usage.productCount + 1 } } : b));
      setIsAddingProduct(false);
    }
    setTempImage(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este plato?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, usage: { ...b.usage, productCount: Math.max(0, b.usage.productCount - 1) } } : b));
      setOpenMenuId(null);
    }
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        if (p.quantity <= 0 && p.status === 'inactive') {
          alert('No puedes activar un producto sin stock. Aumenta la cantidad primero.');
          return p;
        }
        return { ...p, status: p.status === 'active' ? 'inactive' : 'active' };
      }
      return p;
    }));
    setOpenMenuId(null);
  };

  const handleAITextSubmit = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setIsAITextModalOpen(false);
    try {
      const data = await generateProductFromText(aiPrompt);
      if (!data || !data.name) throw new Error("Datos de IA inválidos");
      const imageUrl = await generateProductImage(data.name, data.description, business.type);
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        businessId: business.id,
        ...data,
        quantity: 10,
        image: imageUrl,
        status: 'active'
      };
      setProducts(prev => [...prev, newProduct]);
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, usage: { ...b.usage, productCount: b.usage.productCount + 1 } } : b));
    } catch (e) {
      console.error(e);
      alert('Error al generar con IA. Intenta de nuevo.');
    } finally {
      setAiLoading(false);
      setAiPrompt('');
    }
  };

  const startRecording = async () => {
    if (!canUseVoiceAI) return alert('Límite de IA Voz alcanzado.');
    if (!canAddProduct) return alert('Límite de platos alcanzado.');
    if (aiLoading) return;
    isHoldingRef.current = true;
    setIsRecording(true);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isHoldingRef.current) {
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        return;
      }
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (audioChunksRef.current.length === 0) {
          setAiLoading(false);
          return;
        }
        setAiLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64Audio = (reader.result as string).split(',')[1];
            const data = await generateProductFromVoice(base64Audio, business.type);
            if (!data || !data.name) throw new Error("IA no pudo interpretar el audio");
            const imageUrl = await generateProductImage(data.name, data.description, business.type);
            const newProduct: Product = {
              id: Math.random().toString(36).substr(2, 9),
              businessId: business.id,
              ...data,
              quantity: 10,
              image: imageUrl,
              status: 'active'
            };
            setProducts(prev => [...prev, newProduct]);
            setBusinesses(prev => prev.map(b => b.id === business.id ? { 
              ...b, 
              usage: { productCount: b.usage.productCount + 1, voiceAICount: b.usage.voiceAICount + 1 } 
            } : b));
          } catch (e) {
            console.error(e);
            alert('Error procesando voz. Intenta de nuevo.');
          } finally {
            setAiLoading(false);
          }
        };
      };
      mediaRecorder.start();
    } catch (err) {
      setIsRecording(false);
      isHoldingRef.current = false;
      alert('Error al acceder al micrófono.');
    }
  };

  const stopRecording = () => {
    isHoldingRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-emerald-700 text-white flex flex-col shadow-xl shrink-0">
        <div className="p-8 flex items-center gap-4 border-b border-emerald-800">
          <img src={business.logo} className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover" alt="logo" />
          <div className="font-bold text-lg overflow-hidden text-ellipsis whitespace-nowrap">{business.name}</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('menu')} className={`w-full text-left p-3 rounded-lg transition ${activeTab === 'menu' ? 'bg-emerald-800 shadow-inner font-bold' : 'hover:bg-emerald-600'}`}>Mi Menú</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-3 rounded-lg transition ${activeTab === 'orders' ? 'bg-emerald-800 shadow-inner font-bold' : 'hover:bg-emerald-600'}`}>Pedidos <span className="float-right bg-rose-500 text-xs px-2 rounded-full font-bold">{orders.filter(o => o.status === 'pending').length}</span></button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-lg transition ${activeTab === 'profile' ? 'bg-emerald-800 shadow-inner font-bold' : 'hover:bg-emerald-600'}`}>Configuración</button>
        </nav>
        <div className="p-4 border-t border-emerald-800">
           <div className="text-xs opacity-60 uppercase mb-2 tracking-wider font-bold">Plan {plan.name}</div>
           <div className="bg-emerald-900/50 rounded-lg p-3 space-y-2">
              <div className="text-[10px] flex justify-between"><span>Platos</span><span>{business.usage.productCount}/{plan.maxProducts}</span></div>
              <div className="h-1 bg-emerald-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 transition-all duration-500" style={{width: `${Math.min(100, (business.usage.productCount/plan.maxProducts)*100)}%`}}></div>
              </div>
              <div className="text-[10px] flex justify-between"><span>IA Voz</span><span>{business.usage.voiceAICount}/{plan.maxVoiceAI}</span></div>
              <div className="h-1 bg-emerald-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-500" style={{width: `${Math.min(100, (business.usage.voiceAICount/plan.maxVoiceAI)*100)}%`}}></div>
              </div>
           </div>
        </div>
        <button onClick={onLogout} className="p-6 border-t border-emerald-800 hover:text-rose-200 transition text-left text-sm font-medium">Cerrar Sesión</button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800">Gestión de Menú</h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => { setEditingProduct(null); setIsAddingProduct(true); setTempImage(null); }}
                  disabled={!canAddProduct || aiLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 font-medium"
                >
                  Nuevo Manual
                </button>
                <button 
                  onClick={() => setIsAITextModalOpen(true)}
                  disabled={!canAddProduct || aiLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2 disabled:opacity-50 font-medium"
                >
                  Crear con IA
                </button>
                <button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                  disabled={!canAddProduct || !canUseVoiceAI || aiLoading}
                  className={`px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50 font-medium ${isRecording ? 'bg-red-500 text-white animate-pulse scale-105' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                >
                  {isRecording ? 'Grabando...' : 'IA Voz (Mantener)'}
                </button>
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all relative">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} loading="lazy" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-bold shadow-sm uppercase tracking-wider">{p.category}</div>
                    <div className="absolute top-2 right-2">
                       <button onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition text-slate-700">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                       </button>
                       {openMenuId === p.id && (
                         <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1 animate-in fade-in zoom-in duration-200">
                            <button onClick={() => { setViewingProduct(p); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50">Detalles</button>
                            <button onClick={() => { setEditingProduct(p); setOpenMenuId(null); setTempImage(p.image); }} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50">Editar</button>
                            <button onClick={() => toggleProductStatus(p.id)} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50">{p.status === 'active' ? 'Desactivar' : 'Activar'}</button>
                            <hr className="my-1 border-slate-50" />
                            <button onClick={() => handleDeleteProduct(p.id)} className="w-full text-left px-4 py-2 text-xs hover:bg-rose-50 text-rose-600">Eliminar</button>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3 className="font-bold text-base text-slate-800 truncate">{p.name}</h3>
                      <span className="text-emerald-600 font-bold shrink-0">${p.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2 h-8">{p.description}</p>
                    <div className="flex justify-between items-center text-[10px] mb-3">
                       <span className="text-slate-400">Stock: <span className={`font-bold ${p.quantity <= 3 ? 'text-rose-500' : 'text-slate-600'}`}>{p.quantity} und.</span></span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.status === 'active' ? 'Publicado' : 'Oculto'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders View */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Gestión de Pedidos</h2>
              <div className="flex gap-2">
                 <div className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                   TOTAL: {orders.length} pedidos
                 </div>
              </div>
            </header>
            <div className="grid grid-cols-1 gap-6">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
                   <h3 className="text-slate-800 font-bold text-lg">No hay pedidos registrados</h3>
                   <p className="text-slate-400">Cuando tus clientes realicen pedidos desde el menú público, aparecerán aquí.</p>
                </div>
              ) : (
                orders.sort((a, b) => b.createdAt - a.createdAt).map(order => (
                  <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition">
                     <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-50">
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">#{order.id}</span>
                           <span className="text-[10px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{order.customerName}</h3>
                        <p className="text-sm text-slate-500 mb-4">{order.customerPhone}</p>
                        <div className={`text-xs font-bold border px-3 py-1.5 rounded-full inline-block ${getStatusColor(order.status)}`}>
                           {getStatusLabel(order.status)}
                        </div>
                     </div>
                     <div className="p-6 flex-1 bg-slate-50/30">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Productos del Pedido</div>
                        <ul className="space-y-2">
                           {order.items.map((item, idx) => (
                             <li key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-slate-700 font-medium"><span className="text-indigo-600 font-bold mr-1">{item.quantity}x</span> {item.name}</span>
                                <span className="text-slate-400">${item.price.toFixed(2)}</span>
                             </li>
                           ))}
                        </ul>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-400">Total a Pagar ({order.paymentMethod})</span>
                           <span className="text-2xl font-black text-slate-800">${order.total.toFixed(2)}</span>
                        </div>
                     </div>
                     <div className="p-6 md:w-64 flex flex-col justify-center gap-2 bg-slate-50/50">
                        {order.status === 'pending' && (
                           <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition text-sm">Preparar Pedido</button>
                        )}
                        {order.status === 'preparing' && (
                           <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition text-sm">Marcar Entregado</button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                           <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="w-full py-2 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition text-xs">Cancelar Pedido</button>
                        )}
                        <a 
                          href={`https://wa.me/${order.customerPhone}?text=${encodeURIComponent(`Hola ${order.customerName}, te contactamos de ${business.name} sobre tu pedido #${order.id}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-xs flex items-center justify-center gap-2"
                        >
                           Contactar WhatsApp
                        </a>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Configuration View */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-2xl font-bold text-slate-800">Configuración del Negocio</h2>
              <p className="text-slate-500 text-sm">Personaliza la información pública, financiera y gráfica de tu negocio.</p>
            </header>

            <form onSubmit={handleSaveProfile} className="space-y-6 pb-20">
              {/* Graphics Section */}
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Identidad Visual
                </h3>
                <div className="mb-8 group">
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-2">Banner de Cabecera</label>
                   <div className="relative h-48 w-full bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                      <img src={profileForm.banner} className="w-full h-full object-cover" alt="banner" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                         <span className="text-xs font-bold uppercase">Subir Banner desde PC</span>
                      </div>
                   </div>
                   <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="shrink-0 flex flex-col items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Logo</label>
                    <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                       <img src={profileForm.logo} className="w-full h-full object-cover" alt="logo" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition text-[8px] font-bold text-center p-2 uppercase">Subir Logo desde PC</div>
                    </div>
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Avatar Admin</label>
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                       <img src={profileForm.avatar} className="w-full h-full object-cover" alt="avatar" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition text-[8px] font-bold text-center p-2 uppercase">Subir Avatar desde PC</div>
                    </div>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Comercial</label>
                      <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tipo de Negocio</label>
                      <select value={profileForm.type} onChange={e => setProfileForm({...profileForm, type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition">
                         <option>Restaurante</option>
                         <option>Cafetería</option>
                         <option>Tienda de Ropa</option>
                         <option>Servicios Técnicos</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Information Section */}
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email de Administración</label>
                      <input required type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Teléfono Principal</label>
                      <input required type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Dirección Física</label>
                      <input required type="text" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                    </div>
                </div>
              </section>

              {/* Financial Section */}
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2v14a2 2 0 002 2z"></path></svg>
                  Configuración Financiera
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Impuesto (IVA %)</label>
                    <div className="relative">
                      <input type="number" step="0.1" value={profileForm.iva} onChange={e => setProfileForm({...profileForm, iva: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Ej: 19" />
                      <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Valor de Domicilio ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                      <input type="number" value={profileForm.deliveryValue} onChange={e => setProfileForm({...profileForm, deliveryValue: Number(e.target.value)})} className="w-full p-2.5 pl-7 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Ej: 5000" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Redes Sociales - RESTAURADA */}
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  Redes Sociales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">WhatsApp (Pedidos)</label>
                    <input type="tel" value={profileForm.socials.whatsapp || ''} onChange={e => setProfileForm({...profileForm, socials: { ...profileForm.socials, whatsapp: e.target.value }})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Ej: 3001234567" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Instagram (@usuario)</label>
                    <input type="text" value={profileForm.socials.instagram || ''} onChange={e => setProfileForm({...profileForm, socials: { ...profileForm.socials, instagram: e.target.value }})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="@tu_negocio" />
                  </div>
                </div>
              </section>

              {/* Métodos de Pago - RESTAURADA */}
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Métodos de Pago Habilitados
                </h3>
                <p className="text-xs text-slate-400 mb-6">Selecciona los métodos que verán tus clientes al finalizar la compra.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Pago contra entrega', 'Nequi', 'Daviplata', 'Bancolombia'].map(method => (
                    <button key={method} type="button" onClick={() => togglePaymentMethod(method)} className={`p-4 rounded-2xl border text-sm font-bold flex flex-col items-center gap-2 transition ${profileForm.paymentMethods.includes(method) ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${profileForm.paymentMethods.includes(method) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                          {profileForm.paymentMethods.includes(method) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>}
                       </div>
                       {method}
                    </button>
                  ))}
                </div>
              </section>

              {/* Google Maps - RESTAURADA */}
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Ubicación en Google Maps
                </h3>
                <p className="text-xs text-slate-400 mb-4">Pega aquí el código de inserción de Google Maps (<span className="font-mono">&lt;iframe...&gt;</span>).</p>
                <div className="space-y-4">
                   <textarea 
                     value={profileForm.googleMapsIframe} 
                     onChange={e => setProfileForm({...profileForm, googleMapsIframe: e.target.value})}
                     className={`w-full h-24 p-4 font-mono text-[10px] bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition ${mapError ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                     placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" ...></iframe>'
                   />
                   {mapError && <p className="text-xs text-rose-500 font-bold ml-1">{mapError}</p>}
                   {profileForm.googleMapsIframe && !mapError && (
                     <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner h-48 bg-slate-50 relative">
                        <iframe 
                          src={profileForm.googleMapsIframe} 
                          className="w-full h-full border-0 pointer-events-none opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                           <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 shadow-sm">VISTA PREVIA DE SOLO LECTURA</span>
                        </div>
                     </div>
                   )}
                </div>
              </section>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => { setProfileForm({...business}); setMapError(null); }} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition">Descartar Cambios</button>
                <button type="submit" disabled={isSavingProfile} className="px-10 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2 disabled:opacity-50 transition-all">
                  {isSavingProfile ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modales existentes se mantienen igual */}
        {(isAddingProduct || editingProduct) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); setTempImage(null); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleManualAddOrEdit} className="p-6 space-y-4">
                <div className="relative h-40 bg-slate-100 rounded-2xl overflow-hidden group cursor-pointer border-2 border-dashed border-slate-300" onClick={() => fileInputRef.current?.click()}>
                   {tempImage ? (
                     <img src={tempImage} className="w-full h-full object-cover" alt="preview" />
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-xs font-medium">Subir Imagen desde PC</span>
                     </div>
                   )}
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e)} />
                </div>
                <input required name="name" type="text" defaultValue={editingProduct?.name || ''} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nombre" />
                <textarea required name="description" rows={3} defaultValue={editingProduct?.description || ''} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Descripción" />
                <div className="grid grid-cols-2 gap-4">
                  <input required name="price" type="number" step="0.01" defaultValue={editingProduct?.price || ''} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Precio" />
                  <select name="category" defaultValue={editingProduct?.category || 'Platos Fuertes'} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input required name="quantity" type="number" defaultValue={editingProduct?.quantity ?? 10} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Cantidad" />
                <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all">
                  {editingProduct ? 'Guardar Cambios' : 'Crear Plato'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessAdminPanel;
