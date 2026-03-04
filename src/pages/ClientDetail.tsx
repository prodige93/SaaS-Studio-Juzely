import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
  Globe
} from "lucide-react"
import Layout from "@/components/layout/Layout"
import { formatCurrency } from "@/lib/utils"
import { useUserRole } from "@/hooks/useUserRole"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/LanguageContext"
import { useClients } from "@/hooks/useClients"
import { useProjects } from "@/hooks/useProjects"
import { Separator } from "@/components/ui/separator"

export default function ClientDetail() {
  const { clientName } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAdmin } = useUserRole()
  const { clients, loading: loadingClients } = useClients()
  const { projects, loading: loadingProjects } = useProjects()
  
  const decodedClientName = decodeURIComponent(clientName || "")

  // Trouver le client par son nom
  const client = useMemo(() => {
    return clients.find(c => c.name === decodedClientName)
  }, [clients, decodedClientName])

  // Filtrer les projets de ce client
  const clientProjects = useMemo(() => {
    if (!client) return []
    return projects.filter(p => p.client_id === client.id)
  }, [projects, client])
  
  const stats = useMemo(() => {
    const totalValue = clientProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)
    const totalProjects = clientProjects.length
    
    return {
      totalProjects,
      totalValue,
      completedProjects: clientProjects.filter(p => p.status === 'completed').length,
      inProgressProjects: clientProjects.filter(p => p.status === 'in_progress').length,
      totalQuantity: clientProjects.reduce((sum, p) => sum + (p.quantity || 0), 0),
      averageProgress: totalProjects > 0 
        ? Math.round(clientProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
        : 0,
      averageProjectValue: totalProjects > 0 
        ? Math.round(totalValue / totalProjects)
        : 0
    }
  }, [clientProjects])

  const recentProjects = useMemo(() => {
    return clientProjects
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
  }, [clientProjects])

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

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary" | "success" | "warning"> = {
      completed: "default",
      in_progress: "default",
      review: "secondary",
      draft: "outline",
      cancelled: "destructive",
      on_hold: "secondary"
    }
    return colors[status] || "outline"
  }

  if (loadingClients || loadingProjects) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!client) {
    return (
      <Layout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/clients')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux clients
          </Button>
          <div className="text-center py-20 animate-fade-in">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h2 className="text-2xl font-medium text-foreground mb-2">
              Client introuvable
            </h2>
            <p className="text-muted-foreground mb-6">
              Le client "{decodedClientName}" n'existe pas dans la base de données
            </p>
            <Button onClick={() => navigate('/clients')}>
              Voir tous les clients
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/clients')}
              className="gap-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux clients
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-medium text-foreground tracking-tight">
                  {decodedClientName}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Client depuis {clientProjects[0]?.start_date ? new Date(clientProjects[0].start_date).getFullYear() : new Date(client.created_at).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isAdmin && (
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Valeur Totale
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-foreground">
                    {formatCurrency(stats.totalValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Moyenne: {formatCurrency(stats.averageProjectValue)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Projets
                </CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-foreground">
                  {stats.totalProjects}
                </p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {stats.completedProjects} terminés
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Production
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-foreground">
                  {stats.totalQuantity.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pièces produites
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Progression Moyenne
                </CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-foreground">
                  {stats.averageProgress}%
                </p>
                <Progress value={stats.averageProgress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="projects">Tous les projets</TabsTrigger>
            <TabsTrigger value="recent">Projets récents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">
                Tous les projets ({clientProjects.length})
              </h2>
            </div>
            
            <div className="space-y-3">
              {clientProjects.map((project) => (
                <Card key={project.id} className="border-border/40 hover:border-border transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-foreground">
                              {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(project.status)} className="shrink-0">
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/30">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Budget</p>
                            <p className="text-sm font-medium text-foreground">
                              {formatCurrency(project.estimated_cost || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Quantité</p>
                            <p className="text-sm font-medium text-foreground">
                              {project.quantity || 0} pcs
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Échéance</p>
                            <p className="text-sm font-medium text-foreground">
                              {project.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR') : 'Non définie'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Type</p>
                            <p className="text-sm font-medium text-foreground">{project.type || 'BULK'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium text-foreground">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">
                Projets récents
              </h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <Card key={project.id} className="border-border/40 hover:border-border transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium leading-tight">
                        {project.name}
                      </CardTitle>
                      <Badge variant={getStatusColor(project.status)} className="shrink-0 text-xs">
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(project.estimated_cost || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantité</span>
                        <span className="font-medium text-foreground">{project.quantity || 0} pcs</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/30">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium text-foreground">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Répartition par statut</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { status: 'completed', label: 'Terminés', count: stats.completedProjects },
                    { status: 'in_progress', label: 'En cours', count: stats.inProgressProjects },
                    { 
                      status: 'other', 
                      label: 'Autres', 
                      count: stats.totalProjects - stats.completedProjects - stats.inProgressProjects 
                    }
                  ].map(({ status, label, count }) => (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{label}</span>
                        <span className="font-medium text-muted-foreground">
                          {count} ({Math.round((count / stats.totalProjects) * 100)}%)
                        </span>
                      </div>
                      <Progress 
                        value={(count / stats.totalProjects) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Indicateurs clés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Taux de complétion</span>
                    <span className="text-sm font-semibold text-foreground">
                      {Math.round((stats.completedProjects / stats.totalProjects) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Valeur moyenne/projet</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(stats.averageProjectValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Production totale</span>
                    <span className="text-sm font-semibold text-foreground">
                      {stats.totalQuantity.toLocaleString()} pcs
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">Projets actifs</span>
                    <span className="text-sm font-semibold text-foreground">
                      {stats.inProgressProjects}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}