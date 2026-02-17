
import React, { useState, useEffect } from 'react';
import { Business, Table } from '../types';
import { tableService } from '../services/tableService';

interface TablesManagerProps {
    business: Business;
}

const TablesManager: React.FC<TablesManagerProps> = ({ business }) => {
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<Table>>({
        number: '',
        capacity: 4,
        location: '',
        status: 'active',
        description: ''
    });

    useEffect(() => {
        loadTables();
    }, [business.id]);

    const loadTables = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await tableService.getTables(business.id);
            setTables(data);
        } catch (err: any) {
            console.error("Error al cargar mesas:", err);
            if (err.message?.includes('not found') || err.message?.includes('does not exist') || err.code === 'PGRST204' || err.code === 'PGRST205') {
                setError("La tabla de mesas no ha sido creada en la base de datos.");
            } else {
                setError("Ocurrió un error al cargar las mesas. Por favor contacta a soporte.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (form.id) {
                await tableService.updateTable(form.id, form);
            } else {
                await tableService.createTable({ ...form, businessId: business.id });
            }
            setIsAdding(false);
            setForm({ number: '', capacity: 4, location: '', status: 'active', description: '' });
            loadTables();
        } catch (err) {
            alert("Error al guardar mesa.");
        }
    };

    const handleEdit = (table: Table) => {
        setForm(table);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta mesa?")) return;
        try {
            await tableService.deleteTable(id);
            loadTables();
        } catch (err) {
            alert("Error al eliminar.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Mesas</h2>
                    <p className="text-slate-500 text-sm">Gestiona la capacidad y ubicación de tus mesas físicas.</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setForm({ number: '', capacity: 4, location: '', status: 'active', description: '' }); }}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition active:scale-95"
                >
                    Nueva Mesa
                </button>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="py-20 bg-rose-50 rounded-[2.5rem] border-2 border-dashed border-rose-200 text-center px-4">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <p className="text-rose-800 font-bold text-lg mb-2">{error}</p>
                    <p className="text-rose-600 text-sm max-w-lg mx-auto mb-8">Parece que la estructura de datos para las mesas aún no está lista en Supabase. Debes ejecutar el script de migración SQL.</p>
                    <button
                        onClick={loadTables}
                        className="px-8 py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-rose-700 transition"
                    >
                        Reintentar carga
                    </button>
                </div>
            ) : tables.length === 0 ? (
                <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay mesas configuradas</p>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                    >
                        Crear mi primera mesa
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables.map(table => (
                        <div key={table.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">Mesa {table.number}</h3>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{table.location || 'Sin ubicación'}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${table.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                    {table.status === 'active' ? 'Disponible' : 'Inactiva'}
                                </span>
                            </div>
                            <div className="space-y-2 mb-6 text-xs font-bold text-slate-600">
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-slate-400 uppercase tracking-tighter text-[10px]">Capacidad</span>
                                    <span>{table.capacity} Personas</span>
                                </div>
                                {table.description && (
                                    <p className="p-3 bg-slate-50 rounded-xl font-medium italic text-slate-500 line-clamp-2">{table.description}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(table)}
                                    className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(table.id)}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAdding && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">{form.id ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configura los detalles de la mesa</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número / Nombre</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: 1, VIP, Terraza 5"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={form.number}
                                        onChange={e => setForm({ ...form, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacidad</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={form.capacity}
                                        onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación / Zona</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Salón Principal, Terraza, Segundo Piso..."
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                                >
                                    <option value="active">Activa / Disponible</option>
                                    <option value="inactive">Inactiva / Mantenimiento</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas Internas</label>
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none font-medium text-slate-600"
                                    placeholder="Ej: Cerca de la ventana, necesita mesa extra..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl hover:bg-indigo-700 transition active:scale-95"
                            >
                                {form.id ? 'Actualizar Mesa' : 'Guardar Mesa'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TablesManager;
