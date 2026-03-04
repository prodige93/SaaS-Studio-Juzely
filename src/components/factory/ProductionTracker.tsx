import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, Circle, AlertCircle } from 'lucide-react'
import { useProjectSteps } from '@/hooks/useProjectSteps'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'

interface ProductionTrackerProps {
  projectId: string
  compact?: boolean
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

const getStatusBadge = (status: string) => {
  const configs: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: 'En attente', variant: 'outline' },
    in_progress: { label: 'En cours', variant: 'secondary' },
    completed: { label: 'Terminée', variant: 'default' },
    blocked: { label: 'Bloquée', variant: 'destructive' },
    cancelled: { label: 'Annulée', variant: 'outline' },
  }
  return configs[status] || { label: status, variant: 'outline' }
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

interface Product {
  id: string
  garment_type: string
  custom_type: string | null
  reference: string | null
  quantity: number
}

export function ProductionTracker({ projectId, compact = false }: ProductionTrackerProps) {
  const { steps, loading, toggleStepStatus } = useProjectSteps(projectId)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('project_products')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [projectId])

  if (loading || loadingProducts) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        Chargement des étapes...
      </div>
    )
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        Aucune étape définie pour ce projet
      </div>
    )
  }

  const completedSteps = steps.filter(s => s.status === 'completed').length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const handleStepClick = async (stepId: string, currentStatus: string) => {
    if (currentStatus !== 'blocked' && currentStatus !== 'cancelled') {
      await toggleStepStatus(stepId, currentStatus)
    }
  }

  // Grouper les étapes par produit
  const getProductName = (product: Product) => {
    if (product.reference) return product.reference
    if (product.custom_type) return product.custom_type
    return garmentTypeLabels[product.garment_type] || product.garment_type
  }

  const globalSteps = steps.filter(s => !s.product_id)
  const productSteps = products.map(product => ({
    product,
    steps: steps.filter(s => s.product_id === product.id)
  })).filter(ps => ps.steps.length > 0)

  // Si pas de produits et pas d'étapes globales, afficher un message
  if (products.length === 0 && globalSteps.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        Aucun produit ni étape définie pour ce projet
      </div>
    )
  }

  if (compact) {
    return (
      <div className="w-full">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {completedSteps}/{totalSteps} étapes terminées
            </span>
            <span className="text-xs font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <ScrollArea className="h-[210px]">
            <div className="space-y-4 pr-3">
              {/* Étapes globales du projet */}
              {globalSteps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">
                    {products.length === 0 ? 'Étapes du projet (aucun produit associé)' : 'Étapes du projet'}
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

              {/* Étapes par produit */}
              {productSteps.map(({ product, steps: productStepsList }) => (
                <div key={product.id} className="space-y-2">
                  <div className="text-xs font-semibold text-foreground">
                    Étapes de production - {getProductName(product)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {productStepsList.map((step) => (
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
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Étapes de Production</h3>
        <span className="text-sm text-muted-foreground">
          {completedSteps}/{totalSteps} terminées
        </span>
      </div>

      <div className="space-y-3">
        <Progress value={progressPercentage} className="h-3" />
        
        <div className="space-y-2">
          {steps.map((step) => {
            const statusBadge = getStatusBadge(step.status)
            return (
              <div
                key={step.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.name}</p>
                    {step.description && (
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    )}
                    {step.started_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Démarré: {new Date(step.started_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.label}
                  </Badge>
                  
                  {step.status !== 'blocked' && step.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant={step.status === 'completed' ? 'outline' : 'default'}
                      onClick={() => handleStepClick(step.id, step.status)}
                    >
                      {step.status === 'pending' && 'Démarrer'}
                      {step.status === 'in_progress' && 'Terminer'}
                      {step.status === 'completed' && 'Recommencer'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
