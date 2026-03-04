import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface ProjectStep {
  id: string
  project_id: string
  product_id: string | null
  name: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  order_index: number
  estimated_duration_days: number | null
  actual_duration_days: number | null
  started_at: string | null
  completed_at: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export const useProjectSteps = (projectId?: string) => {
  const [steps, setSteps] = useState<ProjectStep[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!projectId) {
      setSteps([])
      setLoading(false)
      return
    }

    const fetchSteps = async () => {
      try {
        const { data, error } = await supabase
          .from('project_steps')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true })

        if (error) throw error
        setSteps(data || [])
      } catch (error) {
        console.error('Error fetching project steps:', error)
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

    // Écouter les changements en temps réel
    const channel = supabase
      .channel(`project-steps-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_steps',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Project step change detected:', payload)
          
          // CRITICAL: Vérifier que l'événement est bien pour ce projet
          // Le filtre Supabase ne suffit pas toujours quand il y a plusieurs abonnements
          const newStep = payload.new as ProjectStep | null
          const oldStep = payload.old as ProjectStep | null
          const eventProjectId = newStep?.project_id || oldStep?.project_id
          
          if (eventProjectId && eventProjectId !== projectId) {
            console.log(`Ignoring event for different project: ${eventProjectId} (expected: ${projectId})`)
            return
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
            setSteps((current) =>
              current.filter((step) => step.id !== oldStep.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, toast])

  const toggleStepStatus = async (stepId: string, currentStatus: string) => {
    try {
      let newStatus: 'pending' | 'in_progress' | 'completed'
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Cycle: pending → in_progress → completed → pending
      if (currentStatus === 'pending') {
        newStatus = 'in_progress'
        updateData.started_at = new Date().toISOString()
      } else if (currentStatus === 'in_progress') {
        newStatus = 'completed'
        updateData.completed_at = new Date().toISOString()
      } else {
        newStatus = 'pending'
        updateData.started_at = null
        updateData.completed_at = null
      }

      updateData.status = newStatus

      const { error } = await supabase
        .from('project_steps')
        .update(updateData)
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

  return { steps, loading, toggleStepStatus }
}
