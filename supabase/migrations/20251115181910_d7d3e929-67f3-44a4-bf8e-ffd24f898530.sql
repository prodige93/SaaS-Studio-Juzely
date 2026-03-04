-- Activer la synchronisation en temps réel pour toutes les tables
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER TABLE public.factories REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.samples REPLICA IDENTITY FULL;
ALTER TABLE public.project_steps REPLICA IDENTITY FULL;
ALTER TABLE public.project_products REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.factories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.samples;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_products;