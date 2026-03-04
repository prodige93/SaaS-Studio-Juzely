import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company_name: string | null
  vat_number: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postal_code: string | null
  country: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setClients(data || [])
      } catch (error) {
        console.error('Error fetching clients:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClients()

    // Temps réel
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          console.log('Client change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            setClients((current) => [...current, payload.new as Client])
          } else if (payload.eventType === 'UPDATE') {
            setClients((current) =>
              current.map((client) =>
                client.id === payload.new.id ? (payload.new as Client) : client
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setClients((current) =>
              current.filter((client) => client.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  return { clients, loading }
}