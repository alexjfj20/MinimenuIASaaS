
import React, { useState } from 'react';
import { Business, Product, Order } from '../types';

interface PublicMenuProps {
  businesses: Business[];
  products: Product[];
  addOrder: (o: Order) => void;
}

const PublicMenu: React.FC<PublicMenuProps> = ({ businesses, products, addOrder }) => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', payment: 'Nequi' });

  const currentProducts = selectedBusiness ? products.filter(p => p.businessId === selectedBusiness.id && p.status === 'active') : [];

  const handlePlaceOrder = () => {
    if (!selectedBusiness || !selectedProduct) return;
    
    const newOrder: Order = {
      id: 'ord-' + Math.random().toString(36).substr(2, 5),
      businessId: selectedBusiness.id,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      items: [{ productId: selectedProduct.id, name: selectedProduct.name, quantity: 1, price: selectedProduct.price }],
      total: selectedProduct.price,
      paymentMethod: customerInfo.payment,
      status: 'pending',
      createdAt: Date.now()
    };

    addOrder(newOrder);
    alert('Pedido enviado con éxito! El negocio se contactará pronto.');
    setSelectedProduct(null);
    setStep(1);
  };

  if (!selectedBusiness) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Nuestros Negocios</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businesses.map(b => (
            <div 
              key={b.id} 
              onClick={() => setSelectedBusiness(b)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <img src={b.logo} className="w-16 h-16 rounded-full" alt={b.name} />
                <div>
                  <h3 className="font-bold text-xl">{b.name}</h3>
                  <p className="text-gray-500 text-sm">{b.type} • {b.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
           <button onClick={() => setSelectedBusiness(null)} className="text-indigo-600 font-medium flex items-center gap-1">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
             Volver
           </button>
           <h1 className="font-bold text-lg">{selectedBusiness.name}</h1>
           <div className="w-8"></div>
        </div>
      </header>

      {/* Hero Banner Area */}
      {selectedBusiness.banner && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden">
          <img src={selectedBusiness.banner} className="w-full h-full object-cover" alt="banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}

      <main className="max-w-5xl mx-auto p-4 md:p-8 -mt-20 relative z-10">
        <div className="mb-12 flex flex-col items-center bg-white/80 backdrop-blur rounded-3xl p-8 border border-white/50 shadow-xl">
           <img src={selectedBusiness.logo} className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl mb-4 object-cover" alt="logo" />
           <h1 className="text-4xl font-extrabold text-slate-800">{selectedBusiness.name}</h1>
           <p className="text-gray-500 text-center max-w-md mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {selectedBusiness.location}
           </p>
           <div className="flex gap-2 mt-4">
              {selectedBusiness.socials.whatsapp && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold shadow-sm">WhatsApp</span>}
              {selectedBusiness.socials.instagram && <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-bold shadow-sm">Instagram</span>}
           </div>
        </div>

        <div className="space-y-12">
           {/* Menú Section */}
           <div>
             <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                Nuestro Menú
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => { setSelectedProduct(p); setStep(1); }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition-all border border-transparent hover:border-indigo-100 group"
                  >
                     <div className="h-48 relative overflow-hidden">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={p.name} />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm">{p.category}</div>
                     </div>
                     <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1 gap-2">
                             <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{p.name}</h3>
                             <div className="text-indigo-600 font-bold text-lg shrink-0">${p.price.toFixed(2)}</div>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ver Detalles</span>
                           <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           </div>

           {/* Location Section - Google Maps */}
           {selectedBusiness.googleMapsIframe && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-2 h-8 bg-emerald-600 rounded-full"></div>
                  Ubicación
               </h2>
               <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <iframe 
                    src={selectedBusiness.googleMapsIframe} 
                    className="w-full h-full border-0" 
                    allowFullScreen={true}
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
               </div>
             </div>
           )}
        </div>
      </main>

      {/* Footer simple para negocios */}
      <footer className="bg-white border-t mt-20 p-12 text-center">
         <div className="max-w-5xl mx-auto space-y-4">
            <h3 className="font-bold text-lg text-slate-800">{selectedBusiness.name}</h3>
            <p className="text-sm text-slate-500">{selectedBusiness.location} • {selectedBusiness.phone}</p>
            <div className="flex justify-center gap-4 pt-4 grayscale opacity-50">
               <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Maps_icon_%282020%29.svg" className="w-6 h-6" alt="maps" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="wa" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" className="w-6 h-6" alt="ig" />
            </div>
         </div>
      </footer>

      {/* Checkout Modal (Mantiene la misma lógica anterior) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                 <div className="flex gap-1">
                   {[1, 2, 3].map(s => (
                     <div key={s} className={`h-1.5 w-8 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                   ))}
                 </div>
                 <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
              </div>

              <div className="p-8">
                 {step === 1 && (
                   <div className="space-y-6">
                      <img src={selectedProduct.image} className="w-full h-56 object-cover rounded-2xl shadow-inner" alt="product" />
                      <div>
                        <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                        <p className="text-gray-500 mt-2">{selectedProduct.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                         <span className="text-gray-400 font-medium">Precio Unitario</span>
                         <span className="text-3xl font-bold text-indigo-600">${selectedProduct.price.toFixed(2)}</span>
                      </div>
                      <button onClick={() => setStep(2)} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Siguiente</button>
                   </div>
                 )}

                 {step === 2 && (
                   <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-800">Tus Datos de Envío</h2>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nombre Completo</label>
                            <input 
                              type="text" 
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                              placeholder="Ej: Juan Pérez"
                              value={customerInfo.name}
                              onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Teléfono WhatsApp</label>
                            <input 
                              type="tel" 
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                              placeholder="300 123 4567"
                              value={customerInfo.phone}
                              onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                            />
                         </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-500 font-bold">Volver</button>
                        <button onClick={() => setStep(3)} disabled={!customerInfo.name || !customerInfo.phone} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl disabled:opacity-50 transition-all shadow-lg">Siguiente</button>
                      </div>
                   </div>
                 )}

                 {step === 3 && (
                   <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-800">Método de Pago</h2>
                      <div className="grid grid-cols-2 gap-3">
                         {selectedBusiness.paymentMethods.map(method => (
                           <button 
                             key={method}
                             onClick={() => setCustomerInfo({...customerInfo, payment: method})}
                             className={`p-4 border rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 ${customerInfo.payment === method ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-600' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                           >
                             <div className={`w-3 h-3 rounded-full border-2 ${customerInfo.payment === method ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}></div>
                             {method}
                           </button>
                         ))}
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
                         <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>${selectedProduct.price.toFixed(2)}</span></div>
                         <div className="flex justify-between text-sm text-slate-500"><span>Impuestos (IVA {selectedBusiness.iva}%)</span><span>${(selectedProduct.price * (selectedBusiness.iva || 0) / 100).toFixed(2)}</span></div>
                         <div className="flex justify-between text-sm text-slate-500"><span>Domicilio</span><span className="text-indigo-600 font-bold">${selectedBusiness.deliveryValue?.toFixed(2)}</span></div>
                         <div className="flex justify-between font-extrabold text-2xl pt-4 border-t text-slate-800"><span>Total</span><span>${(selectedProduct.price + (selectedProduct.price * (selectedBusiness.iva || 0) / 100) + (selectedBusiness.deliveryValue || 0)).toFixed(2)}</span></div>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setStep(2)} className="flex-1 py-4 text-gray-500 font-bold">Volver</button>
                        <button onClick={handlePlaceOrder} className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 transition-transform active:scale-95">Confirmar Pedido</button>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PublicMenu;
