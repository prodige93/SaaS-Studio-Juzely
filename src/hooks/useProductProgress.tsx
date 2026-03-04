import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface ProductProgress {
  id: string
  project_id: string
  product_id: string
  progress: number
  created_at: string
  updated_at: string
}

export const useProductProgress = (projectId: string) => {
  const [productProgress, setProductProgress] = useState<ProductProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!projectId) {
      setLoading(false)
      return
    }

    const fetchProductProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('product_progress')
          .select('*')
          .eq('project_id', projectId)

        if (error) throw error
        setProductProgress(data || [])
      } catch (error) {
        console.error('Error fetching product progress:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la progression des produits",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductProgress()

    // Écouter les changements en temps réel
    const channel = supabase
      .channel(`product-progress-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_progress',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Product progress change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            setProductProgress((current) => [...current, payload.new as ProductProgress])
          } else if (payload.eventType === 'UPDATE') {
            setProductProgress((current) =>
              current.map((pp) =>
                pp.id === payload.new.id ? (payload.new as ProductProgress) : pp
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setProductProgress((current) =>
              current.filter((pp) => pp.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, toast])

  const updateProductProgress = async (productId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('product_progress')
        .update({ progress })
        .eq('project_id', projectId)
        .eq('product_id', productId)

      if (error) throw error

      toast({
        title: "Progression mise à jour",
        description: "La progression du produit a été actualisée"
      })
    } catch (error) {
      console.error('Error updating product progress:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la progression",
        variant: "destructive"
      })
    }
  }

  return { productProgress, loading, updateProductProgress }
}
