import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface ProjectProduct {
  id: string
  project_id: string
  garment_type: string
  custom_type: string | null
  quantity: number
  reference: string | null
  created_at: string
}

export const useProjectProducts = () => {
  const [products, setProducts] = useState<ProjectProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('project_products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_products'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts((current) => [payload.new as ProjectProduct, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setProducts((current) =>
              current.map((product) =>
                product.id === payload.new.id ? (payload.new as ProjectProduct) : product
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setProducts((current) =>
              current.filter((product) => product.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  return { products, loading }
}
