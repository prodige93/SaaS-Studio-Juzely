import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Step {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  order_index: number
  product_id: string | null
  project_id: string
  started_at?: string
  completed_at?: string
}

interface ProductStepsListProps {
  projectId: string
  productId: string
  productName: string
}

const statusConfig = {
  pending: {
    label: "En attente",
    icon: Circle,
    variant: "outline" as const,
    color: "text-muted-foreground"
  },
  in_progress: {
    label: "En cours",
    icon: Clock,
    variant: "default" as const,
    color: "text-primary"
  },
  completed: {
    label: "Terminé",
    icon: CheckCircle2,
    variant: "default" as const,
    color: "text-green-600"
  },
  blocked: {
    label: "Bloqué",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-destructive"
  },
  cancelled: {
    label: "Annulé",
    icon: XCircle,
    variant: "secondary" as const,
    color: "text-muted-foreground"
  }
}

export function ProductStepsList({ projectId, productId, productName }: ProductStepsListProps) {
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const { data, error } = await supabase
          .from('project_steps')
          .select('*')
          .eq('project_id', projectId)
          .eq('product_id', productId)
          .order('order_index', { ascending: true })

        if (error) throw error
        setSteps(data || [])
      } catch (error) {
        console.error('Error fetching product steps:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les étapes",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSteps()

    // Temps réel
    const channel = supabase
      .channel(`product-steps-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_steps',
          filter: `product_id=eq.${productId}`
        },
        (payload) => {
          // CRITICAL: Vérifier que l'événement est bien pour ce produit ET projet
          const newStep = payload.new as Step | null
          const oldStep = payload.old as Step | null
          const eventProductId = newStep?.product_id || oldStep?.product_id
          const eventProjectId = newStep?.project_id || oldStep?.project_id
          
          if (eventProductId !== productId || eventProjectId !== projectId) {
            return // Ignorer les événements d'autres produits/projets
          }
          
          if (payload.eventType === 'INSERT' && newStep) {
            setSteps((current) => [...current, newStep].sort((a, b) => a.order_index - b.order_index))
          } else if (payload.eventType === 'UPDATE' && newStep) {
            setSteps((current) =>
              current.map((step) =>
                step.id === newStep.id ? newStep : step
              )
            )
          } else if (payload.eventType === 'DELETE' && oldStep) {
            setSteps((current) => current.filter((step) => step.id !== oldStep.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, productId, toast])

  const updateStepStatus = async (stepId: string, currentStatus: Step['status']) => {
    try {
      let newStatus: Step['status']
      const updates: any = {}
      
      // Cycle: pending → in_progress → completed → pending
      if (currentStatus === 'pending') {
        newStatus = 'in_progress'
        updates.started_at = new Date().toISOString()
      } else if (currentStatus === 'in_progress') {
        newStatus = 'completed'
        updates.completed_at = new Date().toISOString()
      } else if (currentStatus === 'completed') {
        newStatus = 'pending'
        updates.started_at = null
        updates.completed_at = null
      } else {
        // Pour blocked ou cancelled, ne rien faire
        return
      }

      updates.status = newStatus

      const { error } = await supabase
        .from('project_steps')
        .update(updates)
        .eq('id', stepId)

      if (error) throw error

      const messages = {
        'pending': 'En attente',
        'in_progress': 'En cours',
        'completed': 'Terminée'
      }

      toast({
        title: "Étape mise à jour",
        description: `Étape marquée comme: ${messages[newStatus]}`
      })
    } catch (error) {
      console.error('Error updating step:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'étape",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">
        Étapes de production - {productName}
      </h4>
      <div className="space-y-2">
        {steps.map((step) => {
          const config = statusConfig[step.status]
          const Icon = config.icon

          return (
            <div
              key={step.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{step.name}</p>
                  {step.started_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Démarré: {new Date(step.started_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <Badge variant={config.variant} className="text-xs">
                  {config.label}
                </Badge>
              </div>
              
              {step.status !== 'completed' && step.status !== 'cancelled' && (
                <div className="flex gap-2 ml-3">
                  {step.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStepStatus(step.id, step.status)}
                      className="h-7 text-xs"
                    >
                      Démarrer
                    </Button>
                  )}
                  {step.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateStepStatus(step.id, step.status)}
                      className="h-7 text-xs"
                    >
                      Terminer
                    </Button>
                  )}
                </div>
              )}
              
              {step.status === 'completed' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateStepStatus(step.id, step.status)}
                  className="h-7 text-xs"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
