import Layout from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Package, 
  Users,
  BarChart3,
  Download,
  TestTube,
  MapPin,
  CheckCircle2,
  Loader2,
  Award
} from "lucide-react"
import { useState, useMemo } from "react"
import { useProjects } from "@/hooks/useProjects"
import { useFactories } from "@/hooks/useFactories"
import { useProjectProducts } from "@/hooks/useProjectProducts"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from "@/lib/utils"
import { useUserRole } from "@/hooks/useUserRole"

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d")
  const { projects, loading } = useProjects()
  const { factories, loading: loadingFactories } = useFactories()
  const { products, loading: loadingProducts } = useProjectProducts()
  const { isAdmin } = useUserRole()

  // Indicateur de chargement global
  const isLoading = loading || loadingFactories || loadingProducts

  const stats = useMemo(() => {
    const totalRevenue = projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)
    const activeProjects = projects.filter(p => p.status === 'in_progress').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    
    // Calcul des tendances par rapport au mois dernier
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthProjects = projects.filter(p => {
      const created = new Date(p.created_at)
      return created >= lastMonth && created < new Date(now.getFullYear(), now.getMonth(), 1)
    })
    const lastMonthRevenue = lastMonthProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)
    const revenueTrend = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) 
      : '0'
    
    return [
      {
        title: "Chiffre d'affaires",
        value: formatCurrency(totalRevenue),
        change: `${Number(revenueTrend) >= 0 ? '+' : ''}${revenueTrend}%`,
        trend: Number(revenueTrend) >= 0 ? "up" as const : "down" as const,
        icon: DollarSign,
        description: "Vs mois précédent"
      },
      {
        title: "Projets actifs",
        value: activeProjects.toString(),
        change: `${activeProjects} en cours`,
        trend: "up" as const,
        icon: Package,
        description: "En production"
      },
      {
        title: "Projets terminés",
        value: completedProjects.toString(),
        change: `${completedProjects} complétés`,
        trend: "up" as const,
        icon: Clock,
        description: "Finalisés"
      },
      {
        title: "Usines partenaires",
        value: factories.filter(f => f.status === 'active').length.toString(),
        change: `${factories.length} total`,
        trend: "up" as const,
        icon: Users,
        description: "Partenaires actifs"
      }
    ]
  }, [projects, factories])

  // Calcul des budgets (admin uniquement)
  const budgetData = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const totalEstimatedCost = projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)
    const difference = totalBudget - totalEstimatedCost
    const percentageUsed = totalBudget > 0 ? (totalEstimatedCost / totalBudget) * 100 : 0

    const projectBudgets = projects
      .filter(p => p.budget || p.estimated_cost)
      .map(p => ({
        id: p.id,
        name: p.name,
        budget: p.budget || 0,
        estimatedCost: p.estimated_cost || 0,
        difference: (p.budget || 0) - (p.estimated_cost || 0),
        percentageUsed: p.budget > 0 ? ((p.estimated_cost || 0) / p.budget) * 100 : 0,
        status: p.status
      }))
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))

    return {
      totalBudget,
      totalEstimatedCost,
      difference,
      percentageUsed,
      projectBudgets
    }
  }, [projects])

  const topFactories = useMemo(() => {
    if (factories.length === 0) return []
    
    return factories
      .map(factory => {
        const factoryProjects = projects.filter(p => p.factory_id === factory.id)
        const activeProjects = factoryProjects.filter(p => p.status === 'in_progress').length
        const completedProjects = factoryProjects.filter(p => p.status === 'completed').length
        const revenue = factoryProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0)
        
        return {
          id: factory.id,
          name: factory.name,
          location: factory.location ? `${factory.location}, ${factory.country || ''}` : factory.country || 'Non spécifié',
          specialties: factory.specialties?.slice(0, 3) || [],
          capacity: factory.capacity,
          status: factory.status,
          orders: factoryProjects.length,
          activeProjects,
          completedProjects,
          revenue: formatCurrency(revenue),
          rawRevenue: revenue,
          rating: factory.rating || 0,
          contactPerson: factory.contact_person
        }
      })
      .filter(f => f.orders > 0)
      .sort((a, b) => b.rawRevenue - a.rawRevenue)
      .slice(0, 5)
  }, [projects, factories])

  // Calcul des tendances produits basé sur les vraies données
  const productTrends = useMemo(() => {
    // Si aucun produit, afficher les statistiques des projets par type
    if (products.length === 0) {
      const bulkProjects = projects.filter(p => p.type === 'BULK' || !p.type)
      const sampleProjects = projects.filter(p => p.type === 'SAMPLE')
      
      const bulkQuantity = bulkProjects.reduce((sum, p) => sum + (p.quantity || 0), 0)
      const sampleQuantity = sampleProjects.reduce((sum, p) => sum + (p.quantity || 0), 0)

      return [
        {
          category: 'Production en série (BULK)',
          description: 'Commandes en grande quantité pour production massive',
          growth: `${bulkProjects.length} projets`,
          quantity: bulkQuantity > 0 ? `${bulkQuantity} unités` : undefined,
          color: "text-blue-600",
          icon: "Package" as const
        },
        {
          category: 'Échantillons (SAMPLE)',
          description: 'Prototypes et tests avant production',
          growth: `${sampleProjects.length} projets`,
          quantity: sampleQuantity > 0 ? `${sampleQuantity} unités` : undefined,
          color: "text-purple-600",
          icon: "TestTube" as const
        }
      ].filter(t => t.growth !== '0 projets')
    }

    const garmentTypes: Record<string, string> = {
      tshirt: "T-shirts",
      pull: "Pulls",
      sweatshirt: "Sweatshirts",
      jacket: "Vestes",
      pants: "Pantalons",
      headwear: "Couvre-chefs",
      dress: "Robes",
      sweater: "Sweaters",
      skirt: "Jupes",
      other: "Autres"
    }

    const categoryCounts: Record<string, number> = {}
    products.forEach(product => {
      const category = garmentTypes[product.garment_type] || product.garment_type
      categoryCounts[category] = (categoryCounts[category] || 0) + product.quantity
    })

    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({
        category,
        description: undefined,
        growth: `${count} unités`,
        quantity: undefined,
        color: "text-green-600",
        icon: "Package" as const
      }))
  }, [products, projects])

  // Calcul des données du graphique d'évolution du CA
  const revenueData = useMemo(() => {
    const monthlyData: Record<string, number> = {}
    
    projects.forEach(project => {
      if (project.estimated_cost && project.created_at) {
        const date = new Date(project.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + project.estimated_cost
      }
    })

    // Récupérer les 12 derniers mois
    const result = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
      
      result.push({
        month: monthName,
        revenue: monthlyData[monthKey] || 0
      })
    }

    return result
  }, [projects])

  const handleExport = () => {
    // Créer les données à exporter
    const exportData = {
      stats: stats.map(s => ({
        titre: s.title,
        valeur: s.value,
        changement: s.change,
        description: s.description
      })),
      topFactories: topFactories.map(f => ({
        usine: f.name,
        commandes: f.orders,
        chiffre_affaires: f.revenue,
        note: f.rating
      })),
      tendancesProduits: productTrends.map(t => ({
        categorie: t.category,
        croissance: t.growth
      })),
      evolutionCA: revenueData.map(r => ({
        mois: r.month,
        chiffre_affaires: r.revenue
      }))
    }

    // Convertir en CSV
    const csvContent = [
      '=== STATISTIQUES ===',
      'Titre,Valeur,Changement,Description',
      ...exportData.stats.map(s => `${s.titre},${s.valeur},${s.changement},${s.description}`),
      '',
      '=== TOP USINES PARTENAIRES ===',
      'Usine,Commandes,Chiffre d\'affaires,Note',
      ...exportData.topFactories.map(f => `${f.usine},${f.commandes},${f.chiffre_affaires},${f.note}`),
      '',
      '=== TENDANCES PRODUITS ===',
      'Catégorie,Croissance',
      ...exportData.tendancesProduits.map(t => `${t.categorie},${t.croissance}`),
      '',
      '=== EVOLUTION DU CHIFFRE D\'AFFAIRES ===',
      'Mois,Chiffre d\'affaires',
      ...exportData.evolutionCA.map(r => `${r.mois},${r.chiffre_affaires}`)
    ].join('\n')

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Analysez les performances de vos projets textiles
              {isLoading && <span className="ml-2 text-xs">(Mise à jour en temps réel...)</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
                <SelectItem value="1y">1 année</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className={`flex items-center ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? 
                      <TrendingUp className="h-3 w-3 mr-1" /> : 
                      <TrendingDown className="h-3 w-3 mr-1" />
                    }
                    {stat.change}
                  </div>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section Budget - Admin only */}
        {isAdmin && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Gestion des Budgets
                </CardTitle>
                <CardDescription>Vue d'ensemble des budgets alloués vs coûts estimés</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Résumé global des budgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Budget Total Alloué</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(budgetData.totalBudget)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Coûts Estimés</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(budgetData.totalEstimatedCost)}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${budgetData.difference >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <p className="text-sm text-muted-foreground mb-1">Différence</p>
                    <p className={`text-2xl font-bold ${budgetData.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {budgetData.difference >= 0 ? '+' : ''}{formatCurrency(budgetData.difference)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {budgetData.percentageUsed.toFixed(1)}% utilisé
                    </p>
                  </div>
                </div>

                {/* Liste des projets avec budget */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Détail par projet</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {budgetData.projectBudgets.map((project) => {
                      const diff = project.budget - project.estimatedCost
                      const percentUsed = project.budget > 0 ? (project.estimatedCost / project.budget) * 100 : 0
                      return (
                        <div key={project.id} className="p-4 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-foreground">{project.name}</p>
                            <Badge variant={diff >= 0 ? "default" : "destructive"} className="ml-2">
                              {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Budget</p>
                              <p className="font-medium text-foreground">{formatCurrency(project.budget)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Coût estimé</p>
                              <p className="font-medium text-foreground">{formatCurrency(project.estimatedCost)}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Utilisation</span>
                              <span>{percentUsed.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  percentUsed > 100 ? 'bg-red-500' : percentUsed > 80 ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top usines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top usines partenaires
              </CardTitle>
              <CardDescription>Classement par chiffre d'affaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {topFactories.length > 0 ? (
                  topFactories.map((factory, index) => (
                    <div 
                      key={factory.id} 
                      className="p-4 rounded-lg bg-muted/50 transition-all hover:bg-muted hover:shadow-md border border-border/50 animate-fade-in"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'backwards'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex items-center justify-center min-w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm animate-scale-in"
                            style={{
                              animationDelay: `${index * 100 + 150}ms`,
                              animationFillMode: 'backwards'
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground text-lg">{factory.name}</p>
                              {factory.status === 'active' && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 animate-fade-in"
                                  style={{
                                    animationDelay: `${index * 100 + 200}ms`,
                                    animationFillMode: 'backwards'
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span className="text-xs font-medium">Actif</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{factory.location}</span>
                            </div>

                            {factory.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {factory.specialties.map((specialty, specIndex) => (
                                  <span 
                                    key={specialty} 
                                    className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 animate-fade-in"
                                    style={{
                                      animationDelay: `${index * 100 + 250 + specIndex * 50}ms`,
                                      animationFillMode: 'backwards'
                                    }}
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">{factory.revenue}</p>
                          {factory.contactPerson && (
                            <p className="text-xs text-muted-foreground mt-1">Contact: {factory.contactPerson}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/50">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                          <p className="text-lg font-semibold text-foreground">{factory.orders} commandes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
                            <Loader2 className="h-3 w-3" />
                            En cours
                          </p>
                          <p className="text-lg font-semibold text-orange-600">{factory.activeProjects}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Terminés
                          </p>
                          <p className="text-lg font-semibold text-green-600">{factory.completedProjects}</p>
                        </div>
                      </div>

                      {factory.capacity && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Capacité:</span>
                          <span className="text-sm font-medium text-foreground">{factory.capacity} unités</span>
                        </div>
                      )}
                      
                      {factory.rating > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-foreground">{factory.rating}/5</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tendances produits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendances produits
              </CardTitle>
              <CardDescription>Croissance par catégorie ({timeRange})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {productTrends.length > 0 ? (
                  productTrends.map((trend) => (
                    <div key={trend.category} className="p-4 rounded-lg bg-muted/50 transition-colors hover:bg-muted border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {trend.icon === 'Package' ? (
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <TestTube className="h-5 w-5 text-purple-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{trend.category}</p>
                            {trend.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{trend.description}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={trend.color}>
                          {trend.growth}
                        </Badge>
                      </div>
                      {trend.quantity && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-sm text-muted-foreground">
                            Volume total: <span className="font-medium text-foreground">{trend.quantity}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques détaillés - Admin only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
              <CardDescription>Performance mensuelle sur les 12 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Chiffre d'affaires"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}