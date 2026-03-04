-- Créer les triggers pour mettre à jour automatiquement le statut du projet

-- Trigger pour mettre à jour la progression du projet quand une étape change
DROP TRIGGER IF EXISTS trigger_update_project_progress ON project_steps;
CREATE TRIGGER trigger_update_project_progress
AFTER INSERT OR UPDATE OR DELETE ON project_steps
FOR EACH ROW
EXECUTE FUNCTION update_project_progress();

-- Trigger pour mettre à jour le statut du projet basé sur la progression
DROP TRIGGER IF EXISTS trigger_update_project_status ON projects;
CREATE TRIGGER trigger_update_project_status
BEFORE UPDATE ON projects
FOR EACH ROW
WHEN (OLD.progress IS DISTINCT FROM NEW.progress)
EXECUTE FUNCTION update_project_status_from_progress();