
import React, { useState, useEffect } from 'react';
import { Business, Product, Order } from '../types';
import { productService } from '../services/productService';
import { businessService } from '../services/businessService';
import PublicMenuDebugger from '../components/PublicMenuDebugger';
import OrderModal from '../components/OrderModal';
import PublicMenuFooter from '../components/PublicMenuFooter';

interface PublicMenuProps {
  businesses: Business[];
  products: Product[];
  addOrder: (o: Order) => void;
}

const PublicMenu: React.FC<PublicMenuProps> = ({ businesses, products, addOrder }) => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businessProducts, setBusinessProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;

    // Timeout de seguridad: Si en 8 segundos no ha cargado, forzar parada
    const safetyTimeout = setTimeout(() => {
      if (active && loading) {
        console.warn("PublicMenu: Timeout de seguridad activado");
        setLoading(false);
        // Si no se cargó nada, mostrará "Menú no encontrado" o se quedará null, 
        // pero al menos quitará el spinner.
      }
    }, 8000);

    const fetchMenu = async () => {
      const params = new URLSearchParams(window.location.search);
      const businessIdentifier = params.get('business');

      console.log("PublicMenu: Iniciando carga para:", businessIdentifier);

      if (!businessIdentifier) {
        if (active) setLoading(false);
        return;
      }

      try {
        console.log("PublicMenu: Buscando negocio...");
        const business = await businessService.getBusinessByIdOrSlug(businessIdentifier);
        console.log("PublicMenu: Negocio encontrado:", business);

        if (business && active) {
          setSelectedBusiness(business);

          console.log("PublicMenu: Buscando productos...");
          const prods = await productService.getProducts(business.id);
          console.log("PublicMenu: Productos cargados:", prods.length);

          if (active) setBusinessProducts(prods.filter(p => p.status === 'active'));
        } else {
          console.warn("PublicMenu: No se encontró el negocio o componente inactivo");
        }
      } catch (e) {
        console.error("Error al cargar menú:", e);
      } finally {
        if (active) {
          console.log("PublicMenu: Finalizando carga (setLoading false)");
          setLoading(false);
        }
      }
    };

    fetchMenu();
    return () => {
      active = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  const handleOpenOrder = (product: Product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    addOrder(order);
    alert(`¡Pedido para "${order.customerName}" enviado con éxito!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando Menú Digital...</p>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <PublicMenuDebugger />
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center border">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-black text-slate-800">Menú no encontrado</h2>
          <p className="text-sm text-slate-500 mt-2">El identificador no es válido o el negocio ha sido desactivado.</p>
          <button onClick={() => window.location.href = window.location.origin} className="mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Ir al Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicMenuDebugger />
      <div className="w-full h-56 bg-slate-900 relative overflow-hidden">
        {selectedBusiness.banner && <img src={selectedBusiness.banner} className="w-full h-full object-cover opacity-40" alt="banner" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 p-8 flex items-end gap-6">
          <img src={selectedBusiness.logo} className="w-24 h-24 rounded-3xl border-4 border-white shadow-2xl object-cover bg-white" alt="logo" />
          <div className="mb-2">
            <h1 className="text-3xl font-black text-white">{selectedBusiness.name}</h1>
            <p className="text-indigo-300 text-xs font-black uppercase tracking-widest mt-1">{selectedBusiness.type}</p>
          </div>
        </div>
      </div>



      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Selección Exclusiva</h3>
          <div className="h-px flex-1 bg-slate-200 mx-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businessProducts.map(p => (
            <div key={p.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="h-48 overflow-hidden relative">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={p.name} />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-sm font-black text-indigo-600 border shadow-sm">${p.price.toLocaleString()}</div>
              </div>
              <div className="p-8">
                <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
                <button
                  onClick={() => handleOpenOrder(p)}
                  className="w-full mt-6 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition shadow-lg shadow-slate-100"
                >
                  Pedir a WhatsApp
                </button>
              </div>
            </div>
          ))}
          {businessProducts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aún no hay platos publicados</p>
            </div>
          )}
        </div>
      </div>

      {isOrderModalOpen && selectedProduct && selectedBusiness && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          product={selectedProduct}
          business={selectedBusiness}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      <PublicMenuFooter business={selectedBusiness} />
    </div>
  );
};

export default PublicMenu;
