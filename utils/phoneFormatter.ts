
/**
 * Formatea números de teléfono para generar enlaces de WhatsApp robustos.
 * Maneja casos de números locales (ej: Colombia) agregando el código de país si falta.
 */
export const formatWhatsAppNumber = (
    rawPhone: string,
    defaultCountryCode: string
): string | null => {
    if (!rawPhone) return null;

    // 1. Limpiar todo excepto números
    let phone = rawPhone.replace(/\D/g, '');

    // 2. Si ya empieza con el código del país configurado, lo dejamos
    // Nota: Esto asume que el código de país no se repite accidentalmente (ej: 5757...)
    // pero es seguro para la mayoría de casos.
    if (phone.startsWith(defaultCountryCode)) {
        return phone;
    }

    // 3. Casos especiales de longitud (heurística para LATAM y móviles)
    // Móviles en Colombia: 10 dígitos (3xx xxx xxxx). 
    // Fijos con indicativo: 10 dígitos (60x xxx xxxx).
    // Si tiene entre 8 y 11 dígitos, asumimos es local y agregamos país.
    if (phone.length >= 8 && phone.length <= 11) {
        return `${defaultCountryCode}${phone}`;
    }

    // 4. Validación mínima internacional
    // Si es muy largo (ej: 12+), asumimos que ya incluye algún código de país
    // y lo dejamos tal cual (ej: un cliente de otro país).
    if (phone.length >= 11 && phone.length <= 15) {
        return phone;
    }

    // Si no cumple nada, retornamos el número limpio como mejor esfuerzo
    return phone.length > 0 ? phone : null;
};
