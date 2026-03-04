import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Calendar, Factory, User, Eye, Edit, MoreHorizontal } from "lucide-react"
import { Project } from "@/types"
import { EditProjectModal } from "@/components/forms/EditProjectModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/LanguageContext"
import { useUserRole } from "@/hooks/useUserRole"
import { ProjectStepsList } from "./ProjectStepsList"
import { formatCurrency } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
  factories?: string[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onProjectUpdated?: (project: Project) => void
}

const statusColors = {
  draft: "outline",
  in_progress: "default",
  review: "warning",
  completed: "success",
  cancelled: "destructive",
  on_hold: "secondary"
} as const

const priorityColors = {
  low: "outline",
  medium: "secondary", 
  high: "warning",
  urgent: "destructive"
} as const

export function ProjectCard({ 
  project, 
  factories = [], 
  onView, 
  onEdit, 
  onProjectUpdated 
}: ProjectCardProps) {
  const { t } = useLanguage()
  const { isAdmin } = useUserRole()
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const getStatusLabel = (status: string) => {
    const statusMap = {
      draft: 'draft',
      in_progress: 'inProgress',
      review: 'review',
      completed: 'completed',
      cancelled: 'cancelled',
      on_hold: 'onHold'
    }
    return t(statusMap[status as keyof typeof statusMap] || status)
  }

  const getPriorityLabel = (priority: string) => {
    const priorityMap = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      urgent: 'urgent'
    }
    return t(priorityMap[priority as keyof typeof priorityMap] || priority)
  }

  return (
    <Card className="card-hover border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-foreground tracking-tight">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[project.status]} className="font-medium text-xs">
                {getStatusLabel(project.status)}
              </Badge>
              <Badge variant={priorityColors[project.priority]} className="font-medium text-xs">
                {getPriorityLabel(project.priority)}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border/60">
              <DropdownMenuItem onClick={() => onView(project.id)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('viewDetails')}
              </DropdownMenuItem>
              {factories && factories.length > 0 && onProjectUpdated ? (
                <EditProjectModal 
                  project={project} 
                  factories={factories}
                  onProjectUpdated={onProjectUpdated}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('modify')}
                  </DropdownMenuItem>
                </EditProjectModal>
              ) : (
                <DropdownMenuItem onClick={() => onEdit(project.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('modify')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-sm">
            <Factory className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{project.factory}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{project.client}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{t('deadline')}: {project.deadline}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">{t('progress')}</span>
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>

        {/* Production Steps */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="text-xs font-medium text-muted-foreground mb-2">Étapes de production</div>
          <ProjectStepsList projectId={project.id} />
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border/60">
          {isAdmin && (
            <div className="text-sm">
              <span className="text-muted-foreground">{t('budget')}: </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(project.estimatedCost)}
              </span>
            </div>
          )}
          <div className={`text-sm ${!isAdmin ? 'w-full' : ''}`}>
            <span className="text-muted-foreground">{t('quantity')}: </span>
            <span className="font-semibold text-foreground">
              {project.quantity} {t('pcs')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}