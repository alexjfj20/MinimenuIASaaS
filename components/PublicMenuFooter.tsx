import React from 'react';
import { Business } from '../types';

interface PublicMenuFooterProps {
    business: Business;
}

const PublicMenuFooter: React.FC<PublicMenuFooterProps> = ({ business }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-white mt-20">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Logo y Nombre */}
                <div className="flex flex-col items-center text-center mb-10">
                    <img
                        src={business.logo}
                        className="w-20 h-20 rounded-2xl border-2 border-slate-700 shadow-xl object-cover mb-4"
                        alt={`${business.name} logo`}
                    />
                    <h3 className="text-2xl font-black text-white">{business.name}</h3>
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-1">{business.type}</p>
                </div>

                {/* Descripción si existe */}
                {business.description && (
                    <div className="mb-10 text-center">
                        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto">
                            {business.description}
                        </p>
                    </div>
                )}

                {/* Grid de Información de Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Teléfono */}
                    {business.phone && (
                        <a
                            href={`tel:${business.phone}`}
                            className="flex flex-col items-center p-6 bg-slate-800 rounded-2xl hover:bg-slate-750 transition group"
                        >
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Teléfono</p>
                            <p className="text-sm font-bold text-white">{business.phone}</p>
                        </a>
                    )}

                    {/* Email */}
                    {business.email && (
                        <a
                            href={`mailto:${business.email}`}
                            className="flex flex-col items-center p-6 bg-slate-800 rounded-2xl hover:bg-slate-750 transition group"
                        >
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                            <p className="text-sm font-bold text-white break-all">{business.email}</p>
                        </a>
                    )}

                    {/* Dirección */}
                    {business.location && (
                        <div className="flex flex-col items-center p-6 bg-slate-800 rounded-2xl md:col-span-1">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dirección</p>
                            <p className="text-sm font-bold text-white text-center">{business.location}</p>
                        </div>
                    )}
                </div>

                {/* Redes Sociales */}
                {business.socials && Object.values(business.socials).some(val => val) && (
                    <div className="mb-10">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] text-center mb-6">Síguenos</h4>
                        <div className="flex flex-wrap justify-center gap-3">
                            {business.socials.whatsapp && (
                                <a
                                    href={`https://wa.me/${business.socials.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition font-bold text-sm"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    WhatsApp
                                </a>
                            )}
                            {business.socials.instagram && (
                                <a
                                    href={`https://instagram.com/${business.socials.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 rounded-xl transition font-bold text-sm"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                    Instagram
                                </a>
                            )}
                            {business.socials.facebook && (
                                <a
                                    href={`https://facebook.com/${business.socials.facebook}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl transition font-bold text-sm"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    Facebook
                                </a>
                            )}
                            {business.socials.twitter && (
                                <a
                                    href={`https://twitter.com/${business.socials.twitter.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 rounded-xl transition font-bold text-sm"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                    Twitter
                                </a>
                            )}
                            {business.socials.tiktok && (
                                <a
                                    href={`https://tiktok.com/@${business.socials.tiktok.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition font-bold text-sm"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                                    TikTok
                                </a>
                            )}
                            {business.socials.youtube && (
                                <a
                                    href={`https://youtube.com/${business.socials.youtube}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl transition font-bold text-sm"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                    YouTube
                                </a>
                            )}
                            {business.socials.website && (
                                <a
                                    href={business.socials.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition font-bold text-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                    Sitio Web
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Copyright */}
                <div className="pt-8 border-t border-slate-800 text-center">
                    <p className="text-slate-400 text-xs">
                        © {currentYear} <span className="font-bold text-white">{business.name}</span>. Todos los derechos reservados.
                    </p>
                    <p className="text-slate-500 text-[10px] mt-2 font-black uppercase tracking-widest">
                        Menú Digital Powered by IA
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default PublicMenuFooter;
