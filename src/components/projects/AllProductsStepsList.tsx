import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Check, Clock, Circle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Step {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  order_index: number
  product_id: string | null
  project_id: string
}

interface Product {
  id: string
  garment_type: string
  quantity: number
  custom_type?: string
  reference?: string
}

interface AllProductsStepsListProps {
  projectId: string
}

const garmentTypeLabels: Record<string, string> = {
  tshirt: "T-shirt",
  pull: "Pull",
  sweatshirt: "Sweatshirt",
  jacket: "Veste",
  pants: "Pantalon",
  headwear: "Couvre-chef",
  dress: "Robe",
  sweater: "Sweater",
  skirt: "Jupe",
  other: "Autre"
}

export function AllProductsStepsList({ projectId }: AllProductsStepsListProps) {
  const [steps, setSteps] = useState<Step[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('project_products')
          .select('*')
          .eq('project_id', projectId)

        if (productsError) throw productsError

        // Fetch all steps for this project
        const { data: stepsData, error: stepsError } = await supabase
          .from('project_steps')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true })

        if (stepsError) throw stepsError

        setProducts(productsData || [])
        setSteps(stepsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Temps réel pour les étapes
    const channel = supabase
      .channel(`all-steps-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_steps',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          // CRITICAL: Vérifier que l'événement est bien pour ce projet
          const newStep = payload.new as Step | null
          const oldStep = payload.old as Step | null
          const eventProjectId = newStep?.project_id || oldStep?.project_id
          
          if (eventProjectId && eventProjectId !== projectId) {
            return // Ignorer les événements d'autres projets
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
  }, [projectId, toast])

  const updateStepStatus = async (stepId: string, currentStatus: Step['status']) => {
    try {
      let newStatus: Step['status']
      const updates: any = {}

      // Cycle: pending → in_progress → completed
      if (currentStatus === 'pending') {
        newStatus = 'in_progress'
        updates.started_at = new Date().toISOString()
      } else if (currentStatus === 'in_progress') {
        newStatus = 'completed'
        updates.completed_at = new Date().toISOString()
      } else {
        newStatus = 'pending'
        updates.started_at = null
        updates.completed_at = null
      }

      updates.status = newStatus

      const { error } = await supabase
        .from('project_steps')
        .update(updates)
        .eq('id', stepId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating step:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'étape",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: Step['status']) => {
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

  const handleStepClick = async (stepId: string, currentStatus: Step['status']) => {
    if (currentStatus !== 'blocked' && currentStatus !== 'cancelled') {
      await updateStepStatus(stepId, currentStatus)
    }
  }

  const getProductSteps = (productId: string) => {
    return steps.filter(step => step.product_id === productId)
  }

  // Get steps without product_id (legacy steps or global steps)
  const getGlobalSteps = () => {
    return steps.filter(step => step.product_id === null || !step.product_id)
  }

  const getProductName = (product: Product) => {
    return product.reference || product.custom_type || garmentTypeLabels[product.garment_type] || product.garment_type
  }

  if (loading) {
    return <div className="text-xs text-muted-foreground">Chargement...</div>
  }

  const globalSteps = getGlobalSteps()

  return (
    <div className="space-y-4">
      {/* Display products with their specific steps */}
      {products.map((product) => {
        const productSteps = getProductSteps(product.id)
        
        return (
          <div key={product.id} className="space-y-2">
            <div className="text-xs font-medium text-foreground">
              {getProductName(product)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {productSteps.map((step) => (
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
          </div>
        )
      })}

      {/* Display global steps if no products or if there are legacy steps */}
      {products.length === 0 && globalSteps.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-foreground">
            Étapes du projet
          </div>
          <div className="grid grid-cols-2 gap-2">
            {globalSteps.map((step) => (
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
        </div>
      )}

      {products.length === 0 && globalSteps.length === 0 && (
        <div className="text-xs text-muted-foreground text-center py-4">
          Aucune étape de production dans ce projet
        </div>
      )}
    </div>
  )
}
