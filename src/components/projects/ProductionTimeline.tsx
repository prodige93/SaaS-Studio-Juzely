import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useProjectSteps } from "@/hooks/useProjectSteps"

interface ProductionTimelineProps {
  projectId: string
  projectName: string
  productId?: string
  productName?: string
  readOnly?: boolean
}

export function ProductionTimeline({ projectId, projectName, productId, productName, readOnly = false }: ProductionTimelineProps) {
  const { steps, loading } = useProjectSteps(projectId)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (steps.length > 0) {
      console.log('Steps status:', steps.map(s => ({ name: s.name, status: s.status })))
      // Find current step (first in_progress or first pending)
      const inProgressIndex = steps.findIndex(s => s.status === 'in_progress')
      const firstPendingIndex = steps.findIndex(s => s.status === 'pending')
      setCurrentStepIndex(inProgressIndex >= 0 ? inProgressIndex : firstPendingIndex >= 0 ? firstPendingIndex : 0)
    }
  }, [steps])

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Chargement des étapes...
      </div>
    )
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune étape définie pour ce projet
      </div>
    )
  }

  const completedSteps = steps.filter(s => s.status === 'completed').length
  const progressPercentage = (completedSteps / steps.length) * 100

  // Find the first non-completed step - only this one and all completed before it are accessible
  const firstNonCompletedIndex = steps.findIndex(s => s.status !== 'completed')

  const currentStep = steps[currentStepIndex]
  
  // Check if a step is accessible
  const isStepAccessible = (index: number) => {
    // For multi-product projects (no specific productId), allow free navigation
    if (!productId) return true
    
    // For single product, restrict to completed steps and first non-completed
    if (steps[index].status === 'completed') return true
    if (index === firstNonCompletedIndex) return true
    return false
  }

  return (
    <div className="space-y-8">
      {/* Product name if specified */}
      {productName && (
        <div className="text-center">
          <h3 className="text-lg font-semibold">{productName}</h3>
        </div>
      )}

      {/* Current step details */}
      {currentStep && (
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                {currentStep.name}
              </h3>
              {currentStep.started_at && (
                <p className="text-sm text-muted-foreground">
                  Date commencement : {new Date(currentStep.started_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            <div>
              {currentStep.status === 'completed' && (
                <Badge variant="default" className="bg-green-600">
                  Terminé
                </Badge>
              )}
              {currentStep.status === 'in_progress' && (
                <Badge variant="default" className="bg-orange-500">
                  En cours
                </Badge>
              )}
              {currentStep.status === 'pending' && (
                <Badge variant="secondary">
                  En attente
                </Badge>
              )}
            </div>
          </div>

          {/* Navigation between steps - only show if not read-only */}
          {!readOnly && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevIndex = currentStepIndex - 1
                  if (prevIndex >= 0 && isStepAccessible(prevIndex)) {
                    setCurrentStepIndex(prevIndex)
                  }
                }}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Etape precedente
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentStepIndex + 1} / {steps.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextIndex = currentStepIndex + 1
                  if (nextIndex < steps.length && isStepAccessible(nextIndex)) {
                    setCurrentStepIndex(nextIndex)
                  }
                }}
                disabled={currentStepIndex === steps.length - 1 || !isStepAccessible(currentStepIndex + 1)}
              >
                Etape suivante
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
          {readOnly && (
            <div className="flex justify-center pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
