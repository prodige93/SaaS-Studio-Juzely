import { Button } from "@/components/ui/button"
import { useProjectSteps } from "@/hooks/useProjectSteps"
import { InitializeStepsButton } from "./InitializeStepsButton"
import { Loader2, Check, Clock, Circle, AlertCircle } from "lucide-react"

interface ProjectStepsListProps {
  projectId: string
}

export function ProjectStepsList({ projectId }: ProjectStepsListProps) {
  const { steps, loading, toggleStepStatus } = useProjectSteps(projectId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (steps.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground text-center py-2">
          Aucune étape définie
        </div>
        <InitializeStepsButton projectId={projectId} hasSteps={false} />
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleStepClick = async (stepId: string, currentStatus: string) => {
    if (currentStatus !== 'blocked' && currentStatus !== 'cancelled') {
      await toggleStepStatus(stepId, currentStatus)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {steps.map((step) => (
        <button
          key={step.id}
          onClick={() => handleStepClick(step.id, step.status)}
          disabled={step.status === 'blocked' || step.status === 'cancelled'}
          className="flex items-center gap-2 p-2 border rounded hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            {getStatusIcon(step.status)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs truncate block">{step.name}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
