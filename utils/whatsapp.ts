
import { formatWhatsAppNumber } from './phoneFormatter';

/**
 * Abre la API de WhatsApp con el número y mensaje especificados.
 * Realiza el formateo y validación del número antes de intentar abrir.
 * 
 * @param rawPhone Número de teléfono sin procesar (ej: "322 123...")
 * @param countryCode Código de país (ej: "57")
 * @param message Mensaje a enviar
 * @returns true si se abrió correctamente, false si el número no es válido
 */
export const handleShareWhatsApp = (
    rawPhone: string,
    countryCode: string,
    message: string
): boolean => {
    const formattedPhone = formatWhatsAppNumber(rawPhone, countryCode);

    if (!formattedPhone) {
        console.warn("handleShareWhatsApp: Número de teléfono inválido", { rawPhone, countryCode });
        return false;
    }

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    // Abrir en nueva pestaña para no perder el contexto de la app
    window.open(url, '_blank');
    return true;
};
