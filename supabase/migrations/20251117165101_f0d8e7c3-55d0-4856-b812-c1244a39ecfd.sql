-- Supprimer les politiques qui permettaient aux utilisateurs authentifiés de créer des projets
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create project products" ON public.project_products;
DROP POLICY IF EXISTS "Authenticated users can create product progress" ON public.product_progress;
DROP POLICY IF EXISTS "Authenticated users can create project steps" ON public.project_steps;