
-- Migración para extender la tabla de pedidos con campos de entrega y tipo
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'domicilio',
ADD COLUMN IF NOT EXISTS table_number VARCHAR(50);

-- Actualizar comentarios para claridad
COMMENT ON COLUMN public.orders.order_type IS 'Tipo de pedido: mesa o domicilio';
COMMENT ON COLUMN public.orders.table_number IS 'Número de mesa si el pedido es en sitio';
