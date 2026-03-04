import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export type UserRole = 'admin' | 'user' | null

export const useUserRole = () => {
  const { user } = useAuth()
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user role:', error)
          setRole('user') // Default to user role if error
        } else {
          setRole(data?.role as UserRole)
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error)
        setRole('user')
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user])

  const isAdmin = role === 'admin'

  return { role, isAdmin, loading }
}
