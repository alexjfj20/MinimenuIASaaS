
import React, { useState } from 'react';
import { AppView, Business, PlanType } from '../types';
import { PLANS } from '../constants';

interface RegistrationFormProps {
  onRegister: (b: Business) => void;
  setView: (v: AppView) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister, setView }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Restaurante',
    email: '',
    phone: '',
    location: '',
    planId: PlanType.BASIC
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBusiness: Business = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      logo: `https://picsum.photos/seed/${formData.name}/200/200`,
      socials: {},
      paymentMethods: ['Efectivo'],
      usage: { voiceAICount: 0, productCount: 0 }
    };
    onRegister(newBusiness);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 bg-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Registra tu Negocio</h2>
          <p className="opacity-80">Únete a la nueva era del comercio digital</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Negocio</label>
            <input
              required
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Negocio</label>
              <select
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Restaurante</option>
                <option>Cafetería</option>
                <option>Tienda</option>
                <option>Servicios</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                required
                type="tel"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Admin</label>
            <input
              required
              type="email"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Seleccionar Plan</label>
            <div className="mt-2 grid grid-cols-1 gap-3">
              {Object.values(PLANS).map((plan) => (
                <label
                  key={plan.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    formData.planId === plan.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    className="hidden"
                    onChange={() => setFormData({ ...formData, planId: plan.id })}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between font-bold">
                      <span>Plan {plan.name}</span>
                      <span>${plan.price}/mes</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {plan.maxProducts === 9999 ? 'Ilimitado' : `${plan.maxProducts} platos`} • {plan.maxVoiceAI === 9999 ? 'IA Ilimitada' : `${plan.maxVoiceAI} usos IA`}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Crear mi cuenta
            </button>
            <button
              type="button"
              onClick={() => setView('landing')}
              className="mt-2 w-full text-center text-sm text-gray-500 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
