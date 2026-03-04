import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, AlertCircle } from "lucide-react"
import { Project } from "@/types"
import { format, parseISO, isSameDay, isAfter, isBefore, addDays } from "date-fns"
import { fr } from "date-fns/locale"

interface ProjectTimelineProps {
  projects: Project[]
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive'
    case 'medium': return 'secondary' 
    case 'low': return 'outline'
    default: return 'outline'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'delayed': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function ProjectTimeline({ projects }: ProjectTimelineProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  // Créer une map des dates avec les projets et leurs types d'événements
  const projectsByDate = projects.reduce((acc, project: any) => {
    // Vérifier si les dates existent
    if (!project.start_date || !project.deadline) return acc

    // Date de début
    const startDate = parseISO(project.start_date)
    const startKey = format(startDate, 'yyyy-MM-dd')
    if (!acc[startKey]) acc[startKey] = []
    acc[startKey].push({ ...project, eventType: 'start' })

    // Date de fin/échéance
    const deadline = parseISO(project.deadline)
    const deadlineKey = format(deadline, 'yyyy-MM-dd')
    if (!acc[deadlineKey]) acc[deadlineKey] = []
    acc[deadlineKey].push({ ...project, eventType: 'deadline' })

    // Dates intermédiaires (pour créer l'effet de trait)
    const current = new Date(startDate)
    while (current <= deadline) {
      const dateKey = format(current, 'yyyy-MM-dd')
      if (dateKey !== startKey && dateKey !== deadlineKey) {
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push({ ...project, eventType: 'progress' })
      }
      current.setDate(current.getDate() + 1)
    }
    
    return acc
  }, {} as Record<string, Array<any>>)

  // Identifier les différents types de dates
  const datesWithEvents = Object.keys(projectsByDate).map(date => parseISO(date))
  const datesWithStart = (projects as any[])
    .filter((p: any) => p.start_date)
    .map((p: any) => parseISO(p.start_date))
  const datesWithDeadlines = (projects as any[])
    .filter((p: any) => p.deadline)
    .map((p: any) => parseISO(p.deadline))
  const datesWithProgress = datesWithEvents.filter(date => 
    !datesWithStart.some(start => isSameDay(start, date)) && 
    !datesWithDeadlines.some(deadline => isSameDay(deadline, date))
  )

  // Projets pour la date sélectionnée
  const selectedDateProjects = selectedDate 
    ? projectsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : []

  // Prochaines échéances (dans les 30 prochains jours)
  const today = new Date()
  const in30Days = addDays(today, 30)
  
  const upcomingDeadlines = (projects as any[])
    .filter((project: any) => {
      if (!project.deadline) return false
      const deadline = parseISO(project.deadline)
      return isAfter(deadline, today) && isBefore(deadline, in30Days)
    })
    .sort((a: any, b: any) => {
      if (!a.deadline || !b.deadline) return 0
      return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime()
    })

  const modifierClassNames = {
    start: datesWithStart,
    deadline: datesWithDeadlines,
    progress: datesWithProgress
  }

  const modifiersStyles = {
    start: {
      backgroundColor: 'hsl(var(--success))',
      color: 'white',
      borderRadius: '50%',
      fontWeight: 'bold'
    },
    deadline: {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'white',
      borderRadius: '50%',
      fontWeight: 'bold'
    },
    progress: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'white',
      opacity: 0.6,
      borderRadius: '2px'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Timeline des Projets</h2>
          <p className="text-muted-foreground">
            Visualisez les échéances de vos projets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
            size="sm"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendrier
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Liste
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {viewMode === 'calendar' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Timeline des Projets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={fr}
                  modifiers={modifierClassNames}
                  modifiersStyles={modifiersStyles}
                  className="rounded-md border w-full"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-lg font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-sm text-center",
                    row: "flex w-full mt-2",
                    cell: "flex-1 h-12 text-center text-sm p-1 relative focus-within:relative focus-within:z-20",
                    day: "h-10 w-full p-0 font-normal hover:bg-accent hover:text-accent-foreground",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground font-bold",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_hidden: "invisible",
                  }}
                />
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">Début de projet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary opacity-60"></div>
                    <span className="text-muted-foreground">En cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground">Échéance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className={viewMode === 'calendar' ? '' : 'lg:col-span-4'}>
          {viewMode === 'calendar' && selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateProjects.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateProjects.map((project) => {
                      const eventType = project.eventType
                      const eventIcon = eventType === 'start' ? '🚀' : eventType === 'deadline' ? '🎯' : '⚡'
                      const eventLabel = eventType === 'start' ? 'Début' : eventType === 'deadline' ? 'Échéance' : 'En cours'
                      
                      return (
                        <div
                          key={`${project.id}-${eventType}`}
                          className="p-3 rounded-lg border bg-card"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span>{eventIcon}</span>
                              <h4 className="font-medium text-foreground">
                                {(project as any).name}
                              </h4>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {eventLabel}
                              </Badge>
                              <Badge variant={getPriorityColor((project as any).priority)}>
                                {(project as any).priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Client ID: {(project as any).client_id || 'N/A'}
                          </p>
                          <div className="flex gap-2">
                            <Badge 
                              className={getStatusColor((project as any).status)}
                              variant="outline"
                            >
                              {(project as any).status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {(project as any).progress}% terminé
                            </span>
                          </div>
                          {(project as any).start_date && (project as any).deadline && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {format(parseISO((project as any).start_date), 'dd MMM', { locale: fr })} → {format(parseISO((project as any).deadline), 'dd MMM yyyy', { locale: fr })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    Aucune échéance pour cette date
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {viewMode === 'list' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Prochaines Échéances (30 jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingDeadlines.map((project: any) => {
                      if (!project.deadline) return null
                      const deadline = parseISO(project.deadline)
                      const daysUntilDeadline = Math.ceil(
                        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                      )
                      
                      return (
                        <div
                          key={project.id}
                          className="flex justify-between items-center p-4 rounded-lg border bg-card"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-foreground">
                                {project.name}
                              </h4>
                              <Badge variant={getPriorityColor(project.priority)}>
                                {project.priority}
                              </Badge>
                              <Badge 
                                className={getStatusColor(project.status)}
                                variant="outline"
                              >
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Client ID: {project.client_id || 'N/A'} • {project.progress}% terminé
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-foreground">
                              {format(deadline, 'dd MMM yyyy', { locale: fr })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {daysUntilDeadline === 0 ? "Aujourd'hui" :
                               daysUntilDeadline === 1 ? "Demain" :
                               `Dans ${daysUntilDeadline} jours`}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    Aucune échéance dans les 30 prochains jours
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}