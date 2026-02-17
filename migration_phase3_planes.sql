-- MIGRATION PHASE 3: SAAS PLANS SYSTEM

-- 1. Create 'planes' table (Master Plans)
CREATE TABLE IF NOT EXISTS public.planes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('mensual', 'anual', 'unico')),
  estado VARCHAR(50) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for 'planes'
CREATE INDEX IF NOT EXISTS idx_planes_estado ON public.planes(estado);
CREATE INDEX IF NOT EXISTS idx_planes_tipo ON public.planes(tipo);

-- 2. Create 'negocio_planes' table (Assignments)
CREATE TABLE IF NOT EXISTS public.negocio_planes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  negocio_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.planes(id) ON DELETE RESTRICT,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  estado VARCHAR(50) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'vencido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for 'negocio_planes'
CREATE INDEX IF NOT EXISTS idx_negocio_planes_negocio ON public.negocio_planes(negocio_id);
CREATE INDEX IF NOT EXISTS idx_negocio_planes_estado ON public.negocio_planes(estado);

-- 3. RLS Policies (Optional but recommended for SaaS)
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negocio_planes ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (or specific roles)
CREATE POLICY "Allow read access to all users" ON public.planes FOR SELECT USING (true);
CREATE POLICY "Allow read access to all users" ON public.negocio_planes FOR SELECT USING (true);

-- Allow write access only to service_role or admins (adjusted as needed)
-- For now, open for development if needed, but in prod restrict to admin
-- CREATE POLICY "Allow write access to admins" ON public.planes FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
