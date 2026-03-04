import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Factory, User, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Project } from "@/types"
import { EditProjectModal } from "@/components/forms/EditProjectModal"
import { useLanguage } from "@/contexts/LanguageContext"
import { useNavigate } from "react-router-dom"
import { formatCurrency } from "@/lib/utils"
import { useUserRole } from "@/hooks/useUserRole"

interface ProjectListItemProps {
  project: Project
  factories?: string[]
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

export function ProjectListItem({ project, factories = [], onProjectUpdated }: ProjectListItemProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const { isAdmin } = useUserRole()

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
    <div className="border border-border/50 bg-card rounded-lg overflow-hidden transition-all hover:border-border">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{project.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{project.client}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[project.status]} className="text-xs">
              {getStatusLabel(project.status)}
            </Badge>
            <Badge variant={priorityColors[project.priority]} className="text-xs">
              {getPriorityLabel(project.priority)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1">
              <Progress value={project.progress} className="h-1.5" />
            </div>
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          
          {isAdmin && (
            <div className="text-sm font-medium text-foreground min-w-[100px] text-right">
              {formatCurrency(project.estimatedCost)}
            </div>
          )}
        </div>
        
        <Button variant="ghost" size="icon" className="shrink-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-4 bg-muted/20">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Factory className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{project.factory}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{project.client}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{t('deadline')}: {project.deadline}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {isAdmin && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('budget')}:</span>
                  <span className="font-medium text-foreground">{formatCurrency(project.estimatedCost)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('quantity')}:</span>
                <span className="font-medium text-foreground">{project.quantity} {t('pcs')}</span>
              </div>
              
              {project.products && project.products.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-sm font-medium text-foreground">Produits:</span>
                  <div className="mt-1 space-y-1">
                    {project.products.map((product, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground flex justify-between">
                        <span>{product.customType || product.type}</span>
                        <span>{product.quantity} pcs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/clients?client=${encodeURIComponent(project.client)}`)
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir le compte client
            </Button>
            
            {factories && factories.length > 0 && onProjectUpdated && (
              <EditProjectModal 
                project={project} 
                factories={factories}
                onProjectUpdated={onProjectUpdated}
              >
                <Button variant="outline" size="sm">
                  {t('modify')}
                </Button>
              </EditProjectModal>
            )}
          </div>
        </div>
      )}
    </div>
  )
}