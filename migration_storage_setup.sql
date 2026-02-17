-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE
-- Bucket para almacenar assets del negocio
-- =====================================================

-- Crear el bucket 'business-assets' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-assets',
  'business-assets',
  true,  -- Acceso público para lectura
  5242880,  -- 5MB límite por archivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS RLS PARA EL BUCKET
-- =====================================================

-- Permitir a usuarios autenticados SUBIR archivos
CREATE POLICY "Usuarios autenticados pueden subir imágenes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-assets');

-- Permitir LECTURA pública de todos los archivos
CREATE POLICY "Lectura pública de business assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'business-assets');

-- Permitir a usuarios autenticados ACTUALIZAR sus propios archivos
CREATE POLICY "Usuarios autenticados pueden actualizar imágenes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'business-assets')
WITH CHECK (bucket_id = 'business-assets');

-- Permitir a usuarios autenticados ELIMINAR sus propios archivos
CREATE POLICY "Usuarios autenticados pueden eliminar imágenes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'business-assets');
