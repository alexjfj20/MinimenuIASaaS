# 🚀 INSTRUCCIONES DE DESPLIEGUE - Corrección de Subida de Imágenes

## ⚠️ IMPORTANTE: Ejecutar Antes de Usar

Para que la subida de imágenes funcione, **DEBES ejecutar el script SQL en Supabase**.

---

## 📋 Pasos a Seguir

### 1️⃣ Ir a Supabase Dashboard

1. Abre tu navegador
2. Ve a: https://app.supabase.com
3. Inicia sesión si es necesario
4. Selecciona tu proyecto (hybridnzbupmhqrtkkvd)

### 2️⃣ Abrir SQL Editor

1. En el menú lateral izquierdo, busca **"SQL Editor"**
2. Click en **"SQL Editor"**

### 3️⃣ Crear Nueva Query

1. Click en el botón **"+ New Query"**
2. Se abrirá un editor de SQL vacío

### 4️⃣ Copiar y Pegar el Script

1. Abre el archivo: `migration_storage_setup.sql`
2. Copia TODO el contenido del archivo
3. Pégalo en el editor SQL de Supabase

### 5️⃣ Ejecutar el Script

1. Click en el botón **"Run"** (o presiona Ctrl+Enter)
2. Espera a que termine la ejecución
3. Deberías ver mensajes de éxito

### 6️⃣ Verificar Bucket Creado

1. En el menú lateral, ve a **"Storage"**
2. Deberías ver el bucket **"business-assets"** en la lista
3. ✅ Si lo ves, ¡todo está listo!

---

## ✅ Probar la Funcionalidad

### En tu Aplicación

1. Ve a **Panel Admin** → **Mi Perfil**
2. Busca la sección **"Identidad Visual"**
3. Click en **"Subir Avatar desde PC"**
4. Selecciona una imagen de tu computadora
5. ✅ Debería subirse sin errores
6. La imagen debe aparecer en la vista previa inmediatamente

### Guardar Cambios

1. Después de subir las imágenes que desees
2. Click en **"Guardar Cambios"** (botón azul arriba)
3. Recarga la página para verificar que se guardó

---

## ❓ Solución de Problemas

### Si aún obtienes un error:

**Error: "El bucket 'business-assets' no existe"**
- ✅ Verifica que ejecutaste el script SQL completo
- ✅ Ve a Storage en Supabase y confirma que el bucket existe

**Error: "No tienes permisos"**
- ✅ Asegúrate de estar logueado en la aplicación
- ✅ El script SQL debería haber creado las políticas correctas

**Error: "Archivo demasiado grande"**
- ✅ El límite es 5MB
- ✅ Intenta con una imagen más pequeña o comprime la imagen

**Error: "Tipo de archivo no válido"**
- ✅ Solo se permiten: JPG, PNG, GIF, WEBP
- ✅ No uses PDF, SVG u otros formatos

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas:

1. Verifica que el script SQL se ejecutó sin errores
2. Revisa la consola del navegador (F12) para ver errores específicos
3. Asegúrate de que tu sesión de Supabase esté activa

---

**✅ Una vez ejecutado el script SQL, la funcionalidad quedará activa permanentemente.**
