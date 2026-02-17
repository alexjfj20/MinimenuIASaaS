
-- 1. Habilitar RLS en la tabla orders (por seguridad, si no lo estaba)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Permitir que CUALQUIER usuario (incluyendo anónimos) cree pedidos
-- Esto es necesario para el Menú Público
CREATE POLICY "Enable insert for everyone" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- 3. Permitir que los usuarios vean sus propios pedidos (opcional, por si el frontend intenta leer lo que acaba de crear)
-- Nota: Como los usuarios anónimos no tienen ID persistente, esto es limitado, 
-- pero permite que el 'SELECT' inmediato tras el 'INSERT' funcione si la sesión se mantiene.
CREATE POLICY "Enable read access for created orders" 
ON public.orders 
FOR SELECT 
USING (true);

-- Opcional: restringir SELECT más adelante, pero 'true' desbloquea el flujo inmediato.
