import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Upload, FileText } from "lucide-react"
import { Project, Priority, ProductItem, GarmentType } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { useClients } from "@/hooks/useClients"
import { useFactories } from "@/hooks/useFactories"
import { useAuth } from "@/hooks/useAuth"

interface NewProjectModalProps {
  onProjectCreated?: (project: any) => void
  trigger?: React.ReactNode
}

const garmentTypeLabels: Record<GarmentType, string> = {
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

export function NewProjectModal({ onProjectCreated, trigger }: NewProjectModalProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { clients, loading: loadingClients } = useClients()
  const { factories, loading: loadingFactories } = useFactories()
  const { user } = useAuth()
  const [isNewClient, setIsNewClient] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    factory: "",
    priority: "medium" as Priority,
    type: "BULK" as "BULK" | "SAMPLE",
    startDate: "",
    endDate: "",
    deadline: "",
    budget: "",
    estimatedCost: "",
    quantity: ""
  })
  const [products, setProducts] = useState<ProductItem[]>([])
  const [currentProduct, setCurrentProduct] = useState({
    type: "tshirt" as GarmentType,
    quantity: "",
    customType: "",
    reference: ""
  })
  const [attachments, setAttachments] = useState<string[]>([])

  // Liste des clients existants depuis Supabase
  const existingClients = clients.map(c => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name))

  // Calculer automatiquement la date de fin en fonction du type de projet
  useEffect(() => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate)
      const daysToAdd = formData.type === "SAMPLE" ? 25 : 40
      
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + daysToAdd)
      
      const formattedEndDate = endDate.toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, endDate: formattedEndDate }))
    }
  }, [formData.startDate, formData.type])

  const addProduct = () => {
    if (!currentProduct.quantity || parseInt(currentProduct.quantity) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une quantité valide",
        variant: "destructive"
      })
      return
    }

    const newProduct: ProductItem = {
      id: `product-${Date.now()}`,
      type: currentProduct.type,
      quantity: parseInt(currentProduct.quantity),
      customType: currentProduct.type === 'other' ? currentProduct.customType : undefined,
      reference: currentProduct.reference || undefined
    }

    setProducts([...products, newProduct])
    setCurrentProduct({
      type: "tshirt",
      quantity: "",
      customType: "",
      reference: ""
    })
  }

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
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
    setAttachments([...attachments, ...newFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (products.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      // Créer ou récupérer le client
      let clientId = formData.client
      
      if (isNewClient && formData.client) {
        // Créer un nouveau client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({ name: formData.client })
          .select()
          .single()
        
        if (clientError) throw clientError
        clientId = newClient.id
      }

      // Créer le projet dans Supabase
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description || null,
          status: 'draft',
          priority: formData.priority,
          progress: 0,
          factory_id: formData.factory || null,
          client_id: clientId || null,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          deadline: formData.deadline || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
          quantity: totalQuantity,
          type: formData.type,
          created_by: user?.id || null
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Créer les produits associés
      if (products.length > 0) {
        const productsToInsert = products.map(p => ({
          project_id: project.id,
          garment_type: p.type,
          custom_type: p.customType || null,
          quantity: p.quantity,
          reference: p.reference || null
        }))

        const { error: productsError } = await supabase
          .from('project_products')
          .insert(productsToInsert)

        if (productsError) throw productsError
      }

      toast({
        title: "Projet créé",
        description: `Le projet "${project.name}" a été créé avec succès.`,
      })

      if (onProjectCreated) {
        onProjectCreated(project)
      }

      // Réinitialiser le formulaire
      setOpen(false)
      setFormData({
        name: "",
        description: "",
        client: "",
        factory: "",
        priority: "medium",
        type: "BULK",
        startDate: "",
        endDate: "",
        deadline: "",
        budget: "",
        estimatedCost: "",
        quantity: ""
      })
      setProducts([])
      setAttachments([])
      setIsNewClient(false)

    } catch (error: any) {
      console.error('Error creating project:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le projet",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="hero" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Projet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du projet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Collection Printemps 2024"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="client">Client *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsNewClient(!isNewClient)
                    setFormData({...formData, client: ""})
                  }}
                  className="h-7 text-xs"
                >
                  {isNewClient ? "Choisir un client existant" : "Nouveau client"}
                </Button>
              </div>
              
              {isNewClient ? (
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  placeholder="Nom du nouveau client"
                  required
                />
              ) : (
                <Select 
                  value={formData.client} 
                  onValueChange={(value) => setFormData({...formData, client: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description détaillée du projet..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="factory">Usine</Label>
              <Select value={formData.factory} onValueChange={(value) => setFormData({...formData, factory: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une usine" />
                </SelectTrigger>
                <SelectContent>
                  {factories.map((factory) => (
                    <SelectItem key={factory.id} value={factory.id}>
                      {factory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as Priority})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionType">Type de production *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as "BULK" | "SAMPLE"})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BULK">Bulk (Grosse production)</SelectItem>
                <SelectItem value="SAMPLE">Sample (Prototype)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Date limite</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (€)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="150000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Coût estimé (€)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                placeholder="145000"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Produits *</Label>
            
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="productType">Type de produit</Label>
                  <Select 
                    value={currentProduct.type} 
                    onValueChange={(value) => setCurrentProduct({...currentProduct, type: value as GarmentType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(garmentTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productReference">Référence</Label>
                  <Input
                    id="productReference"
                    value={currentProduct.reference}
                    onChange={(e) => setCurrentProduct({...currentProduct, reference: e.target.value})}
                    placeholder="REF-001"
                  />
                </div>

                {currentProduct.type === 'other' && (
                  <div className="space-y-2">
                    <Label htmlFor="customType">Préciser le type</Label>
                    <Input
                      id="customType"
                      value={currentProduct.customType}
                      onChange={(e) => setCurrentProduct({...currentProduct, customType: e.target.value})}
                      placeholder="Type personnalisé"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="productQuantity">Quantité</Label>
                  <Input
                    id="productQuantity"
                    type="number"
                    value={currentProduct.quantity}
                    onChange={(e) => setCurrentProduct({...currentProduct, quantity: e.target.value})}
                    placeholder="100"
                  />
                </div>

                <div className="flex items-end">
                  <Button type="button" onClick={addProduct} size="sm" className="gap-1">
                    <Plus className="h-3 w-3" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </Card>

            {products.length > 0 && (
              <div className="space-y-2">
                <Label>Produits ajoutés ({products.length})</Label>
                <div className="space-y-2">
                  {products.map((product) => (
                    <Card key={product.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">
                          {product.type === 'other' ? product.customType : garmentTypeLabels[product.type]}
                        </span>
                        {product.reference && (
                          <span className="text-sm text-muted-foreground">
                            ({product.reference})
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {product.quantity} pièces
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                  <div className="text-right font-semibold text-sm">
                    Total: {totalQuantity} pièces
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Documents (PDF)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <Label
                  htmlFor="pdf-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Ajouter des fichiers PDF
                </Label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <Card key={index} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Document PDF {index + 1}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer le projet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}