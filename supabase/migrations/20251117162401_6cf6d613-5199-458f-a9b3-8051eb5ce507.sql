-- Créer une table pour suivre la progression de chaque produit
CREATE TABLE IF NOT EXISTS public.product_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.project_products(id) ON DELETE CASCADE,
  progress SMALLINT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, product_id)
);

-- Activer RLS
ALTER TABLE public.product_progress ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour product_progress
CREATE POLICY "Admins manage product progress"
  ON public.product_progress
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view product progress"
  ON public.product_progress
  FOR SELECT
  USING (auth.role() = 'authenticated'::text);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_product_progress_updated_at
  BEFORE UPDATE ON public.product_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer la progression globale du projet basée sur la progression des produits
CREATE OR REPLACE FUNCTION public.update_project_progress_from_products()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_products INTEGER;
  total_progress INTEGER;
  avg_progress INTEGER;
BEGIN
  -- Compter le nombre total de produits pour ce projet
  SELECT COUNT(*) INTO total_products
  FROM product_progress
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);
  
  -- Calculer la somme de la progression de tous les produits
  SELECT COALESCE(SUM(progress), 0) INTO total_progress
  FROM product_progress
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);
  
  -- Calculer la moyenne de progression
  IF total_products > 0 THEN
    avg_progress := total_progress / total_products;
  ELSE
    avg_progress := 0;
  END IF;
  
  -- Mettre à jour la progression du projet
  UPDATE projects
  SET progress = avg_progress,
      updated_at = now()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger pour mettre à jour la progression du projet quand la progression d'un produit change
CREATE TRIGGER update_project_progress_on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON public.product_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_progress_from_products();

-- Fonction pour initialiser automatiquement la progression des produits quand un produit est ajouté
CREATE OR REPLACE FUNCTION public.initialize_product_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Créer une entrée de progression pour le nouveau produit
  INSERT INTO public.product_progress (project_id, product_id, progress)
  VALUES (NEW.project_id, NEW.id, 0)
  ON CONFLICT (project_id, product_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger pour initialiser la progression quand un produit est créé
CREATE TRIGGER initialize_product_progress_on_insert
  AFTER INSERT ON public.project_products
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_product_progress();

-- Modifier la politique RLS des projets pour permettre aux admins d'insérer des projets
DROP POLICY IF EXISTS "Admins manage projects" ON public.projects;
CREATE POLICY "Admins manage projects"
  ON public.projects
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));