-- Permettre aux utilisateurs authentifiés de créer des projets
CREATE POLICY "Authenticated users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Permettre aux utilisateurs authentifiés de créer des produits de projet
CREATE POLICY "Authenticated users can create project products"
ON public.project_products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_products.project_id
    AND projects.created_by = auth.uid()
  )
);

-- Permettre aux utilisateurs authentifiés de créer des progressions de produit
CREATE POLICY "Authenticated users can create product progress"
ON public.product_progress
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = product_progress.project_id
    AND projects.created_by = auth.uid()
  )
);

-- Permettre aux utilisateurs authentifiés de créer des étapes de projet
CREATE POLICY "Authenticated users can create project steps"
ON public.project_steps
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_steps.project_id
    AND projects.created_by = auth.uid()
  )
);