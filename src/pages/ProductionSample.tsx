import { useState } from "react"
import Layout from "@/components/layout/Layout"
import { ProductionTracker } from "@/components/factory/ProductionTracker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProjectDetailModal } from "@/components/projects/ProjectDetailModal"
import { useProjects } from "@/hooks/useProjects"
import { useClients } from "@/hooks/useClients"
import { useFactories } from "@/hooks/useFactories"
import { Eye } from "lucide-react"

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; label: string; dotColor: string }> = {
    in_progress: { color: 'text-orange-500', label: 'En cours', dotColor: 'bg-orange-500' },
    completed: { color: 'text-green-500', label: 'Terminé', dotColor: 'bg-green-500' },
    planning: { color: 'text-blue-500', label: 'Planification', dotColor: 'bg-blue-500' },
    delayed: { color: 'text-red-500', label: 'Retardé', dotColor: 'bg-red-500' },
  }
  return configs[status] || { color: 'text-muted-foreground', label: status, dotColor: 'bg-muted' }
}

const getPriorityBadge = (priority?: string) => {
  if (!priority) return null
  const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    high: { label: 'High', variant: 'destructive' },
    medium: { label: 'Medium', variant: 'secondary' },
    low: { label: 'Low', variant: 'outline' },
  }
  return variants[priority] || { label: priority, variant: 'outline' }
}

export default function ProductionSample() {
  const { projects: allProjects, loading } = useProjects()
  const { clients, loading: loadingClients } = useClients()
  const { factories, loading: loadingFactories } = useFactories()
  const sampleProjects = allProjects.filter(p => p.type === 'SAMPLE')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "Client inconnu"
    const client = clients.find(c => c.id === clientId)
    return client?.name || "Client inconnu"
  }

  const getFactoryName = (factoryId: string | null) => {
    if (!factoryId) return "Usine non assignée"
    const factory = factories.find(f => f.id === factoryId)
    return factory?.name || "Usine inconnue"
  }

  const handleViewDetail = (project: any) => {
    setSelectedProject(project)
    setDetailModalOpen(true)
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Production Sample</h1>
          <p className="text-muted-foreground mt-1">
            Suivi de production des prototypes et échantillons
          </p>
        </div>
        
        {loading || loadingClients || loadingFactories ? (
          <div className="text-center py-12 text-muted-foreground">
            Chargement...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sampleProjects.map((project) => {
              const statusConfig = getStatusConfig(project.status)
              const priorityBadge = getPriorityBadge(project.priority)
              
              return (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold tracking-tight truncate">
                          {project.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {getClientName(project.client_id)}
                        </p>
                      </div>
                      {priorityBadge && (
                        <Badge variant={priorityBadge.variant} className="text-xs px-2.5 py-0.5 font-medium shrink-0">
                          {priorityBadge.label}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                        <span className={statusConfig.color}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>Qté: {project.quantity || 0}</span>
                        <span>•</span>
                        <span>{project.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    <ProductionTracker
                      projectId={project.id}
                      compact={true}
                    />
                    
                    <Button 
                      onClick={() => handleViewDetail(project)}
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir les détails
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ProjectDetailModal
        project={selectedProject}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </Layout>
  )
}
