-- Ajouter product_id à la table project_steps pour lier les étapes aux produits
ALTER TABLE public.project_steps 
ADD COLUMN product_id UUID REFERENCES public.project_products(id) ON DELETE CASCADE;

-- Créer un index pour améliorer les performances
CREATE INDEX idx_project_steps_product_id ON public.project_steps(product_id);

-- Modifier la fonction pour calculer la progression d'un produit basé sur ses étapes
CREATE OR REPLACE FUNCTION public.update_product_progress_from_steps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_steps INTEGER;
  completed_steps INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Si l'étape est liée à un produit spécifique
  IF COALESCE(NEW.product_id, OLD.product_id) IS NOT NULL THEN
    -- Compter le nombre total d'étapes pour ce produit
    SELECT COUNT(*) INTO total_steps
    FROM project_steps
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
    
    -- Compter le nombre d'étapes complétées
    SELECT COUNT(*) INTO completed_steps
    FROM project_steps
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      AND status = 'completed';
    
    -- Calculer le pourcentage de progression
    IF total_steps > 0 THEN
      progress_percentage := (completed_steps * 100) / total_steps;
    ELSE
      progress_percentage := 0;
    END IF;
    
    -- Mettre à jour la progression du produit dans product_progress
    UPDATE product_progress
    SET progress = progress_percentage,
        updated_at = now()
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger pour mettre à jour automatiquement la progression quand une étape change
DROP TRIGGER IF EXISTS update_product_progress_on_step_change ON public.project_steps;
CREATE TRIGGER update_product_progress_on_step_change
  AFTER INSERT OR UPDATE OR DELETE ON public.project_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_progress_from_steps();

-- Fonction pour initialiser les étapes de production par défaut pour un produit
CREATE OR REPLACE FUNCTION public.initialize_product_steps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  step_names TEXT[] := ARRAY[
    'Fiche technique',
    'Achats matières',
    'Prélavage',
    'Découpe',
    'Ajout détails',
    'Assemblage',
    'Contrôle qualité',
    'Transport'
  ];
  step_name TEXT;
  step_order INTEGER := 0;
BEGIN
  -- Créer les étapes par défaut pour ce produit
  FOREACH step_name IN ARRAY step_names
  LOOP
    INSERT INTO public.project_steps (
      project_id,
      product_id,
      name,
      status,
      order_index
    )
    VALUES (
      NEW.project_id,
      NEW.id,
      step_name,
      'pending',
      step_order
    );
    
    step_order := step_order + 1;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement les étapes quand un produit est ajouté
DROP TRIGGER IF EXISTS create_default_steps_on_product_insert ON public.project_products;
CREATE TRIGGER create_default_steps_on_product_insert
  AFTER INSERT ON public.project_products
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_product_steps();