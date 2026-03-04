-- Supprimer l'ancienne policy restrictive pour les updates
DROP POLICY IF EXISTS "Admins manage project steps" ON public.project_steps;

-- Créer des policies séparées pour plus de flexibilité
-- Les admins peuvent tout faire (INSERT, DELETE)
CREATE POLICY "Admins can insert project steps"
ON public.project_steps
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete project steps"
ON public.project_steps
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Tous les utilisateurs authentifiés peuvent mettre à jour les étapes
CREATE POLICY "Authenticated users can update project steps"
ON public.project_steps
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');