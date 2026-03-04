import { useState } from "react"
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react"
import Layout from "@/components/layout/Layout"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { ProjectListItem } from "@/components/projects/ProjectListItem"
import { NewProjectModal } from "@/components/forms/NewProjectModal"
import { ProjectDetailModal } from "@/components/projects/ProjectDetailModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProjectStatus, Priority } from "@/types"
import { useLanguage } from "@/contexts/LanguageContext"
import { useProjects } from "@/hooks/useProjects"
import { useFactories } from "@/hooks/useFactories"
import { useClients } from "@/hooks/useClients"
import { useUserRole } from "@/hooks/useUserRole"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function Projects() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { isAdmin } = useUserRole()
  const { projects: projectsList, loading } = useProjects()
  const { factories, loading: loadingFactories } = useFactories()
  const { clients } = useClients()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const filteredProjects = projectsList.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleViewProject = (id: string) => {
    const project = projectsList.find(p => p.id === id)
    if (project) {
      setSelectedProject(project)
      setIsDetailModalOpen(true)
    }
  }

  const handleEditProject = (id: string) => {
    console.log("Éditer projet:", id)
  }

  const handleUpdateProject = async (updatedProject: any) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updatedProject)
        .eq('id', updatedProject.id)

      if (error) throw error
      
      toast({
        title: "Projet mis à jour",
        description: "Le projet a été modifié avec succès"
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le projet",
        variant: "destructive"
      })
    }
  }
  
  const handleCreateProject = async (newProject: any) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour créer un projet",
          variant: "destructive"
        })
        return
      }

      // Find factory_id and client_id
      const factory = factories.find(f => f.name === newProject.factory)
      const client = clients.find(c => c.name === newProject.client)

      // Insert project first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: newProject.name,
          description: newProject.description,
          status: newProject.status || 'draft',
          priority: newProject.priority,
          progress: 0,
          factory_id: factory?.id || null,
          client_id: client?.id || null,
          start_date: newProject.startDate || null,
          end_date: newProject.endDate || null,
          deadline: newProject.deadline || null,
          budget: newProject.budget || 0,
          estimated_cost: newProject.estimatedCost || 0,
          quantity: newProject.quantity || 0,
          type: newProject.type || 'BULK',
          created_by: user.id
        }])
        .select()
        .single()

      if (projectError) throw projectError

      // Insert products if any
      if (newProject.products && newProject.products.length > 0) {
        const productsToInsert = newProject.products.map((product: any) => ({
          project_id: projectData.id,
          garment_type: product.type,
          quantity: product.quantity,
          custom_type: product.customType || null,
          reference: product.reference || null
        }))

        const { error: productsError } = await supabase
          .from('project_products')
          .insert(productsToInsert)

        if (productsError) throw productsError
      }

      toast({
        title: "Projet créé",
        description: "Le nouveau projet a été ajouté avec succès"
      })
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet",
        variant: "destructive"
      })
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès"
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet",
        variant: "destructive"
      })
    }
  }
  const statusCounts = {
    all: projectsList.length,
    draft: projectsList.filter(p => p.status === 'draft').length,
    in_progress: projectsList.filter(p => p.status === 'in_progress').length,
    review: projectsList.filter(p => p.status === 'review').length,
    completed: projectsList.filter(p => p.status === 'completed').length,
    on_hold: projectsList.filter(p => p.status === 'on_hold').length,
    cancelled: projectsList.filter(p => p.status === 'cancelled').length
  }

  const getStatusLabel = (status: string) => {
    const statusMap = {
      all: 'all',
      draft: 'draft',
      in_progress: 'inProgress',
      review: 'review',
      completed: 'completed',
      cancelled: 'cancelled',
      on_hold: 'onHold'
    }
    return t(statusMap[status as keyof typeof statusMap] || status)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">{t('projectsTitle')}</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {t('manageTextileProjects')}
            </p>
          </div>
          {isAdmin && (
            <NewProjectModal 
              onProjectCreated={handleCreateProject}
            />
          )}
        </div>

        {/* Filtres rapides par statut */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Badge
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent transition-all duration-150 px-3 py-1 font-medium"
              onClick={() => setStatusFilter(status as ProjectStatus | "all")}
            >
              {getStatusLabel(status)} ({count})
            </Badge>
          ))}
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchProject')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
          
          <div className="flex gap-1 border border-border/50 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Grille
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Liste
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | "all")}>
            <SelectTrigger className="w-44 h-10 bg-background border-input">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
              <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
              <SelectItem value="review">{t('review')}</SelectItem>
              <SelectItem value="completed">{t('completed')}</SelectItem>
              <SelectItem value="on_hold">{t('onHold')}</SelectItem>
              <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | "all")}>
            <SelectTrigger className="w-44 h-10 bg-background border-input">
              <SelectValue placeholder={t('filterByPriority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPriorities')}</SelectItem>
              <SelectItem value="low">{t('low')}</SelectItem>
              <SelectItem value="medium">{t('medium')}</SelectItem>
              <SelectItem value="high">{t('high')}</SelectItem>
              <SelectItem value="urgent">{t('urgent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Résultats */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-base lg:text-lg font-medium text-foreground">
              {filteredProjects.length} {filteredProjects.length > 1 ? t('foundProjectsPlural') : t('foundProjects')}
            </h2>
          </div>

          {viewMode === "grid" ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project as any}
                factories={factories.map(f => f.name)}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onProjectUpdated={handleUpdateProject}
              />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project as any}
                factories={factories.map(f => f.name)}
                onProjectUpdated={handleUpdateProject}
              />
              ))}
            </div>
          )}

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-normal text-foreground mb-2">
                {t('noProjectsFound')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('modifyFiltersOrCreate')}
              </p>
              {isAdmin && (
                <NewProjectModal 
                  onProjectCreated={handleCreateProject}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <ProjectDetailModal
        project={selectedProject}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onProjectUpdate={handleUpdateProject}
      />
    </Layout>
  )
}