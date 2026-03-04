import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Search, Building2, TrendingUp, ChevronLeft, ChevronRight, SlidersHorizontal, ExternalLink } from "lucide-react"
import Layout from "@/components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/LanguageContext"
import { useClients } from "@/hooks/useClients"
import { useProjects } from "@/hooks/useProjects"
import { formatCurrency } from "@/lib/utils"
import { useUserRole } from "@/hooks/useUserRole"

interface ClientData {
  id: string
  name: string
  projectCount: number
  totalValue: number
  completedProjects: number
  inProgressProjects: number
}

export default function Clients() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialClient = searchParams.get('client')
  const [searchQuery, setSearchQuery] = useState(initialClient || "")
  const [selectedClient, setSelectedClient] = useState<string | null>(initialClient)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<"name" | "value" | "projects">("name")
  const itemsPerPage = 12
  const { isAdmin } = useUserRole()

  const { clients, loading: loadingClients } = useClients()
  const { projects, loading: loadingProjects } = useProjects()

  useEffect(() => {
    if (initialClient) {
      setSelectedClient(initialClient)
      setSearchQuery(initialClient)
    }
  }, [initialClient])

  const clientsData: ClientData[] = clients.map(client => {
    const clientProjects = projects.filter(p => p.client_id === client.id)
    return {
      id: client.id,
      name: client.name,
      projectCount: clientProjects.length,
      totalValue: clientProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0),
      completedProjects: clientProjects.filter(p => p.status === 'completed').length,
      inProgressProjects: clientProjects.filter(p => p.status === 'in_progress').length,
    }
  })

  const filteredClients = clientsData
    .filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "value":
          return b.totalValue - a.totalValue
        case "projects":
          return b.projectCount - a.projectCount
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-medium text-foreground tracking-tight">
            Comptes Clients
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Gérez vos relations clients et suivez l'historique de leurs projets
          </p>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedClient(null)
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
              <SelectItem value="value">Trier par valeur</SelectItem>
              <SelectItem value="projects">Trier par projets</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}
            {filteredClients.length > itemsPerPage && 
              ` • Page ${currentPage} sur ${totalPages}`
            }
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedClients.map((client) => (
            <Card 
              key={client.name} 
              className={`cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm ${
                selectedClient === client.name ? 'border-primary/50 shadow-sm' : 'border-border/40'
              }`}
              onClick={() => setSelectedClient(
                selectedClient === client.name ? null : client.name
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-medium tracking-tight truncate">
                        {client.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="shrink-0 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors text-xs px-2 py-0.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/clients/${encodeURIComponent(client.name)}`)
                        }}
                      >
                        Voir détails →
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {client.projectCount} projet{client.projectCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {isAdmin && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs">Valeur totale</span>
                      <span className="font-semibold text-sm text-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        {formatCurrency(client.totalValue)}
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Terminés</p>
                      <p className="text-sm font-medium text-foreground">{client.completedProjects}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">En cours</p>
                      <p className="text-sm font-medium text-foreground">{client.inProgressProjects}</p>
                    </div>
                  </div>
                </div>
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

        {filteredClients.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-base font-medium text-foreground mb-2">
              Aucun client trouvé
            </h3>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier votre recherche
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}