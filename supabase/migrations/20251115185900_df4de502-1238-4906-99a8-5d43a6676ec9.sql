-- Supprimer le trigger d'abord, puis recréer la fonction avec la nouvelle logique
DROP TRIGGER IF EXISTS trigger_update_project_status ON projects;

DROP FUNCTION IF EXISTS update_project_status_from_progress();

CREATE OR REPLACE FUNCTION update_project_status_from_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Si la progression atteint 100%, marquer le projet comme terminé
  IF NEW.progress >= 100 THEN
    NEW.status := 'completed';
    
  -- Si la progression redescend en dessous de 100% et que le projet était terminé,
  -- le repasser en "in_progress"
  ELSIF NEW.progress < 100 AND OLD.status = 'completed' THEN
    NEW.status := 'in_progress';
    
  -- Si la progression est entre 1 et 99% et le projet est en draft ou planning,
  -- le passer en "in_progress"
  ELSIF NEW.progress > 0 AND NEW.progress < 100 THEN
    IF NEW.status = 'draft' OR NEW.status = 'planning' THEN
      NEW.status := 'in_progress';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recréer le trigger
CREATE TRIGGER trigger_update_project_status
BEFORE UPDATE ON projects
FOR EACH ROW
WHEN (OLD.progress IS DISTINCT FROM NEW.progress)
EXECUTE FUNCTION update_project_status_from_progress();