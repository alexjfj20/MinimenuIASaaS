# Características del Plan Pro — Mini Menu AI SaaS

Documento que describe las características que debe tener el **Plan Pro** de la aplicación, alineadas con los recursos y límites definidos en el código.

---

## Resumen del plan (según `constants.ts`)

| Atributo      | Valor   |
|---------------|---------|
| **Nombre**    | Pro     |
| **Precio**    | 29,99 (mensual) |
| **Productos** | Hasta 50 |
| **Usos IA Voz** | 100/mes (o por periodo) |

---

## 1. Límites cuantitativos

- **Productos en el menú:** máximo **50** (frente a 10 del Básico).  
  Debe aplicarse en el panel al crear/editar productos (validar `usage.productCount` vs `PLANS[PlanType.PRO].maxProducts`).

- **Usos de IA por voz:** máximo **100** por periodo (frente a 5 del Básico).  
  Cada llamada a `generateProductFromVoice` debe incrementar `usage.voiceAICount` y bloquear si se supera el límite.

- **Estadísticas:** el plan Pro incluye acceso a **Estadísticas** (módulo o sección en el panel de negocio; el Básico no la tiene o tiene una versión reducida).

---

## 2. Funcionalidades incluidas (recursos de la app)

Todas estas funcionalidades existen en la aplicación y deben estar **incluidas** en el Plan Pro:

- **Menú digital público**  
  URL pública del menú (por `business.id` o por `menuSlug` si está activo). Incluye filtros por categoría y búsqueda.

- **Gestión de pedidos**  
  Crear pedidos desde el menú público (mesa o domicilio), elegir método de pago, ver lista de pedidos en el panel y actualizar estado (pendiente → en preparación → entregado / cancelado).

- **Gestión de mesas**  
  Uso del módulo **TablesManager**: crear, editar y eliminar mesas (número, capacidad, ubicación). Necesario para pedidos tipo “mesa” en el menú público.

- **Métodos de pago**  
  Configuración en perfil del negocio: efectivo, Nequi, DaviPlata, Bancolombia, Mercado Pago, Stripe. El Pro puede tener todos habilitados (el Básico puede limitarse a efectivo u otros según reglas de negocio).

- **Alias / slug del menú**  
  `menuSlug` + `menuSlugActive`: URL amigable para compartir (ej. `tudominio.com?business=mi-restaurante`). Incluye comprobación de disponibilidad del slug.

- **Compartir y marketing**  
  - URL pública, generación de QR (api.qrserver.com).  
  - Mensaje e imagen personalizados para compartir (`customShareMessage`, `customShareImageUrl`).  
  - Enlace directo a WhatsApp desde el menú público (`socials.whatsapp`).

- **Perfil del negocio**  
  Logo, avatar, banner, IVA, valor de domicilio, iframe de Google Maps, descripción, redes sociales (WhatsApp, Instagram, Facebook, etc.). Subida de imágenes vía **storageService** (avatares, logos, banners, QR).

- **IA para productos**  
  - Crear producto por **texto** (Gemini).  
  - Crear producto por **voz** (hasta el límite de 100 usos en Pro).  
  - Generar imagen del producto con IA.  
  El Pro tiene 100 usos de voz; el Básico 5.

- **Estadísticas**  
  Acceso a la sección o panel de estadísticas (ventas, pedidos, productos más pedidos, etc.), si está implementado o previsto en el panel de negocio.

---

## 3. Diferencias frente al plan Básico

| Recurso / límite   | Básico | Pro   |
|--------------------|--------|-------|
| Productos          | 10     | 50    |
| Usos IA Voz        | 5      | 100   |
| Estadísticas       | No     | Sí    |
| (Opcional) Mesas   | Limitar o no | Incluido |
| (Opcional) Slug    | No     | Sí    |
| (Opcional) Pagos   | Solo efectivo | Todos |

Las filas “(Opcional)” dependen de cómo quieras diferenciar comercialmente el Básico; técnicamente la app ya soporta mesas, slug y todos los pagos para cualquier plan.

---

## 4. Implementación técnica recomendada

- **Validación de límites en el panel**  
  Antes de crear producto: comprobar `business.usage.productCount < PLANS[business.planId].maxProducts`.  
  Antes de usar IA por voz: comprobar `business.usage.voiceAICount < PLANS[business.planId].maxVoiceAI` y, tras uso exitoso, actualizar `usage.voiceAICount` en el negocio.

- **Estadísticas**  
  Si aún no existe la vista, crear una pestaña o sección “Estadísticas” en `BusinessAdminPanel` solo visible cuando `business.planId === PlanType.PRO` (o también ENTERPRISE). Datos a mostrar: total pedidos, por estado, por método de pago, productos más vendidos (a partir de `orders`).

- **Sincronización con Supabase**  
  El plan activo del negocio puede venir de `negocio_planes` (tabla `planes` + `negocio_planes`). Mantener `business.planId` alineado con el plan asignado (mapeo por nombre, ej. “Plan Pro” → `PlanType.PRO`) para que los límites y las funcionalidades (estadísticas, slug, etc.) se apliquen correctamente.

---

## 5. Texto comercial sugerido para el Plan Pro

**Plan Pro — 29,99 €/mes**

- Menú digital con hasta **50 productos**
- **100 usos** de IA por voz para crear productos
- Gestión de pedidos (mesa y domicilio)
- Gestión de mesas
- Múltiples métodos de pago (efectivo, Nequi, DaviPlata, Bancolombia, Mercado Pago, Stripe)
- URL personalizada para tu menú (slug)
- Compartir con QR y mensaje personalizado
- Enlace a WhatsApp en el menú
- **Estadísticas** de ventas y pedidos
- Logo, banner e imágenes del negocio en la nube

---

Este documento refleja los recursos actuales de la aplicación (`constants.ts`, `types.ts`, servicios y vistas). Si añades nuevos módulos (por ejemplo, reportes avanzados o multi-sucursal), conviene ampliar aquí las características del Plan Pro.
