import { useMemo } from 'react'
import { useProjects } from './useProjects'

export const useProjectStats = () => {
  const { projects, loading } = useProjects()

  const stats = useMemo(() => {
    if (loading || projects.length === 0) {
      return {
        projects: [],
        totalProjects: 0,
        inProgress: 0,
        completed: 0,
        delayed: 0,
        totalValue: 0,
        trends: {
          totalProjects: 0,
          inProgress: 0,
          completed: 0,
          totalValue: 0,
        }
      }
    }

    // Calculer les stats actuelles
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const inProgress = projects.filter(p => p.status === 'in_progress').length
    const completed = projects.filter(p => p.status === 'completed').length
    const delayed = projects.filter(p => p.status === 'delayed').length
    const totalValue = projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)

    // Calculer les stats du mois précédent pour les tendances
    const lastMonthProjects = projects.filter(p => {
      const createdAt = new Date(p.created_at)
      return createdAt.getMonth() === (currentMonth - 1 + 12) % 12 &&
        (currentMonth === 0 ? createdAt.getFullYear() === currentYear - 1 : createdAt.getFullYear() === currentYear)
    })

    const currentMonthProjects = projects.filter(p => {
      const createdAt = new Date(p.created_at)
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear
    })

    const lastMonthInProgress = lastMonthProjects.filter(p => p.status === 'in_progress').length
    const currentMonthInProgress = currentMonthProjects.filter(p => p.status === 'in_progress').length

    const lastMonthCompleted = projects.filter(p => {
      if (p.status !== 'completed') return false
      const updatedAt = new Date(p.updated_at)
      return updatedAt.getMonth() === (currentMonth - 1 + 12) % 12
    }).length

    const currentMonthCompleted = projects.filter(p => {
      if (p.status !== 'completed') return false
      const updatedAt = new Date(p.updated_at)
      return updatedAt.getMonth() === currentMonth && updatedAt.getFullYear() === currentYear
    }).length

    const lastMonthValue = lastMonthProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)
    const currentMonthValue = currentMonthProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)

    // Calculer les tendances en pourcentage
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return {
      projects,
      totalProjects: projects.length,
      inProgress,
      completed,
      delayed,
      totalValue,
      trends: {
        totalProjects: calculateTrend(currentMonthProjects.length, lastMonthProjects.length),
        inProgress: calculateTrend(currentMonthInProgress, lastMonthInProgress),
        completed: calculateTrend(currentMonthCompleted, lastMonthCompleted),
        totalValue: calculateTrend(currentMonthValue, lastMonthValue),
      }
    }
  }, [projects, loading])

  return { ...stats, loading }
}
