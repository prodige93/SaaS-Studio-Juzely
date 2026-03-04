-- Insérer des clients d'exemple
INSERT INTO public.clients (name, email, phone, company_name, vat_number, city, country) VALUES
  ('Zara France', 'contact@zara.fr', '+33 1 23 45 67 89', 'Inditex France SAS', 'FR12345678901', 'Paris', 'France'),
  ('H&M Nordic', 'orders@hm.se', '+46 8 796 55 00', 'H&M Hennes & Mauritz AB', 'SE556042597301', 'Stockholm', 'Suède'),
  ('Mango Barcelona', 'production@mango.com', '+34 93 877 55 00', 'Punto FA SL', 'ESB08691482', 'Barcelone', 'Espagne'),
  ('Uniqlo Europe', 'eu.orders@uniqlo.com', '+44 20 7290 7990', 'Fast Retailing UK Ltd', 'GB123456789', 'Londres', 'Royaume-Uni');

-- Insérer des usines d''exemple
INSERT INTO public.factories (name, location, country, contact_person, email, phone, capacity, rating, specialties, certifications, status, notes) VALUES
  ('Textile Excellence Asia', 'Ho Chi Minh City', 'Vietnam', 'Nguyen Van A', 'contact@texexcel.vn', '+84 28 1234 5678', 50000, 4.5, ARRAY['T-shirts', 'Polos', 'Sweatshirts'], ARRAY['GOTS', 'OEKO-TEX', 'ISO 9001'], 'active', 'Partenaire fiable depuis 5 ans'),
  ('EuroTextile Premium', 'Porto', 'Portugal', 'Maria Silva', 'info@eurotextile.pt', '+351 22 123 4567', 30000, 4.8, ARRAY['Chemises', 'Pantalons', 'Vestes'], ARRAY['ISO 9001', 'ISO 14001', 'SA8000'], 'active', 'Qualité premium, délais respectés'),
  ('Bangladesh Garments Ltd', 'Dhaka', 'Bangladesh', 'Rahman Ahmed', 'orders@bgltd.bd', '+880 2 9876543', 80000, 4.2, ARRAY['Jeans', 'T-shirts', 'Robes'], ARRAY['BSCI', 'WRAP'], 'active', 'Grande capacité, prix compétitifs'),
  ('Turkish Fashion Manufacturing', 'Istanbul', 'Turquie', 'Mehmet Yilmaz', 'production@tfm.tr', '+90 212 555 0123', 40000, 4.6, ARRAY['Vestes', 'Manteaux', 'Costumes'], ARRAY['ISO 9001', 'OEKO-TEX'], 'active', 'Excellente finition, respect des délais');

-- Insérer des projets d''exemple
INSERT INTO public.projects (name, description, type, status, priority, client_id, factory_id, start_date, deadline, budget, estimated_cost, quantity, progress) 
SELECT 
  'Collection Été 2024 - T-shirts Bio',
  'Production de t-shirts en coton biologique pour la collection estivale',
  'BULK',
  'in_progress',
  'high',
  c.id,
  f.id,
  '2024-01-15',
  '2024-03-30',
  45000,
  42000,
  5000,
  65
FROM public.clients c, public.factories f
WHERE c.name = 'Zara France' AND f.name = 'Textile Excellence Asia'
LIMIT 1;

INSERT INTO public.projects (name, description, type, status, priority, client_id, factory_id, start_date, deadline, budget, estimated_cost, quantity, progress)
SELECT 
  'Échantillons Automne 2024',
  'Développement échantillons pour la collection automne',
  'SAMPLE',
  'review',
  'urgent',
  c.id,
  f.id,
  '2024-02-01',
  '2024-02-28',
  8000,
  7500,
  50,
  90
FROM public.clients c, public.factories f
WHERE c.name = 'H&M Nordic' AND f.name = 'EuroTextile Premium'
LIMIT 1;

INSERT INTO public.projects (name, description, type, status, priority, client_id, factory_id, start_date, deadline, budget, estimated_cost, quantity, progress)
SELECT 
  'Jeans Collection Premium',
  'Production de jeans premium avec lavages spéciaux',
  'BULK',
  'planning',
  'medium',
  c.id,
  f.id,
  '2024-03-01',
  '2024-05-15',
  75000,
  72000,
  3000,
  25
FROM public.clients c, public.factories f
WHERE c.name = 'Mango Barcelona' AND f.name = 'Bangladesh Garments Ltd'
LIMIT 1;

INSERT INTO public.projects (name, description, type, status, priority, client_id, factory_id, start_date, deadline, budget, estimated_cost, quantity, progress)
SELECT 
  'Vestes Hiver 2024-2025',
  'Collection de vestes et manteaux pour hiver',
  'BULK',
  'draft',
  'low',
  c.id,
  f.id,
  '2024-04-01',
  '2024-08-30',
  120000,
  115000,
  2000,
  10
FROM public.clients c, public.factories f
WHERE c.name = 'Uniqlo Europe' AND f.name = 'Turkish Fashion Manufacturing'
LIMIT 1;