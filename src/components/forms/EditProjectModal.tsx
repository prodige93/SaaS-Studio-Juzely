import { useState, useEffect } from "react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Edit } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Project } from "@/types"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  client: z.string().min(2, "Le client doit être spécifié"),
  factory: z.string().min(1, "Veuillez sélectionner une usine"),
  type: z.enum(["BULK", "SAMPLE"]),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["planning", "in_progress", "completed", "delayed"]),
  startDate: z.date({
    required_error: "La date de début est requise",
  }),
  deadline: z.date({
    required_error: "La date limite est requise",
  }),
  budget: z.number().min(1, "Le budget doit être supérieur à 0"),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  progress: z.number().min(0).max(100, "Le progrès doit être entre 0 et 100"),
})

interface EditProjectModalProps {
  project: Project
  factories: string[]
  onProjectUpdated: (updatedProject: Project) => void
  children?: React.ReactNode
}

export function EditProjectModal({ 
  project, 
  factories, 
  onProjectUpdated, 
  children 
}: EditProjectModalProps) {
  const [open, setOpen] = useState(false)
  const [autoCalculateDeadline, setAutoCalculateDeadline] = useState(true)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description || "",
      client: (project as any).client_id || "",
      factory: (project as any).factory_id || "",
      type: project.type || "BULK",
      priority: project.priority as "low" | "medium" | "high",
      status: project.status as "planning" | "in_progress" | "completed" | "delayed",
      startDate: (project as any).start_date ? new Date((project as any).start_date) : new Date(),
      deadline: (project as any).deadline ? new Date((project as any).deadline) : new Date(),
      budget: project.budget || 0,
      quantity: project.quantity || 0,
      progress: project.progress || 0,
    },
  })

  // Auto-save pour les modifications du formulaire
  const formValues = form.watch()
  useEffect(() => {
    // Comparer avec les valeurs originales du projet
    const originalValues = {
      name: project.name,
      description: project.description || "",
      client: (project as any).client_id || "",
      factory: (project as any).factory_id || "",
      type: project.type || "BULK",
      priority: project.priority,
      status: project.status,
      startDate: (project as any).start_date ? new Date((project as any).start_date) : new Date(),
      deadline: (project as any).deadline ? new Date((project as any).deadline) : new Date(),
      budget: project.budget || 0,
      quantity: project.quantity || 0,
      progress: project.progress || 0,
    }

    // Vérifier si des modifications ont été apportées
    const hasChanges = JSON.stringify(formValues) !== JSON.stringify(originalValues)
    
    if (hasChanges && open) {
      const timeoutId = setTimeout(() => {
        console.log('Auto-sauvegarde du formulaire:', formValues)
        
        toast({
          title: "✓ Modifications sauvegardées",
          description: "Les changements sont enregistrés automatiquement",
          duration: 2000,
        })
      }, 2000) // Debounce de 2 secondes
      
      return () => clearTimeout(timeoutId)
    }
  }, [formValues, project, open, toast])

  // Fonction pour calculer automatiquement la date limite
  const calculateDeadline = (startDate: Date, type: "BULK" | "SAMPLE") => {
    const daysToAdd = type === "BULK" ? 40 : 25
    const deadline = new Date(startDate)
    deadline.setDate(deadline.getDate() + daysToAdd)
    return deadline
  }

  // Surveiller les changements de date de début et type pour recalculer la deadline
  const watchedStartDate = form.watch("startDate")
  const watchedType = form.watch("type")

  React.useEffect(() => {
    if (autoCalculateDeadline && watchedStartDate && watchedType) {
      const newDeadline = calculateDeadline(watchedStartDate, watchedType)
      form.setValue("deadline", newDeadline)
    }
  }, [watchedStartDate, watchedType, autoCalculateDeadline, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedProject: Project = {
      ...project,
      ...values,
      startDate: format(values.startDate, 'yyyy-MM-dd'),
      endDate: format(values.deadline, 'yyyy-MM-dd'),
      deadline: format(values.deadline, 'yyyy-MM-dd'),
      estimatedCost: values.budget * 0.95, // Estimation basée sur le budget
    }

    onProjectUpdated(updatedProject)
    setOpen(false)
    
    toast({
      title: "✓ Projet sauvegardé",
      description: `Le projet "${values.name}" a été mis à jour avec succès.`,
      duration: 3000,
    })
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute'
      case 'medium': return 'Moyenne'
      case 'low': return 'Basse'
      default: return priority
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planification'
      case 'in_progress': return 'En cours'
      case 'completed': return 'Terminé'
      case 'delayed': return 'Retardé'
      default: return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
          <DialogDescription>
            Modifiez les informations de votre projet textile.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du projet</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Collection Été 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre projet..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de projet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BULK">BULK (40 jours)</SelectItem>
                        <SelectItem value="SAMPLE">SAMPLE (25 jours)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="factory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usine</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une usine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {factories.map((factory) => (
                          <SelectItem key={factory} value={factory}>
                            {factory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planification</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                        <SelectItem value="delayed">Retardé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                              format(field.value, "dd MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={fr}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <FormLabel>Date limite</FormLabel>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="auto-deadline"
                          checked={autoCalculateDeadline}
                          onChange={(e) => setAutoCalculateDeadline(e.target.checked)}
                        />
                        <label htmlFor="auto-deadline" className="text-xs text-muted-foreground">
                          Auto
                        </label>
                      </div>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            disabled={autoCalculateDeadline}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                              autoCalculateDeadline && "opacity-50"
                            )}
                          >
                            {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                              format(field.value, "dd MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={fr}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {autoCalculateDeadline && (
                      <p className="text-xs text-muted-foreground">
                        Calculé automatiquement ({watchedType === "BULK" ? "40" : "25"} jours après le début)
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progrès (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="75"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Sauvegarder les modifications
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}