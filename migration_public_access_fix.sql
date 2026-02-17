
-- Garantizar acceso público de lectura a las tablas críticas para el Menú Digital
-- Problema detectado: La política RLS actual impide ver negocios si el usuario no es el dueño o tiene una sesión anónima conflictiva.

-- 1. Habilitar RLS en businesses y products (por seguridad)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas que puedan causar conflictos (si existen)
DROP POLICY IF EXISTS "Public businesses are viewable by everyone" ON public.businesses;
DROP POLICY IF EXISTS "Allows public read access to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Allows public read access to products" ON public.products;

-- 3. Crear políticas permisivas para lectura (SELECT) para TODOS los roles (anon y authenticated)
CREATE POLICY "Public businesses are viewable by everyone" 
ON public.businesses FOR SELECT 
USING (true);

CREATE POLICY "Public products are viewable by everyone" 
ON public.products FOR SELECT 
USING (true);

-- Nota: Las políticas de INSERT/UPDATE/DELETE deben mantenerse restringidas al dueño (owner_id)
-- o administradores, las cuales ya deberían existir o se asumen por las migraciones previas.
