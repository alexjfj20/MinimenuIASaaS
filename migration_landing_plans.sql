-- Tabla para Planes Fijos (landing) sincronizados con el Super Admin
CREATE TABLE IF NOT EXISTS public.landing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'yearly', 'lifetime')),
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 1,
  icon VARCHAR(50) NOT NULL DEFAULT '✨',
  color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  max_users INTEGER NOT NULL DEFAULT 5,
  max_projects INTEGER NOT NULL DEFAULT 2,
  hotmart_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_plans_public ON public.landing_plans(is_public, is_active);
CREATE INDEX IF NOT EXISTS idx_landing_plans_order ON public.landing_plans("order");

ALTER TABLE public.landing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read landing_plans" ON public.landing_plans FOR SELECT USING (true);
CREATE POLICY "Allow insert landing_plans" ON public.landing_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update landing_plans" ON public.landing_plans FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete landing_plans" ON public.landing_plans FOR DELETE USING (true);
