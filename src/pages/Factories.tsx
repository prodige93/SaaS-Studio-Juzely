import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Plus, Search, MapPin, Star, Users, Package, TrendingUp, ChevronLeft, ChevronRight, SlidersHorizontal, ExternalLink } from "lucide-react"
import Layout from "@/components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFactories } from "@/hooks/useFactories"
import { useProjects } from "@/hooks/useProjects"
import { NewFactoryModal } from "@/components/forms/NewFactoryModal"
import { formatCurrency } from "@/lib/utils"
import { useUserRole } from "@/hooks/useUserRole"

interface FactoryData {
  id: string
  name: string
  location: string | null
  country: string | null
  rating: number | null
  capacity: number | null
  specialties: string[]
  projectCount: number
  totalValue: number
  completedProjects: number
  inProgressProjects: number
}

export default function Factories() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialFactory = searchParams.get('factory')
  const [searchQuery, setSearchQuery] = useState(initialFactory || "")
  const [selectedFactory, setSelectedFactory] = useState<string | null>(initialFactory)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<"name" | "rating" | "projects">("name")
  const [isNewFactoryModalOpen, setIsNewFactoryModalOpen] = useState(false)
  const itemsPerPage = 12
  const { isAdmin } = useUserRole()

  const { factories, loading: loadingFactories } = useFactories()
  const { projects, loading: loadingProjects } = useProjects()

  const factoriesData: FactoryData[] = factories.map(factory => {
    const factoryProjects = projects.filter(p => p.factory_id === factory.id)
    return {
      id: factory.id,
      name: factory.name,
      location: factory.location,
      country: factory.country,
      rating: factory.rating,
      capacity: factory.capacity,
      specialties: factory.specialties || [],
      projectCount: factoryProjects.length,
      totalValue: factoryProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0),
      completedProjects: factoryProjects.filter(p => p.status === 'completed').length,
      inProgressProjects: factoryProjects.filter(p => p.status === 'in_progress').length,
    }
  })

  const filteredFactories = factoriesData
    .filter(factory =>
      factory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factory.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factory.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "projects":
          return b.projectCount - a.projectCount
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const totalPages = Math.ceil(filteredFactories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedFactories = filteredFactories.slice(startIndex, startIndex + itemsPerPage)

  const formatCapacity = (capacity: number) => {
    return new Intl.NumberFormat('fr-FR').format(capacity)
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
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-medium text-foreground tracking-tight">
            Usines Partenaires
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Gérez vos relations avec les usines et suivez leurs projets
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une usine..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedFactory(null)
              }}
              className="pl-9 h-10 bg-background"
            />
          </div>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48 h-10 bg-background">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Trier par nom</SelectItem>
              <SelectItem value="rating">Trier par note</SelectItem>
              <SelectItem value="projects">Trier par projets</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="hero" 
            size="default"
            onClick={() => setIsNewFactoryModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Usine
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredFactories.length} usine{filteredFactories.length > 1 ? 's' : ''}
            {filteredFactories.length > itemsPerPage && 
              ` • Page ${currentPage} sur ${totalPages}`
            }
          </span>
        </div>

        {/* Liste des usines */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedFactories.map((factory) => (
            <Card 
              key={factory.id} 
              className={`cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm ${
                selectedFactory === factory.name ? 'border-primary/50 shadow-sm' : 'border-border/40'
              }`}
              onClick={() => setSelectedFactory(
                selectedFactory === factory.name ? null : factory.name
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-medium tracking-tight truncate">
                        {factory.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="shrink-0 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors text-xs px-2 py-0.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/factories/${encodeURIComponent(factory.name)}`)
                        }}
                      >
                        Voir détails →
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{factory.location}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-sm">{factory.rating}/5</span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">Projets</span>
                    <span className="font-semibold text-sm text-foreground flex items-center gap-1">
                      <Package className="h-3 w-3 text-primary" />
                      {factory.projectCount}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Terminés</p>
                      <p className="text-sm font-medium text-foreground">{factory.completedProjects}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">En cours</p>
                      <p className="text-sm font-medium text-foreground">{factory.inProgressProjects}</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => navigate(`/`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir tous les projets
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {filteredFactories.length === 0 && (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-base font-medium text-foreground mb-2">
              Aucune usine trouvée
            </h3>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier votre recherche
            </p>
          </div>
        )}
      </div>

      <NewFactoryModal 
        open={isNewFactoryModalOpen}
        onOpenChange={(open) => {
          setIsNewFactoryModalOpen(open)
          if (!open) {
            navigate('/factories')
          }
        }}
      />
    </Layout>
  )
}