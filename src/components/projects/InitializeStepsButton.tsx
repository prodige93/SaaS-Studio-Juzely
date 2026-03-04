import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"

interface InitializeStepsButtonProps {
  projectId: string
  hasSteps: boolean
}

const DEFAULT_STEPS = [
  { name: "Fiche technique", order_index: 1 },
  { name: "Achats matières", order_index: 2 },
  { name: "Prélavage", order_index: 3 },
  { name: "Découpe", order_index: 4 },
  { name: "Ajout détails", order_index: 5 },
  { name: "Assemblage", order_index: 6 },
  { name: "Contrôle qualité", order_index: 7 },
  { name: "Transport", order_index: 8 },
]

export function InitializeStepsButton({ projectId, hasSteps }: InitializeStepsButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const initializeSteps = async () => {
    setLoading(true)
    try {
      const stepsToInsert = DEFAULT_STEPS.map(step => ({
        project_id: projectId,
        name: step.name,
        status: 'pending' as const,
        order_index: step.order_index,
      }))

      const { error } = await supabase
        .from('project_steps')
        .insert(stepsToInsert)

      if (error) throw error

      toast({
        title: "Étapes créées",
        description: `${DEFAULT_STEPS.length} étapes ont été ajoutées au projet`,
      })
    } catch (error) {
      console.error('Error initializing steps:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer les étapes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (hasSteps) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={initializeSteps}
      disabled={loading}
      className="w-full text-xs h-8 gap-1.5"
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Création...
        </>
      ) : (
        <>
          <Plus className="h-3 w-3" />
          Ajouter étapes
        </>
      )}
    </Button>
  )
}
