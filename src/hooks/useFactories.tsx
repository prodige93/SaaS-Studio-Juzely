import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Factory {
  id: string
  name: string
  location: string | null
  country: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  capacity: number | null
  rating: number | null
  specialties: string[] | null
  certifications: string[] | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export const useFactories = () => {
  const [factories, setFactories] = useState<Factory[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const { data, error } = await supabase
          .from('factories')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setFactories(data || [])
      } catch (error) {
        console.error('Error fetching factories:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les usines",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFactories()

    // Temps réel
    const channel = supabase
      .channel('factories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'factories'
        },
        (payload) => {
          console.log('Factory change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            setFactories((current) => [...current, payload.new as Factory])
          } else if (payload.eventType === 'UPDATE') {
            setFactories((current) =>
              current.map((factory) =>
                factory.id === payload.new.id ? (payload.new as Factory) : factory
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setFactories((current) =>
              current.filter((factory) => factory.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  return { factories, loading }
}