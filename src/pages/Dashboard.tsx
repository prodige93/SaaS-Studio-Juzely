import { useState } from "react"
import { Package, Factory, Clock, DollarSign, TrendingUp } from "lucide-react"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { ProjectTimeline } from "@/components/dashboard/ProjectTimeline"
import { NewProjectModal } from "@/components/forms/NewProjectModal"
import { ProjectDetailModal } from "@/components/projects/ProjectDetailModal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/LanguageContext"
import { useUserRole } from "@/hooks/useUserRole"
import { useFactories } from "@/hooks/useFactories"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useProjectStats } from "@/hooks/useProjectStats"
import { Project } from "@/types"

export default function Dashboard() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { isAdmin } = useUserRole()
  const { projects: allProjects, totalProjects, inProgress, completed, totalValue, trends, loading: statsLoading } = useProjectStats()
  const { factories, loading: loadingFactories } = useFactories()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Filtrer uniquement les projets urgents
  const urgentProjects = allProjects.filter((project: any) => project.priority === 'urgent')
  
  const filteredProjects = urgentProjects.filter((project: any) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const loading = statsLoading

  const handleViewProject = (id: string) => {
    const project = allProjects.find((p: any) => p.id === id)
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
      const { error } = await supabase
        .from('projects')
        .insert([newProject])

      if (error) throw error

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="text-muted-foreground">
            Projets urgents nécessitant votre attention
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className={`grid gap-4 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        <StatsCard
          title={t('totalProjectsCard')}
          value={totalProjects}
          description={t('allProjects')}
          icon={Package}
          trend={{ value: trends.totalProjects, label: t('thisMonth') }}
        />
        <StatsCard
          title={t('inProgressCard')}
          value={inProgress}
          description={t('activeProjects')}
          icon={Clock}
          trend={{ value: trends.inProgress, label: t('thisMonth') }}
        />
        <StatsCard
          title={t('completedCard')}
          value={completed}
          description={t('finalizedProjects')}
          icon={TrendingUp}
          trend={{ value: trends.completed, label: t('thisMonth') }}
        />
        {isAdmin && (
          <StatsCard
            title={t('totalValueCard')}
            value={new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0
            }).format(totalValue)}
            description={t('totalBudget')}
            icon={DollarSign}
            trend={{ value: trends.totalValue, label: t('thisMonth') }}
          />
        )}
      </div>

      {/* Tabs pour organiser le contenu */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('timeline')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Section projets récents */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                {t('recentProjectsTab')}
              </h2>
              <div className="flex gap-4 items-center">
                <Input
                  placeholder={t('searchProject')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline">
                  {t('viewAllProjects')}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.slice(0, 6).map((project) => (
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

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  {t('noProjectFound')}
                </h3>
                <p className="text-muted-foreground">
                  {t('modifySearchOrCreate')}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <ProjectTimeline projects={(allProjects || []) as any} />
        </TabsContent>
      </Tabs>

      <ProjectDetailModal
        project={selectedProject}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onProjectUpdate={handleUpdateProject}
      />
    </div>
  )
}