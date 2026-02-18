# Características del Plan Básico — Mini Menu AI SaaS

Documento que describe las características que debe tener el **Plan Básico** de la aplicación, alineadas con los recursos y límites definidos en el código.

---

## Resumen del plan (según `constants.ts`)

| Atributo        | Valor   |
|-----------------|---------|
| **Nombre**      | Básico  |
| **Precio**      | 0 (gratuito) |
| **Productos**   | Hasta 10 |
| **Usos IA Voz** | 5 (por periodo) |

---

## 1. Límites cuantitativos

- **Productos en el menú:** máximo **10**.  
  Debe validarse en el panel al crear un producto: `business.usage.productCount < PLANS[PlanType.BASIC].maxProducts`. Si ya hay 10, no permitir añadir más hasta cambiar de plan o eliminar alguno.

- **Usos de IA por voz:** máximo **5** por periodo.  
  Cada llamada a `generateProductFromVoice` debe incrementar `business.usage.voiceAICount` y bloquear la función si se alcanza el límite (mostrar mensaje tipo “Has alcanzado el límite de usos de IA por voz de tu plan. Mejora a Pro para más usos.”).

- **Sin acceso a Estadísticas:** el plan Básico **no** incluye la sección o pestaña de estadísticas del panel. Esa funcionalidad queda reservada para Pro (y superiores).

---

## 2. Funcionalidades incluidas (recursos de la app)

El Básico debe tener acceso a las mismas áreas del producto que permitan operar un menú y recibir pedidos, pero dentro de los límites anteriores:

- **Menú digital público**  
  URL pública del menú usando el identificador del negocio (`business.id`). Ejemplo: `tudominio.com?business=<uuid>`. Incluye filtros por categoría y búsqueda en el menú.  
  *(Opcional de negocio: no mostrar o desactivar el slug personalizado para Básico; si se permite, funciona igual que en Pro pero con límite de 10 productos.)*

- **Gestión de pedidos**  
  Los clientes pueden hacer pedidos desde el menú público (mesa o domicilio). El negocio ve la lista de pedidos en el panel y puede cambiar el estado (pendiente → en preparación → entregado / cancelado). Misma lógica que en Pro, sin límite de número de pedidos.

- **Gestión de mesas**  
  Uso del módulo **TablesManager**: crear, editar y eliminar mesas. Necesario para pedidos “en mesa”.  
  *(Opcional: limitar número de mesas en Básico, ej. máx. 5; si no está definido en código, dejarlo ilimitado o igual que Pro.)*

- **Métodos de pago**  
  Configuración en perfil: efectivo y, si se desea, uno o dos métodos digitales (ej. solo efectivo + Nequi) para mantener el Básico simple.  
  *(En el código todos los métodos están disponibles para cualquier negocio; la restricción por plan sería una decisión de producto: ej. Básico = solo efectivo, Pro = todos.)*

- **Compartir**  
  - URL pública del menú (por `business.id`).  
  - Generación de QR con la misma URL (api.qrserver.com).  
  - Enlace a WhatsApp en el menú público si el negocio tiene `socials.whatsapp` configurado.  
  *(Opcional: mensaje e imagen personalizados de compartir solo en Pro; en Básico usar mensaje por defecto.)*

- **Perfil del negocio**  
  Nombre, tipo, descripción, teléfono, email, ubicación, logo, IVA, valor de domicilio, Google Maps (iframe), redes sociales. Subida de logo/avatar/banner mediante **storageService**.  
  Todo lo necesario para que el menú se vea bien y sea usable en Básico.

- **IA para productos**  
  - Crear producto por **texto** (Gemini): permitido en Básico, sin límite numérico en `constants`.  
  - Crear producto por **voz**: hasta **5 usos** por periodo; después bloquear y mostrar mensaje de mejora de plan.  
  - Generar imagen del producto con IA: según decisión de producto (puede ir incluido en Básico o reservado para Pro).

- **Sin Estadísticas**  
  La pestaña o sección “Estadísticas” no se muestra cuando `business.planId === PlanType.BASIC`. Solo visible para Pro y Enterprise.

---

## 3. Diferencias frente al Plan Pro

| Recurso / límite   | Básico | Pro   |
|--------------------|--------|--------|
| Precio             | 0      | 29,99 €/mes |
| Productos          | 10     | 50    |
| Usos IA Voz        | 5      | 100   |
| Estadísticas       | No     | Sí    |
| Slug personalizado | Opcional (no en features) | Sí (URL amigable) |
| Mensaje/imagen compartir | Opcional (por defecto) | Personalizable |
| Métodos de pago    | Efectivo (+ opc. 1–2) | Todos |

---

## 4. Implementación técnica recomendada

- **Validación al crear producto**  
  Si `business.planId === PlanType.BASIC` y `business.usage.productCount >= 10`, no permitir crear más productos; mostrar mensaje y enlace o botón para mejorar a Pro.

- **Validación al usar IA por voz**  
  Antes de `generateProductFromVoice`, comprobar `business.usage.voiceAICount < PLANS[PlanType.BASIC].maxVoiceAI`. Si no hay cupo, no llamar a la API y mostrar aviso. Tras cada uso exitoso, actualizar `usage.voiceAICount` en el negocio.

- **Ocultar Estadísticas para Básico**  
  En `BusinessAdminPanel`, la pestaña “Estadísticas” solo se renderiza o se habilita cuando `business.planId !== PlanType.BASIC` (o cuando `planId === PlanType.PRO || planId === PlanType.ENTERPRISE`).

- **Slug y compartir**  
  Si se decide que el slug es solo Pro: en Básico ocultar o desactivar el campo de alias en la sección “Compartir” y usar siempre la URL con `business.id`. Si el slug se deja para todos, el comportamiento es el mismo; la diferencia es solo comercial (Pro = “URL personalizada” como beneficio destacado).

- **Registro por defecto**  
  Los nuevos negocios se crean con `planId: PlanType.BASIC` (ya así en `RegistrationForm.tsx`), de modo que por defecto tienen límite de 10 productos y 5 usos de IA por voz.

---

## 5. Texto comercial sugerido para el Plan Básico

**Plan Básico — Gratis**

- Menú digital con hasta **10 productos**
- **5 usos** de IA por voz para crear productos
- Gestión de pedidos (mesa y domicilio)
- Gestión de mesas
- Pago en efectivo (y opcionalmente 1–2 métodos más según reglas de negocio)
- URL del menú y código QR para compartir
- Enlace a WhatsApp en el menú
- Perfil del negocio con logo y datos de contacto
- Crear productos con IA por texto
- *Sin estadísticas; mejora a Pro para analíticas y más productos.*

---

Este documento refleja los recursos actuales de la aplicación y la definición del plan en `constants.ts`. Si se añaden restricciones adicionales (ej. límite de mesas o de métodos de pago solo para Básico), conviene actualizar este archivo y aplicar las validaciones correspondientes en el código.
