-- Ajouter les colonnes manquantes à la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications_projects BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications_orders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notifications_quality BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS compact_view BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'Français',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris (GMT+1)',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR (€)',
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS login_alerts_enabled BOOLEAN DEFAULT true;