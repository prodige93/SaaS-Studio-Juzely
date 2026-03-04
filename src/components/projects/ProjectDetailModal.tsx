import { useState } from "react"
import { Project } from "@/types"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  DollarSign, 
  Package, 
  Users, 
  Factory, 
  FileText, 
  Upload, 
  X, 
  ExternalLink,
  Briefcase,
  Clock
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProductionTimeline } from "./ProductionTimeline"
import { ProductStepsList } from "./ProductStepsList"
import { ProductionTracker } from "@/components/factory/ProductionTracker"
import { useUserRole } from "@/hooks/useUserRole"
import { useClients } from "@/hooks/useClients"
import { useProjectSteps } from "@/hooks/useProjectSteps"
import { useProductProgress } from "@/hooks/useProductProgress"
import { formatCurrency } from "@/lib/utils"
import { ProjectDocuments } from "./ProjectDocuments"

interface ProjectDetailModalProps {
  project: (Project & { client_id?: string }) | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdate?: (project: any) => void
}

const garmentTypeLabels: Record<string, string> = {
  tshirt: "T-shirt",
  pull: "Pull",
  sweatshirt: "Sweatshirt",
  jacket: "Veste",
  pants: "Pantalon",
  headwear: "Couvre-chef",
  dress: "Robe",
  sweater: "Sweater",
  skirt: "Jupe",
  other: "Autre"
}

const getPriorityBadge = (priority?: string) => {
  if (!priority) return null
  const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    high: { label: 'Haute', variant: 'destructive' },
    medium: { label: 'Moyenne', variant: 'secondary' },
    low: { label: 'Basse', variant: 'outline' },
    urgent: { label: 'Urgente', variant: 'destructive' },
  }
  return variants[priority] || { label: priority, variant: 'outline' }
}

