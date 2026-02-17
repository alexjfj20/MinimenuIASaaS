
-- Tabla para gestión de mesas
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    capacity INTEGER DEFAULT 1,
    location TEXT, -- Ej: Interior, Terraza, VIP
    status TEXT DEFAULT 'active', -- active, inactive
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Tables are viewable by anyone (public menu needs it)" 
ON public.tables FOR SELECT USING (true);

CREATE POLICY "Businesses can manage their own tables" 
ON public.tables FOR ALL 
USING (auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id));

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tables_updated_at
    BEFORE UPDATE ON public.tables
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
