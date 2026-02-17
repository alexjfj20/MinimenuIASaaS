
import React, { useState, useRef, useEffect } from 'react';
import { Business, Product, Order, PlanType } from '../types';
import { PLANS, CATEGORIES } from '../constants';
import { generateProductFromText, generateProductFromVoice, generateProductImage } from '../geminiService';
import { productService } from '../services/productService';
import { businessService } from '../services/businessService';
import { orderService } from '../services/orderService';
import { storageService } from '../services/storageService';
import TablesManager from '../components/TablesManager';
import NotificationModal, { NotificationType } from '../components/NotificationModal';

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
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'tables' | 'profile' | 'subscription' | 'share'>('menu');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [isSavingShare, setIsSavingShare] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAddingByTextIA, setIsAddingByTextIA] = useState(false);
  const [textAiPrompt, setTextAiPrompt] = useState('');

  // Formulario para nuevo producto manual
  const [newProdForm, setNewProdForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: CATEGORIES[0]
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Estados de Marketing/Compartir
  const [shareConfig, setShareConfig] = useState({
    menuSlug: business.menuSlug || '',
    menuSlugActive: business.menuSlugActive || false,
    customShareMessage: business.customShareMessage || `¡Hola! Te invito a conocer nuestro menú digital.`
  });

  // Estado para el Perfil (Configuración)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Business>(business);

  // Sincronizar form si el prop business cambia (ej: tras un save exitoso)
  useEffect(() => {
    setProfileForm(business);
  }, [business]);

  // Estado para el modal de notificaciones
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: NotificationType;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showNotification = (title: string, message: string, type: NotificationType) => {
    setNotification({ isOpen: true, title, message, type });
  };


  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  /**
   * CORRECCIÓN DE ERROR 404:
   * Forzamos el uso de la raíz "/" + parámetro de consulta "?business=".
   */
  const getCleanPublicUrl = () => {
    const baseUrl = window.location.origin + '/';
    const identifier = shareConfig.menuSlugActive && shareConfig.menuSlug
      ? shareConfig.menuSlug
      : business.id;
    return `${baseUrl}?business=${identifier}`;
  };

  const publicUrl = getCleanPublicUrl();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

  const slugify = (text: string) => {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleSaveShare = async () => {
    setIsSavingShare(true);
    try {
      if (shareConfig.menuSlugActive && shareConfig.menuSlug) {
        const isAvailable = await businessService.checkSlugAvailability(shareConfig.menuSlug, business.id);
        if (!isAvailable) {
          showNotification('Alias en uso', 'Este alias ya está en uso. Por favor, elige otro.', 'warning');
          setIsSavingShare(false);
          return;
        }
      }
      const updated = await businessService.updateBusiness(business.id, {
        menuSlug: shareConfig.menuSlug,
        menuSlugActive: shareConfig.menuSlugActive,
        customShareMessage: shareConfig.customShareMessage
      });
      setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, ...updated } : b));
      showNotification('Guardado exitoso', 'Configuración de marketing guardada correctamente.', 'success');
    } catch (err) {
      showNotification('Error al guardar', 'Ocurrió un error al guardar la configuración.', 'error');
    } finally {
      setIsSavingShare(false);
    }
  };

  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await businessService.updateBusiness(business.id, profileForm);
      setBusinesses(prev => prev.map(b => b.id === business.id ? updated : b));
      setIsEditingProfile(false);
      showNotification('Perfil actualizado', 'Los cambios se guardaron correctamente. Tu información ya está actualizada en el sistema.', 'success');
    } catch (err) {
      showNotification('Error al actualizar', 'No se pudo actualizar el perfil. Intenta de nuevo.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const url = await storageService.uploadFile(file, 'business-assets', `avatars/${business.id}`);
      setProfileForm(prev => ({ ...prev, avatar: url }));
      showNotification('Avatar actualizado', 'Tu avatar se subió correctamente.', 'success');
    } catch (err) {
      showNotification('Error al subir', 'No se pudo subir el avatar. Intenta de nuevo.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const url = await storageService.uploadFile(file, 'business-assets', `logos/${business.id}`);
      setProfileForm(prev => ({ ...prev, logo: url }));
      showNotification('Logo actualizado', 'Tu logo se subió correctamente.', 'success');
    } catch (err) {
      showNotification('Error al subir', 'No se pudo subir el logo. Intenta de nuevo.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const url = await storageService.uploadFile(file, 'business-assets', `banners/${business.id}`);
      setProfileForm(prev => ({ ...prev, banner: url }));
      alert("Portada subida con éxito.");
    } catch (err) {
      alert("Error al subir la portada.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>, method: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const url = await storageService.uploadFile(file, 'business-assets', `qrs/${business.id}`);
      setProfileForm(prev => ({
        ...prev,
        paymentConfigs: {
          ...(prev.paymentConfigs || {}),
          [method]: {
            ...((prev.paymentConfigs as any)?.[method] || {}),
            qrImage: url
          }
        }
      }));
      alert("Código QR subido con éxito.");
    } catch (err) {
      alert("Error al subir el QR. Asegúrate de que el bucket 'business-assets' existe en Supabase.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const img = await generateProductImage(newProdForm.name, newProdForm.description, business.type);
      const created = await productService.createProduct({
        ...newProdForm,
        businessId: business.id,
        image: img,
        status: 'active'
      });
      setProducts(prev => [created, ...prev]);
      setIsAddingProduct(false);
      setNewProdForm({ name: '', description: '', price: 0, category: CATEGORIES[0] });
    } catch (err) {
      alert("Error al crear producto.");
    } finally {
      setAiLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Error al eliminar.");
    }
  };

  const toggleStatus = async (p: Product) => {
    try {
      const newStatus = p.status === 'active' ? 'inactive' : 'active';
      await productService.updateProduct(p.id, { status: newStatus as any });
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, status: newStatus as any } : item));
    } catch (err) {
      alert("Error al actualizar estado.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setAiLoading(true);
          try {
            const data = await generateProductFromVoice(base64, business.type);
            const img = await generateProductImage(data.name, data.description, business.type);
            const created = await productService.createProduct({ ...data, businessId: business.id, image: img, status: 'active' });
            setProducts(prev => [created, ...prev]);
          } catch (err: any) {
            console.error("Error completo de IA (Voz):", err);
            alert(`Error al procesar audio: ${err.message || "No se entendió el audio"}`);
          } finally {
            setAiLoading(false);
          }
        };
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Microfono no disponible."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTextAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAiPrompt.trim()) return;

    setAiLoading(true);
    try {
      // 1. Generar datos del producto desde el texto
      const data = await generateProductFromText(textAiPrompt);

      // 2. Generar imagen publicitaria basada en el nombre y descripción obtenidos
      const img = await generateProductImage(data.name, data.description, business.type);

      // 3. Crear el producto en la base de datos
      const created = await productService.createProduct({
        ...data,
        businessId: business.id,
        image: img,
        status: 'active'
      });

      // 4. Actualizar UI y limpiar
      setProducts(prev => [created, ...prev]);
      setIsAddingByTextIA(false);
      setTextAiPrompt('');
    } catch (err: any) {
      console.error("Error completo de IA:", err);
      alert(`Error al procesar con IA: ${err.message || "Error desconocido"}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-emerald-700 text-white flex flex-col shadow-xl shrink-0">
        <div className="p-8 flex items-center gap-4 border-b border-emerald-800">
          <img src={business.logo} className="w-12 h-12 rounded-full border-2 border-white object-cover" alt="logo" />
          <div className="font-bold text-lg truncate">{business.name}</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('menu')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'menu' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>Mi Menú</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'orders' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>Pedidos</button>
          <button onClick={() => setActiveTab('tables')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'tables' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>Mesas</button>
          <button onClick={() => setActiveTab('share')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'share' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>Compartir</button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'profile' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>Configuración</button>
        </nav>
        <button
          type="button"
          onClick={onLogout}
          className="p-6 border-t border-emerald-800 hover:text-rose-200 transition text-left active:scale-95"
        >
          Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {aiLoading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest animate-pulse">Cocinando el producto...</p>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Mi Menú</h2>
                <p className="text-slate-500 text-sm">Gestiona tus productos y utiliza la IA para crecer.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition active:scale-95"
                >
                  Nuevo Producto
                </button>
                <button
                  onClick={() => setIsAddingByTextIA(true)}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition active:scale-95 flex items-center gap-2"
                >
                  Crear por Texto IA
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </button>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  className={`px-6 py-3 rounded-xl font-bold shadow-lg transition active:scale-95 flex items-center gap-2 ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-amber-900 hover:bg-amber-500'}`}
                >
                  {isRecording ? 'Escuchando...' : 'Crear por Voz IA'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                </button>
              </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar en el menú..."
                  className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-4 top-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <select
                className="p-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option>Todas</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 animate-in zoom-in-95">
                  <div className="h-44 relative overflow-hidden bg-slate-100">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={p.name} />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`p-2 rounded-lg backdrop-blur-md shadow-lg border transition ${p.status === 'active' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-slate-500/90 text-white border-slate-400'}`}
                      >
                        {p.status === 'active' ? 'Publicado' : 'Oculto'}
                      </button>
                      <button
                        onClick={() => setOpenActionMenuId(openActionMenuId === p.id ? null : p.id)}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg text-slate-600 hover:text-rose-600 border border-white/50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    {openActionMenuId === p.id && (
                      <div className="absolute top-16 right-4 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-10 animate-in slide-in-from-top-2">
                        <button onClick={() => deleteProduct(p.id)} className="w-full text-left px-4 py-2 text-rose-600 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 rounded-lg">Eliminar</button>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-slate-800 leading-tight">{p.name}</h3>
                      <span className="text-indigo-600 font-black text-sm">${p.price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 h-8">{p.description}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay productos que coincidan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <header>
              <h2 className="text-3xl font-black text-slate-800">Gestión de Pedidos</h2>
              <p className="text-slate-500 text-sm">Controla y actualiza el estado de tus pedidos en tiempo real.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.length === 0 ? (
                <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay pedidos registrados</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-slate-800">{order.customerName}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${order.orderType === 'domicilio' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {order.orderType === 'domicilio' ? 'Domicilio' : `Mesa ${order.tableNumber}`}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 font-bold">{order.customerPhone}</p>
                        {order.orderType === 'domicilio' && order.address && (
                          <p className="text-[10px] text-slate-500 mt-1 font-medium italic">
                            📍 {order.address}, {order.city}
                          </p>
                        )}
                        {order.notes && (
                          <p className="text-[10px] text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                            📝 {order.notes}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        order.status === 'preparing' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                        {order.status === 'pending' ? 'Pendiente' :
                          order.status === 'preparing' ? 'Preparando' :
                            order.status === 'delivered' ? 'Entregado' : 'Cancelado'}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold font-medium text-slate-700">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                        <span className="text-lg font-black text-slate-900">${order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={async () => {
                            const updated = await orderService.updateOrderStatus(order.id, 'preparing');
                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'preparing' } : o));
                          }}
                          className="flex-1 py-3 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition"
                        >
                          Preparar
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={async () => {
                            const updated = await orderService.updateOrderStatus(order.id, 'delivered');
                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'delivered' } : o));
                          }}
                          className="flex-1 py-3 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition"
                        >
                          Entregar
                        </button>
                      )}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={async () => {
                            if (!confirm("¿Cancelar este pedido?")) return;
                            const updated = await orderService.updateOrderStatus(order.id, 'cancelled');
                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                          }}
                          className="px-4 py-3 bg-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <TablesManager business={business} />
        )}

        {activeTab === 'share' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Compartir tu Menú</h2>
                <p className="text-slate-500 text-sm">Tu puerta de entrada digital para clientes.</p>
              </div>
              <button onClick={handleSaveShare} disabled={isSavingShare} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                {isSavingShare ? 'Guardando...' : 'Guardar Alias'}
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Alias Personalizado</h3>
                  <button onClick={() => setShareConfig({ ...shareConfig, menuSlugActive: !shareConfig.menuSlugActive })} className={`w-10 h-5 rounded-full relative transition ${shareConfig.menuSlugActive ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${shareConfig.menuSlugActive ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className={`space-y-4 ${!shareConfig.menuSlugActive && 'opacity-40 pointer-events-none'}`}>
                  <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-xl border">
                    <span className="text-slate-400 font-bold">/</span>
                    <input
                      type="text"
                      placeholder="ej: mi-negocio-ia"
                      className="bg-transparent border-none outline-none font-bold text-slate-800 flex-1"
                      value={shareConfig.menuSlug}
                      onChange={e => setShareConfig({ ...shareConfig, menuSlug: slugify(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Enlace para Clientes:</p>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-bold text-slate-600 truncate">{publicUrl}</span>
                    <button onClick={() => { navigator.clipboard.writeText(publicUrl); alert('Copiado'); }} className="p-2 bg-white rounded-lg shadow-sm hover:text-indigo-600 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg></button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="font-bold text-slate-800 mb-4">Tu Código QR</h3>
                <div className="w-40 h-40 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border-4 border-white shadow-inner">
                  <img src={qrUrl} className="w-full h-full object-contain" alt="QR" />
                </div>
                <a href={qrUrl} target="_blank" download className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Descargar Imagen QR</a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-center">Compartir en Redes Sociales</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`, '_blank')}
                  className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition group border border-[#1877F2]/20"
                >
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                </button>

                <button
                  onClick={() => { navigator.clipboard.writeText(publicUrl); alert('Link copiado para Instagram'); }}
                  className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition group border border-[#E4405F]/20"
                >
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                </button>

                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('¡Hola! Mira mi menú digital aquí: ' + publicUrl)}`, '_blank')}
                  className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition group border border-[#25D366]/20"
                >
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.064-4.514 10.066-10.066.002-5.548-4.513-10.065-10.065-10.065-2.689 0-5.216 1.048-7.115 2.949-1.9 1.899-2.946 4.425-2.948 7.115-.002 2.112.564 3.659 1.623 5.352l-.999 3.651 3.738-.981zm12.356-6.19c-.316-.157-1.872-.923-2.162-1.029-.29-.106-.501-.157-.712.157-.211.314-.818 1.029-1.003 1.239-.184.211-.369.237-.685.081-.316-.157-1.336-.492-2.544-1.57-.94-.838-1.573-1.873-1.758-2.189-.184-.316-.02-.487.137-.643.142-.141.316-.369.474-.553.158-.184.211-.369.474-.553.158-.184.211-.316.316-.527.105-.211.053-.395-.026-.553-.079-.158-.712-1.714-.976-2.346-.257-.617-.518-.533-.712-.543-.184-.01-.395-.011-.606-.011-.211 0-.554.079-.843.395-.29.316-1.107 1.081-1.107 2.636 0 1.556 1.134 3.058 1.291 3.269.158.211 2.231 3.406 5.405 4.776.755.326 1.345.52 1.803.665.759.241 1.45.207 2.0.125.613-.092 1.872-.765 2.136-1.503.264-.737.264-1.37.185-1.503-.079-.132-.29-.211-.606-.369z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                </button>

                <button
                  onClick={() => { navigator.clipboard.writeText(publicUrl); alert('Link copiado para TikTok'); }}
                  className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/10 text-slate-900 hover:bg-slate-900 hover:text-white transition group border border-slate-900/20"
                >
                  <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31.036 2.512.356 3.6.855.517.231.897.444 1.161.676V3.34c-.58-.33-1.32-.675-2.205-.795-1.125-.15-2.22-.03-3.285.36-.915.33-1.71.795-2.385 1.395-.555.51-1.02.105-1.335.795-.69 1.56-.255 3.3.93 4.41.975.915 2.22 1.335 3.51.135 1.485.03 2.94-.375 4.2-.72v3.705c-.825.21-1.68.345-2.55.405-.27.03-.54.045-.81.045-2.505 0-4.815-.9-5.91-.765-.45-.03-.915-.09-1.35-.195-2.19-.51-3.87-1.95-4.71-4.065-.24-.615-.405-1.245-.495-1.89-.135-.915-.09-1.815.135-2.685.24-.96.69-1.845 1.32-2.61.885-1.08 2.055-1.86 3.42-2.235 1.095-.315 2.235-.375 3.36-.18 1.125.195 2.175.645 3.075 1.335.03-.315.075-.63.15-.93.18-.735.51-1.425.96-2.025.465-.63 1.05-1.155 1.725-1.56C10.02 0 11.265.015 12.525.02zM19.14 8.72c-.03.3-.06.6-.105.9-.06.405-.15.81-.285 1.2-.42 1.185-1.11 2.235-2.01 3.12-.96.96-2.1 1.71-3.375 2.235-1.275.525-2.67.81-4.14.81-1.47 0-2.865-.285-4.14-.81-1.32-.54-2.505-1.32-3.48-2.325-.975-.99-1.725-2.16-2.22-3.465-.495-1.305-.75-2.73-.75-4.23 0-1.5.255-2.925.75-4.23.495-1.305 1.245-2.475 2.22-3.465 1.02-1.05 2.22-1.875 3.555-2.43 1.335-.555 2.76-.84 4.26-.84.21 0 .405.015.615.015V3.86 c-.21-.015-.405-.015-.615-.015-1.17 0-2.28.225-3.3.645-1.035.435-1.935 1.05-2.67 1.83-.735.78-1.29 1.71-1.635 2.73-.345 1.035-.525 2.145-.525 3.3 0 1.155.18 2.265.525 3.3.345 1.02 1.02 1.95 1.77 2.73s1.71 1.395 2.805 1.83c1.095.435 2.295.66 3.555.66 1.26 0 2.46-.225 3.555-.66a9.07 9.07 0 0 0 2.805-1.83c.75-.78 1.32-1.71 1.77-2.73.345-1.035.525-2.145.525-3.3 0-.09 0-.18-.015-.27h3.765c.015.09.015.18.015.27 0 4.98-4.035 9.015-9.015 9.015s-9.015-4.035-9.015-9.015S7.215.105 12.195.105c.24 0 .48.015.72.03V3.81c-.24-.015-.48-.03-.72-.03s-.48.015-.72.03V0c.24-.015.48-.03.72-.03" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">TikTok</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Mi Perfil</h2>
                <p className="text-slate-500 text-sm">Gestiona la identidad y configuración de tu negocio.</p>
              </div>
              <div className="flex gap-3">
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition"
                  >
                    Editar Perfil
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsEditingProfile(false); setProfileForm(business); }}
                      className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleProfileSave}
                      disabled={isSavingProfile}
                      className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </>
                )}
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 1: Información del Negocio */}
              <section className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Información General</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                      <input
                        disabled={!isEditingProfile}
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-60"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                      <input
                        disabled={!isEditingProfile}
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-60"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección / Ubicación</label>
                    <input
                      disabled={!isEditingProfile}
                      type="text"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-60"
                      value={profileForm.location}
                      onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Público</label>
                    <input
                      disabled={!isEditingProfile}
                      type="email"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-60"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IVA (%)</label>
                      <input
                        disabled={!isEditingProfile}
                        type="number"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-60"
                        value={profileForm.iva}
                        onChange={e => setProfileForm({ ...profileForm, iva: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Costo Envío Base</label>
                      <input
                        disabled={!isEditingProfile}
                        type="number"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-60"
                        value={profileForm.deliveryValue}
                        onChange={e => setProfileForm({ ...profileForm, deliveryValue: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción del Negocio</label>
                    <textarea
                      disabled={!isEditingProfile}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none disabled:opacity-60"
                      value={profileForm.description}
                      onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              {/* Card 2: Identidad Visual */}
              <section className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Identidad Visual</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Avatar del Administrador</label>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-50">
                        {profileForm.avatar ? (
                          <img src={profileForm.avatar} className="w-full h-full object-cover" alt="avatar preview" />
                        ) : (
                          <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        )}
                      </div>
                      {isEditingProfile && (
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="avatar-upload"
                            onChange={handleAvatarUpload}
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="block w-full text-center py-2 px-4 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer hover:bg-indigo-100 transition border border-indigo-100"
                          >
                            {profileForm.avatar ? 'Cambiar Avatar' : 'Subir Avatar desde PC'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo del Negocio</label>
                    <div className="flex items-center gap-6">
                      <img src={profileForm.logo} className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-inner" alt="logo preview" />
                      {isEditingProfile && (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="URL del Logo..."
                            className="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none"
                            value={profileForm.logo}
                            onChange={e => setProfileForm({ ...profileForm, logo: e.target.value })}
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="logo-upload"
                              onChange={handleLogoUpload}
                            />
                            <label
                              htmlFor="logo-upload"
                              className="block w-full text-center py-2 px-4 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer hover:bg-indigo-100 transition border border-indigo-100"
                            >
                              Subir Logo desde PC
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner de Portada</label>
                    <div className="space-y-4">
                      <div className="w-full h-32 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50">
                        {profileForm.banner ? (
                          <img src={profileForm.banner} className="w-full h-full object-cover" alt="banner preview" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">Sin Banner</div>
                        )}
                      </div>
                      {isEditingProfile && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="URL del Banner"
                            className="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none"
                            value={profileForm.banner}
                            onChange={e => setProfileForm({ ...profileForm, banner: e.target.value })}
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="banner-upload"
                              onChange={handleBannerUpload}
                            />
                            <label
                              htmlFor="banner-upload"
                              className="block w-full text-center py-2 px-4 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer hover:bg-indigo-100 transition border border-indigo-100"
                            >
                              Subir Portada desde PC
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Card 3: Redes Sociales */}
              <section className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 lg:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Redes Sociales</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { key: 'whatsapp', label: 'WhatsApp', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
                    { key: 'instagram', label: 'Instagram', icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0M12 11V3a1.5 1.5 0 113 0v11M17 11V6a1.5 1.5 0 113 0v15M7 10.5a1.5 1.5 0 11-3 0V8.1a2 2 0 011-1.73' },
                    { key: 'facebook', label: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                    { key: 'website', label: 'Sitio Web', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' }
                  ].map(social => (
                    <div key={social.key} className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={social.icon}></path></svg>
                        {social.label}
                      </label>
                      <input
                        disabled={!isEditingProfile}
                        type="text"
                        placeholder={`URL de ${social.label}`}
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs disabled:opacity-60"
                        value={(profileForm.socials as any)?.[social.key] || ''}
                        onChange={e => setProfileForm({ ...profileForm, socials: { ...(profileForm.socials || {}), [social.key]: e.target.value } })}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Card 4: Opciones de Pago */}
              <section className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8 lg:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Métodos de Pago</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Efecivo / Contra Entrega */}
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Efectivo</span>
                      <button
                        disabled={!isEditingProfile}
                        onClick={() => {
                          const currentEnabled = !!profileForm.paymentConfigs?.cash?.enabled;
                          setProfileForm({
                            ...profileForm,
                            paymentConfigs: {
                              ...(profileForm.paymentConfigs || {}),
                              cash: { enabled: !currentEnabled }
                            }
                          });
                        }}
                        className={`w-10 h-5 rounded-full relative transition ${(profileForm.paymentConfigs?.cash as any)?.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${(profileForm.paymentConfigs?.cash as any)?.enabled ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Permite a tus clientes pagar al recibir su pedido.</p>
                  </div>

                  {/* QRs (Nequi, Daviplata, Bancolombia) */}
                  {['nequi', 'daviplata', 'bancolombia'].map(method => {
                    const config = (profileForm.paymentConfigs as any)?.[method] || { enabled: false, accountHolder: '', accountNumber: '', qrImage: '' };
                    return (
                      <div key={method} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">{method}</span>
                          <button
                            disabled={!isEditingProfile}
                            onClick={() => setProfileForm({ ...profileForm, paymentConfigs: { ...(profileForm.paymentConfigs || {}), [method]: { ...config, enabled: !config.enabled } } })}
                            className={`w-10 h-5 rounded-full relative transition ${config.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${config.enabled ? 'left-6' : 'left-1'}`}></div>
                          </button>
                        </div>
                        {config.enabled && (
                          <div className="space-y-3 animate-in slide-in-from-top-2">
                            <input
                              disabled={!isEditingProfile}
                              type="text" placeholder="Titular" className="w-full p-2 bg-white border border-slate-100 rounded-lg text-xs"
                              value={config.accountHolder || ''} onChange={e => setProfileForm({ ...profileForm, paymentConfigs: { ...(profileForm.paymentConfigs || {}), [method]: { ...config, accountHolder: e.target.value } } })}
                            />
                            <input
                              disabled={!isEditingProfile}
                              type="text" placeholder="Número Cel/Cuenta" className="w-full p-2 bg-white border border-slate-100 rounded-lg text-xs"
                              value={config.accountNumber || ''} onChange={e => setProfileForm({ ...profileForm, paymentConfigs: { ...(profileForm.paymentConfigs || {}), [method]: { ...config, accountNumber: e.target.value } } })}
                            />

                            {/* QR Upload Section */}
                            <div className="space-y-2">
                              {config.qrImage && (
                                <div className="w-20 h-20 mx-auto bg-white rounded-lg border-2 border-slate-100 overflow-hidden">
                                  <img src={config.qrImage} className="w-full h-full object-contain" alt="QR Preview" />
                                </div>
                              )}
                              {isEditingProfile && (
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`qr-upload-${method}`}
                                    onChange={(e) => handleQRUpload(e, method)}
                                  />
                                  <label
                                    htmlFor={`qr-upload-${method}`}
                                    className="block w-full text-center py-2 px-4 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer hover:bg-indigo-100 transition border border-indigo-100"
                                  >
                                    {config.qrImage ? 'Cambiar QR' : 'Subir Imagen QR'}
                                  </label>
                                </div>
                              )}
                              {!isEditingProfile && !config.qrImage && (
                                <p className="text-[10px] text-slate-400 text-center italic">Sin código QR</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Pasarelas (Mercado Pago, Stripe) */}
                  {['mercadoPago', 'stripe'].map(method => {
                    const config = (profileForm.paymentConfigs as any)?.[method] || { enabled: false, publicKey: '', accessToken: '', secretKey: '', mode: 'sandbox' };
                    const isMP = method === 'mercadoPago';
                    return (
                      <div key={method} className="p-6 bg-slate-800 rounded-[2rem] text-white space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-black uppercase text-[10px] tracking-widest text-indigo-300">{isMP ? 'Mercado Pago' : 'Stripe'}</span>
                          <button
                            disabled={!isEditingProfile}
                            onClick={() => setProfileForm({ ...profileForm, paymentConfigs: { ...(profileForm.paymentConfigs || {}), [method]: { ...config, enabled: !config.enabled } } })}
                            className={`w-10 h-5 rounded-full relative transition ${config.enabled ? 'bg-indigo-400' : 'bg-slate-600'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${config.enabled ? 'left-6' : 'left-1'}`}></div>
                          </button>
                        </div>
                        {config.enabled && (
                          <div className="space-y-2 animate-in zoom-in-95">
                            <input
                              disabled={!isEditingProfile}
                              type="text" placeholder="Public Key" className="w-full p-2 bg-slate-700 border-none rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-indigo-400"
                              value={config.publicKey || ''} onChange={e => setProfileForm({ ...profileForm, paymentConfigs: { ...(profileForm.paymentConfigs || {}), [method]: { ...config, publicKey: e.target.value } } })}
                            />
                            <input
                              disabled={!isEditingProfile}
                              type={isEditingProfile ? 'text' : 'password'} placeholder={isMP ? 'Access Token' : 'Secret Key'} className="w-full p-2 bg-slate-700 border-none rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-indigo-400"
                              value={isMP ? (config.accessToken || '') : (config.secretKey || '')} onChange={e => setProfileForm({ ...profileForm, paymentConfigs: { ...(profileForm.paymentConfigs || {}), [method]: { ...config, [isMP ? 'accessToken' : 'secretKey']: e.target.value } } })}
                            />
                            <select
                              disabled={!isEditingProfile}
                              className="w-full p-2 bg-slate-700 border-none rounded-lg text-xs outline-none"
                              value={config.mode || 'sandbox'} onChange={e => setProfileForm({ ...profileForm, paymentConfigs: { ...(profileForm.paymentConfigs || {}), [method]: { ...config, mode: e.target.value as any } } })}
                            >
                              <option value="sandbox">Pruebas (Sandbox)</option>
                              <option value="production">Producción</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Modal: Crear por Texto IA */}
        {isAddingByTextIA && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Generar con IA</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Describe el plato y la IA hará el resto</p>
                </div>
                <button
                  onClick={() => setIsAddingByTextIA(false)}
                  className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form onSubmit={handleTextAiSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción del Plato</label>
                  <textarea
                    required
                    autoFocus
                    placeholder="Ej: Una hamburguesa con triple queso, cebolla caramelizada y salsa secreta en pan brioche..."
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl h-40 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 resize-none transition"
                    value={textAiPrompt}
                    onChange={(e) => setTextAiPrompt(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition active:scale-95 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Generar Producto con IA
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Nuevo Producto Manual */}
        {isAddingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-black text-slate-800">Agregar al Menú</h3>
                <button onClick={() => setIsAddingProduct(false)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100"><svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                  <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newProdForm.name} onChange={e => setNewProdForm({ ...newProdForm, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio</label>
                    <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newProdForm.price} onChange={e => setNewProdForm({ ...newProdForm, price: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newProdForm.category} onChange={e => setNewProdForm({ ...newProdForm, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                  <textarea required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" value={newProdForm.description} onChange={e => setNewProdForm({ ...newProdForm, description: e.target.value })} />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl hover:bg-indigo-700 transition">
                  Guardar Producto
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Notificaciones */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default BusinessAdminPanel;
