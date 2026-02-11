
import React, { useState, useRef } from 'react';
import { Business, Product, Order, PlanType } from '../types';
import { PLANS, CATEGORIES } from '../constants';
import { generateProductFromText, generateProductFromVoice, generateProductImage } from '../geminiService';
import { productService } from '../services/productService';
import { businessService } from '../services/businessService';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [isSavingShare, setIsSavingShare] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
          alert("Este alias ya está en uso.");
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
      alert("Configuración de marketing guardada.");
    } catch (err) {
      alert("Error al guardar.");
    } finally {
      setIsSavingShare(false);
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
          } catch (err) { alert("IA: No se entendió el audio."); } finally { setAiLoading(false); }
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
          <button onClick={() => setActiveTab('share')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'share' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>Compartir</button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'profile' ? 'bg-emerald-800 font-bold' : 'hover:bg-emerald-600'}`}>Configuración</button>
        </nav>
        <button onClick={onLogout} className="p-6 border-t border-emerald-800 hover:text-rose-200">Cerrar Sesión</button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {aiLoading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest animate-pulse">Procesando con IA...</p>
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
                   <button onClick={() => setShareConfig({...shareConfig, menuSlugActive: !shareConfig.menuSlugActive})} className={`w-10 h-5 rounded-full relative transition ${shareConfig.menuSlugActive ? 'bg-indigo-600' : 'bg-slate-200'}`}>
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
                        onChange={e => setShareConfig({...shareConfig, menuSlug: slugify(e.target.value)})} 
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
                      <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newProdForm.name} onChange={e => setNewProdForm({...newProdForm, name: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio</label>
                        <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newProdForm.price} onChange={e => setNewProdForm({...newProdForm, price: Number(e.target.value)})} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                        <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newProdForm.category} onChange={e => setNewProdForm({...newProdForm, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                     </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                      <textarea required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" value={newProdForm.description} onChange={e => setNewProdForm({...newProdForm, description: e.target.value})} />
                   </div>
                   <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl hover:bg-indigo-700 transition">
                      Guardar Producto
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
