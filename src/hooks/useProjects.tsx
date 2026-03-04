import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Project {
  id: string
  name: string
  description: string | null
  status: string
  priority: string
  progress: number
  factory_id: string | null
  client_id: string | null
  start_date: string | null
  end_date: string | null
  deadline: string | null
  budget: number | null
  estimated_cost: number | null
  quantity: number | null
  type: string
  created_at: string
  updated_at: string
  products?: Array<{
    id: string
    garment_type: string
    quantity: number
    custom_type?: string
    reference?: string
  }>
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Fonction pour charger les projets
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            clients(name),
            factories(name),
            products:project_products(*)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        // Map Supabase data to expected format with camelCase
        const mappedProjects = (data || []).map((project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: project.status,
          priority: project.priority,
          progress: project.progress,
          factory_id: project.factory_id,
          client_id: project.client_id,
          start_date: project.start_date,
          end_date: project.end_date,
          deadline: project.deadline,
          budget: project.budget || 0,
          estimated_cost: project.estimated_cost || 0,
          estimatedCost: project.estimated_cost || 0, // camelCase for components
          quantity: project.quantity || 0,
          type: project.type,
          created_at: project.created_at,
          updated_at: project.updated_at,
          // Additional fields for display
          client: project.clients?.name || 'Non assigné',
          factory: project.factories?.name || 'Non assigné',
          startDate: project.start_date,
          endDate: project.end_date,
          // Add products
          products: project.products || []
        }))
        
        setProjects(mappedProjects)
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les projets",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    // Helper function to refetch when needed
    const refetchProjects = fetchProjects

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Project change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Fetch the complete project with relations
            fetchProjects()
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the complete project with relations
            fetchProjects()
          } else if (payload.eventType === 'DELETE') {
            setProjects((current) =>
              current.filter((project) => project.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  return { projects, loading }
}