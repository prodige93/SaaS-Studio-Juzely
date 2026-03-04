-- Corriger le search_path des fonctions pour la sécurité
DROP TRIGGER IF EXISTS trigger_update_project_progress ON project_steps;
DROP TRIGGER IF EXISTS trigger_update_project_status ON projects;
DROP FUNCTION IF EXISTS update_project_progress();
DROP FUNCTION IF EXISTS update_project_status_from_progress();

-- Recréer la fonction avec search_path sécurisé
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_steps INTEGER;
  completed_steps INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Compter le nombre total d'étapes pour ce projet
  SELECT COUNT(*) INTO total_steps
  FROM project_steps
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);
  
  -- Compter le nombre d'étapes complétées
  SELECT COUNT(*) INTO completed_steps
  FROM project_steps
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND status = 'completed';
  
  -- Calculer le pourcentage de progression
  IF total_steps > 0 THEN
    progress_percentage := (completed_steps * 100) / total_steps;
  ELSE
    progress_percentage := 0;
  END IF;
  
  -- Mettre à jour la progression du projet
  UPDATE projects
  SET progress = progress_percentage,
      updated_at = now()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger qui se déclenche quand une étape est créée, modifiée ou supprimée
CREATE TRIGGER trigger_update_project_progress
  AFTER INSERT OR UPDATE OR DELETE ON project_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress();

-- Mettre à jour automatiquement le statut du projet selon la progression
CREATE OR REPLACE FUNCTION update_project_status_from_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la progression est à 100%, marquer le projet comme complété
  IF NEW.progress >= 100 THEN
    NEW.status := 'completed';
  -- Si la progression est entre 1 et 99%, marquer comme en cours
  ELSIF NEW.progress > 0 AND NEW.progress < 100 THEN
    IF NEW.status = 'draft' OR NEW.status = 'planning' THEN
      NEW.status := 'in_progress';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger pour mettre à jour automatiquement le statut du projet
CREATE TRIGGER trigger_update_project_status
  BEFORE UPDATE OF progress ON projects
  FOR EACH ROW
  WHEN (OLD.progress IS DISTINCT FROM NEW.progress)
  EXECUTE FUNCTION update_project_status_from_progress();