-- Permisos de escritura en planes y negocio_planes (RLS)
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase para que se guarden los planes.

-- Tabla: planes (permiso para insertar, actualizar, eliminar)
CREATE POLICY "Allow insert on planes" ON public.planes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on planes" ON public.planes
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete on planes" ON public.planes
  FOR DELETE USING (true);

-- Tabla: negocio_planes (permiso para insertar, actualizar, eliminar)
CREATE POLICY "Allow insert on negocio_planes" ON public.negocio_planes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on negocio_planes" ON public.negocio_planes
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete on negocio_planes" ON public.negocio_planes
  FOR DELETE USING (true);