export function ProjectDetailModal({ project, open, onOpenChange, onProjectUpdate }: ProjectDetailModalProps) {
  const { toast } = useToast()
  const { isAdmin } = useUserRole()
  const { isAdmin: isAdminUser } = useUserRole()
  const { clients } = useClients()
  const [localAttachments, setLocalAttachments] = useState<string[]>([])
  const { steps } = useProjectSteps(project?.id || '')
  const { productProgress, updateProductProgress } = useProductProgress(project?.id || '')

  if (!project) return null

  const priorityBadge = getPriorityBadge(project.priority)
  
  // Récupérer le nom du client
  const getClientName = () => {
    // Gérer les deux formats: client_id (UUID) ou client (string nom)
    const clientId = (project as any).client_id
    if (clientId) {
      const client = clients.find(c => c.id === clientId)
      return client?.name || "Client inconnu"
    }
    // Fallback sur le nom direct si c'est l'ancien format
    return project.client || "Client inconnu"
  }

  // Calculate progress for a specific product based on database
  const calculateProductProgress = (productId: string) => {
    const progress = productProgress.find(pp => pp.product_id === productId)
    return progress?.progress || 0
  }

  // Calculate overall progress based on all products
  const calculateOverallProgress = () => {
    if (!project.products || project.products.length === 0) return project.progress
    
    if (productProgress.length === 0) return project.progress

    const totalProgress = productProgress.reduce((sum, pp) => sum + pp.progress, 0)
    return Math.round(totalProgress / productProgress.length)
  }

  const overallProgress = project.products && project.products.length > 0 
    ? calculateOverallProgress() 
    : project.progress
  
  const allAttachments = [...(project.attachments || []), ...localAttachments]

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: string[] = []
    Array.from(files).forEach((file) => {
      if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file)
        newFiles.push(url)
      } else {
        toast({
          title: "Format invalide",
          description: "Seuls les fichiers PDF sont acceptés",
          variant: "destructive"
        })
      }
    })
    setLocalAttachments([...localAttachments, ...newFiles])
    
    if (onProjectUpdate) {
      onProjectUpdate({
        ...project,
        attachments: [...(project.attachments || []), ...newFiles]
      })
    }
  }

  const removeAttachment = (index: number) => {
    const newAttachments = allAttachments.filter((_, i) => i !== index)
    setLocalAttachments(newAttachments.slice(project.attachments?.length || 0))
    
    if (onProjectUpdate) {
      onProjectUpdate({
        ...project,
        attachments: newAttachments
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        {/* Full page layout */}
        <div className="min-h-[90vh]">
          {/* Timeline Section - First View */}
          <div className="bg-muted/30 px-8 py-8 border-b">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">{getClientName()}</h2>
                <p className="text-muted-foreground">
                  {project.name} - Référence production
                </p>
              </div>
              
              {/* Global progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avancement global</span>
                  <span className="text-sm font-bold text-foreground">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8 space-y-8 max-w-6xl mx-auto">
            {/* Single step detail - only show if project has exactly 1 product */}
            {project.products && project.products.length === 1 ? (
              <ProductionTimeline 
                projectId={project.id}
                projectName={project.name}
                productId={project.products[0].id}
                productName={project.products[0].reference || garmentTypeLabels[project.products[0].type] || project.products[0].type}
              />
            ) : project.products && project.products.length > 1 ? (
              <ProductionTimeline 
                projectId={project.id}
                projectName={project.name}
              />
            ) : !project.products || project.products.length === 0 ? (
              <ProductionTimeline 
                projectId={project.id}
                projectName={project.name}
              />
            ) : null}
            {/* Client Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nom du client</p>
                    <p className="text-base font-semibold">{project.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Projet</p>
                    <p className="text-base font-semibold">{project.name}</p>
                  </div>
                  {project.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{project.description}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Usine de production</p>
                    <p className="text-base font-semibold flex items-center gap-2">
                      <Factory className="h-4 w-4" />
                      {project.factory}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <Badge variant="outline" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {project.type === 'BULK' ? 'Production Bulk' : 'Production Sample'}
                    </Badge>
                  </div>
                  {priorityBadge && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Priorité</p>
                      <Badge variant={priorityBadge.variant}>
                        {priorityBadge.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <div className="grid gap-4 md:grid-cols-3">
              {isAdminUser && (
                <Card className="border-border/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Budget
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-xl font-semibold text-foreground">
                        {formatCurrency((project as any).budget || project.budget)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Coût: {formatCurrency((project as any).estimated_cost || (project as any).estimatedCost)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Quantité
                    </CardTitle>
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold text-foreground">
                      {project.quantity.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.products && project.products.length > 0 
                        ? `${project.products.length} produit${project.products.length > 1 ? 's' : ''} détaillé${project.products.length > 1 ? 's' : ''}`
                        : 'Quantité globale'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Progression
                    </CardTitle>
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Avancement global</span>
                        <span className="text-sm font-bold text-foreground">{overallProgress}%</span>
                      </div>
                      <Progress value={overallProgress} className="h-2" />
                    </div>
                    
                    <div className="pt-2 border-t border-border/40">
                      <div className="text-xs font-semibold text-foreground mb-3">Étapes de production</div>
                      <ProductionTracker projectId={project.id} compact={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Échéance
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(project.deadline)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Deadline
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Étapes de production par produit */}
            {project.products && project.products.length === 1 && (
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Factory className="h-5 w-5" />
                    Étapes de production par produit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {project.products.map((product) => (
                    <div key={product.id} className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {product.reference || garmentTypeLabels[product.type] || product.type}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity} pièces - {calculateProductProgress(product.id)}% terminé
                          </p>
                        </div>
                        <Progress value={calculateProductProgress(product.id)} className="w-32 h-2" />
                      </div>
                      <ProductStepsList
                        projectId={project.id}
                        productId={product.id}
                        productName={product.reference || garmentTypeLabels[product.type] || product.type}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Documents Section */}
            <Tabs defaultValue="documents" className="space-y-4">
              <TabsList className="bg-muted/30">
                <TabsTrigger value="documents">Documents PDF</TabsTrigger>
                <TabsTrigger value="products">Produits</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-4">
                <ProjectDocuments projectId={project.id} />
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                {project.products && project.products.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {project.products.map((product) => (
                      <Card key={product.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-medium">
                            {product.customType || garmentTypeLabels[product.type] || product.type}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {product.reference && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Référence</p>
                              <p className="text-sm font-medium text-foreground">{product.reference}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Quantité</p>
                            <p className="text-lg font-semibold text-foreground">
                              {product.quantity} pièces
                            </p>
                          </div>
                          {product.factory && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Usine de production</p>
                              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Factory className="h-3 w-3" />
                                {product.factory}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <p className="text-sm text-muted-foreground">
                      Aucun produit défini pour ce projet
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
