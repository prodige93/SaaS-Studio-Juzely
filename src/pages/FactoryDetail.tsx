import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, Star, Phone, Mail, Package, TrendingUp, AlertCircle, Globe } from "lucide-react"
import Layout from "@/components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ProductionTracker } from "@/components/factory/ProductionTracker"
import { useFactories } from "@/hooks/useFactories"
import { useProjects } from "@/hooks/useProjects"
import { useClients } from "@/hooks/useClients"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useUserRole } from "@/hooks/useUserRole"

export default function FactoryDetail() {
  const { factoryName } = useParams<{ factoryName: string }>()
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { factories, loading: loadingFactories } = useFactories()
  const { projects, loading: loadingProjects } = useProjects()
  const { clients, loading: loadingClients } = useClients()
  const { isAdmin } = useUserRole()
  
  const decodedFactoryName = factoryName ? decodeURIComponent(factoryName) : ""
  
  const factory = useMemo(() => {
    return factories.find(f => f.name === decodedFactoryName)
  }, [factories, decodedFactoryName])

  const factoryProjects = useMemo(() => {
    if (!factory) return []
    return projects.filter(p => p.factory_id === factory.id)
  }, [projects, factory])

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "Client inconnu"
    const client = clients.find(c => c.id === clientId)
    return client?.name || "Client inconnu"
  }

  const activeProjects = useMemo(() => 
    factoryProjects.filter(p => p.status === 'in_progress'),
    [factoryProjects]
  )

  const completedProjects = useMemo(() =>
    factoryProjects.filter(p => p.status === 'completed'),
    [factoryProjects]
  )

  const totalValue = useMemo(() =>
    factoryProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0),
    [factoryProjects]
  )

  if (loadingFactories || loadingProjects || loadingClients) {
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
  
  if (!factory) {
    return (
      <Layout>
        <div className="text-center py-12 animate-fade-in">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Usine non trouvée</h3>
          <p className="text-muted-foreground mb-4">
            L'usine "{decodedFactoryName}" n'existe pas dans la base de données
          </p>
          <Button onClick={() => navigate('/factories')}>
            Retour aux usines
          </Button>
        </div>
      </Layout>
    )
  }

  const handleDeleteFactory = () => {
    toast({
      title: "Usine supprimée",
      description: `${factory.name} a été supprimée avec succès`,
    })
    navigate('/factories')
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: 'Brouillon',
      in_progress: 'En cours',
      review: 'En révision',
      completed: 'Terminé',
      cancelled: 'Annulé',
      on_hold: 'En attente',
      planning: 'Planification',
      delayed: 'Retardé'
    }
    return statusMap[status] || status
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-medium text-foreground tracking-tight">
              {factory.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{factory.location}, {factory.country}</span>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Supprimer l'usine
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Cela supprimera définitivement l'usine{" "}
                  <strong>{factory.name}</strong> et toutes ses données associées.
                  <br /><br />
                  <strong>Attention :</strong> {factoryProjects.length} projet(s) sont associés à cette usine.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteFactory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Informations générales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Projets actifs</p>
                  <p className="text-2xl font-bold text-foreground">{activeProjects.length}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Projets terminés</p>
                  <p className="text-2xl font-bold text-foreground">{completedProjects.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {isAdmin ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valeur totale</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Projets totaux</p>
                    <p className="text-2xl font-bold text-foreground">{factoryProjects.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Note</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <p className="text-2xl font-bold text-foreground">{factory.rating}/5</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détails de l'usine */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Téléphone:</span>
                  <span className="font-medium">{factory.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{factory.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{factory.contact_person}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Capacité mensuelle:</span>
                  <span className="font-medium ml-2">
                    {new Intl.NumberFormat('fr-FR').format(factory.capacity)} pcs
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Statut:</span>
                  <Badge variant={factory.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                    {factory.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Spécialités</h4>
              <div className="flex flex-wrap gap-2">
                {factory.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {factory.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des projets */}
        <Card>
          <CardHeader>
            <CardTitle>Projets ({factoryProjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {factoryProjects.map((project) => (
                <div key={project.id}>
                  <div 
                    className={`p-4 bg-muted/20 rounded-lg space-y-3 hover:bg-muted/30 transition-colors cursor-pointer ${
                      selectedProject === project.id ? 'border-2 border-primary' : ''
                    }`}
                    onClick={() => setSelectedProject(
                      selectedProject === project.id ? null : project.id
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Client: {getClientName(project.client_id)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0 font-normal">
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="text-muted-foreground font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/30">
                      <span className="text-muted-foreground">
                        {project.quantity || 0} pcs • Échéance: {project.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR') : 'Non définie'}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(project.estimated_cost || 0)}
                      </span>
                    </div>
                  </div>
                  
                  {selectedProject === project.id && (
                    <div className="mt-3 animate-in fade-in duration-200">
                      <Card>
                        <ProductionTracker
                          projectId={project.id}
                          compact={false}
                        />
                      </Card>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
