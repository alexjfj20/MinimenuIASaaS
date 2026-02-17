
import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: NotificationType;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, title, message, type }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                // Posibilidad de auto-cerrar en el futuro si se desea
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const icons = {
        success: (
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        ),
        error: (
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        ),
        warning: (
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
        )
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-white/20 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                {icons[type]}
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{message}</p>

                <button
                    onClick={onClose}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                            type === 'error' ? 'bg-rose-500 text-white shadow-rose-200' :
                                'bg-amber-500 text-white shadow-amber-200'
                        }`}
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};

export default NotificationModal;
