
-- Agregar columnas faltantes en la tabla businesses
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS country_code VARCHAR(5) DEFAULT '57';

-- Comentarios
COMMENT ON COLUMN public.businesses.description IS 'Descripción pública del negocio';
COMMENT ON COLUMN public.businesses.country_code IS 'Código de país para WhatsApp (ej: 57)';
