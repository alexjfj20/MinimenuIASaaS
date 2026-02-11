
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * COMPONENTE DE DEBUG - PublicMenuDebugger
 * Muestra información detallada sobre el estado del menú público
 */
const PublicMenuDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({
    businessId: null,
    businessFound: false,
    errors: [],
  });
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debugMode = params.get('debug') === 'true';
    setIsDebugMode(debugMode);
    if (debugMode) runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const params = new URLSearchParams(window.location.search);
    const businessIdentifier = params.get('business');
    const errors: string[] = [];
    let businessData: any = null;

    if (!businessIdentifier) {
      errors.push('❌ Falta parámetro ?business=');
    } else {
      const { data: slugData } = await supabase.from('businesses').select('*').eq('menu_slug', businessIdentifier.toLowerCase()).maybeSingle();
      businessData = slugData;
      
      if (!businessData) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessIdentifier);
        if (isUuid) {
          const { data: idData } = await supabase.from('businesses').select('*').eq('id', businessIdentifier).maybeSingle();
          businessData = idData;
        }
      }
      
      if (!businessData) errors.push(`❌ Negocio "${businessIdentifier}" no encontrado.`);
    }

    setDebugInfo({ businessId: businessIdentifier, businessFound: !!businessData, businessData, errors });
  };

  if (!isDebugMode) return null;

  return (
    <div className="fixed top-4 right-4 z-[999] max-w-sm bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-slate-700 text-xs animate-in slide-in-from-right duration-300">
      <h3 className="font-black text-emerald-400 uppercase tracking-widest mb-4">🔍 Diagnóstico</h3>
      <div className="space-y-2">
        <p><span className="text-slate-500">Origen:</span> {window.location.origin}</p>
        <p><span className="text-slate-500">ID detectado:</span> {debugInfo.businessId}</p>
        <p><span className="text-slate-500">Estado:</span> {debugInfo.businessFound ? '✅ Encontrado' : '❌ No encontrado'}</p>
        {debugInfo.errors.map((e: string, i: number) => <p key={i} className="text-rose-400">{e}</p>)}
      </div>
      <button onClick={() => window.location.reload()} className="mt-4 w-full py-2 bg-slate-800 rounded-xl font-bold">Refrescar</button>
    </div>
  );
};

export default PublicMenuDebugger;
