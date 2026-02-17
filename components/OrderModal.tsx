
import React, { useState } from 'react';
import { Product, Business, Order, Table } from '../types';
import { orderService } from '../services/orderService';
import { tableService } from '../services/tableService';
import { handleShareWhatsApp } from '../utils/whatsapp';
import NotificationModal, { NotificationType } from './NotificationModal';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    business: Business;
    onOrderSuccess: (order: Order) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, product, business, onOrderSuccess }) => {
    const [orderType, setOrderType] = useState<'mesa' | 'domicilio'>('domicilio');
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tables, setTables] = useState<Table[]>([]);

    React.useEffect(() => {
        if (isOpen && business.id) {
            tableService.getTables(business.id)
                .then(data => setTables(data.filter(t => t.status === 'active')))
                .catch(err => console.error("Error al cargar mesas:", err));
        }
    }, [isOpen, business.id]);

    // Notification state
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

    // Form states
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        address: '',
        city: '',
        department: '',
        notes: '',
        tableNumber: '',
        paymentMethod: 'Efectivo'
    });

    if (!isOpen) return null;

    const subtotal = product.price * quantity;
    const iva = subtotal * (business.iva || 0) / 100;
    const delivery = orderType === 'domicilio' ? (business.deliveryValue || 0) : 0;
    const total = subtotal + iva + delivery;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showNotification = (title: string, message: string, type: NotificationType) => {
        setNotification({ isOpen: true, title, message, type });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const orderData: Partial<Order> = {
                businessId: business.id,
                customerName: formData.customerName || (orderType === 'mesa' ? `Mesa ${formData.tableNumber}` : 'Cliente'),
                customerPhone: formData.customerPhone,
                items: [{
                    productId: product.id,
                    name: product.name,
                    quantity: quantity,
                    price: product.price
                }],
                total: total,
                paymentMethod: formData.paymentMethod,
                orderType: orderType,
                tableNumber: formData.tableNumber,
                address: formData.address,
                city: formData.city,
                department: formData.department,
                notes: formData.notes,
                status: 'pending'
            };

            // 1. Persist to Supabase
            const createdOrder = await orderService.createOrder(orderData);

            // 2. Prepare WhatsApp Message
            const message = `*Nuevo Pedido - ${business.name}*\n\n` +
                `*Tipo:* ${orderType === 'mesa' ? 'En Mesa' : 'Domicilio'}\n` +
                (orderType === 'mesa' ? `*Mesa:* ${formData.tableNumber}\n` : `*Cliente:* ${formData.customerName}\n*Dirección:* ${formData.address}, ${formData.city}\n`) +
                `*Tel:* ${formData.customerPhone}\n\n` +
                `*Pedido:*\n- ${quantity}x ${product.name} ($${(product.price * quantity).toLocaleString()})\n\n` +
                `*Subtotal:* $${subtotal.toLocaleString()}\n` +
                (iva > 0 ? `*IVA (${business.iva}%):* $${iva.toLocaleString()}\n` : '') +
                (delivery > 0 ? `*Domicilio:* $${delivery.toLocaleString()}\n` : '') +
                `*TOTAL: $${total.toLocaleString()}*\n\n` +
                `*Pago:* ${formData.paymentMethod}\n` +
                (formData.notes ? `*Notas:* ${formData.notes}` : '');

            const success = handleShareWhatsApp(
                business.phone,
                business.countryCode || '57',
                message
            );

            if (!success) {
                throw new Error("El número de teléfono del negocio no es válido para WhatsApp.");
            }

            // 4. Update parent and close
            onOrderSuccess(createdOrder);
            onClose();
        } catch (err) {
            console.error("Error al procesar pedido:", err);
            showNotification(
                "Error en el Pedido",
                "Hubo un error al procesar tu pedido en el sistema. Por favor intenta de nuevo o contacta directamente al negocio.",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Tu Pedido</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Order Type Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl">
                        <button
                            onClick={() => setOrderType('mesa')}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition ${orderType === 'mesa' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4"></path></svg>
                            En Mesa
                        </button>
                        <button
                            onClick={() => setOrderType('domicilio')}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition ${orderType === 'domicilio' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            Domicilio
                        </button>
                    </div>

                    {/* Item List */}
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex gap-4">
                        <img src={product.image} className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm" alt={product.name} />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-800">{product.name}</h4>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-full border shadow-sm">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-indigo-600 font-black">-</button>
                                    <span className="font-black text-sm w-4 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="text-indigo-600 font-black">+</button>
                                </div>
                                <span className="font-black text-slate-800">${(product.price * quantity).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-700">${subtotal.toLocaleString()}</span>
                        </div>
                        {iva > 0 && (
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>IVA ({business.iva}%)</span>
                                <span className="font-bold text-slate-700">+${iva.toLocaleString()}</span>
                            </div>
                        )}
                        {orderType === 'domicilio' && (
                            <div className="flex justify-between text-sm text-indigo-500">
                                <span>Domicilio</span>
                                <span className="font-bold">+${delivery.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 text-slate-800">
                            <span className="text-lg font-black">Total a Pagar</span>
                            <span className="text-2xl font-black text-orange-600">${total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form id="order-form" onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{orderType === 'mesa' ? 'Ubicación (Mesa)' : 'Datos de Entrega'}</h4>
                        </div>

                        {orderType === 'domicilio' ? (
                            <div className="space-y-4">
                                <input required name="customerName" placeholder="Tu Nombre *" value={formData.customerName} onChange={handleInputChange} className="w-full p-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                <input required name="customerPhone" placeholder="Tu Teléfono *" value={formData.customerPhone} onChange={handleInputChange} className="w-full p-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                <input required name="address" placeholder="Dirección Completa *" value={formData.address} onChange={handleInputChange} className="w-full p-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input required name="city" placeholder="Ciudad *" value={formData.city} onChange={handleInputChange} className="w-full p-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                    <input required name="department" placeholder="Departamento *" value={formData.department} onChange={handleInputChange} className="w-full p-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <select required name="tableNumber" value={formData.tableNumber} onChange={handleInputChange} className="w-full p-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-700">
                                    <option value="">Selecciona tu mesa *</option>
                                    {tables.map(t => <option key={t.id} value={t.number}>Mesa {t.number}</option>)}
                                    {tables.length === 0 && <option value="">No hay mesas disponibles</option>}
                                </select>
                                <input required name="customerPhone" placeholder="Tu Teléfono (Para notificarte) *" value={formData.customerPhone} onChange={handleInputChange} className="w-full p-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
                            </div>
                        )}

                        <textarea name="notes" placeholder="Notas adicionales (Ej: Sin cebolla, extra salsa...)" value={formData.notes} onChange={handleInputChange} className="w-full p-4 bg-orange-50/30 border border-orange-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-none text-sm" />

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Método de Pago</label>
                            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700">
                                <option value="Efectivo">Efectivo</option>
                                <option value="Nequi">Nequi</option>
                                <option value="Daviplata">Daviplata</option>
                                {business.paymentConfigs?.stripe?.enabled && <option value="Stripe">Tarjeta de Crédito (Stripe)</option>}
                            </select>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-white sticky bottom-0 z-10 space-y-3">
                    <button
                        type="submit"
                        form="order-form"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        {isSubmitting ? 'Procesando...' : (orderType === 'domicilio' ? 'Pedir Domicilio' : 'Confirmar Pedido')}
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-4 bg-orange-50 text-orange-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-orange-100 transition">
                            Seguir viendo
                        </button>
                        <button onClick={() => setQuantity(1)} className="flex-1 py-4 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-600 transition shadow-lg shadow-rose-100">
                            Vaciar
                        </button>
                    </div>
                </div>
            </div>

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

export default OrderModal;
