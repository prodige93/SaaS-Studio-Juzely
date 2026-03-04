import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  location: z.string().optional(),
  country: z.string().optional(),
  contact_person: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  capacity: z.string().optional(),
  rating: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NewFactoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewFactoryModal({ open, onOpenChange }: NewFactoryModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newCertification, setNewCertification] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      country: "",
      contact_person: "",
      email: "",
      phone: "",
      capacity: "",
      rating: "",
      status: "active",
      notes: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("factories").insert({
        name: values.name,
        location: values.location || null,
        country: values.country || null,
        contact_person: values.contact_person || null,
        email: values.email || null,
        phone: values.phone || null,
        capacity: values.capacity ? parseInt(values.capacity) : null,
        rating: values.rating ? parseFloat(values.rating) : null,
        status: values.status,
        specialties: specialties.length > 0 ? specialties : null,
        certifications: certifications.length > 0 ? certifications : null,
        notes: values.notes || null,
      })

      if (error) throw error

      toast({
        title: "Usine créée",
        description: "L'usine a été ajoutée avec succès",
      })

      form.reset()
      setSpecialties([])
      setCertifications([])
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating factory:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer l'usine",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty))
  }

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()])
      setNewCertification("")
    }
  }

  const removeCertification = (certification: string) => {
    setCertifications(certifications.filter(c => c !== certification))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une Usine</DialogTitle>
          <DialogDescription>
            Créer une nouvelle usine partenaire
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nom de l'usine *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Textile Maroc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Casablanca" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maroc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personne de contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@usine.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+212 6 00 00 00 00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacité mensuelle</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (0-5)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="5" 
                        placeholder="4.5" 
                        {...field} 
                      />
                    </FormControl>
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Spécialités</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une spécialité"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                />
                <Button type="button" onClick={addSpecialty} variant="outline">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="gap-1">
                    {specialty}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSpecialty(specialty)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Certifications</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une certification"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                />
                <Button type="button" onClick={addCertification} variant="outline">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {certifications.map((certification) => (
                  <Badge key={certification} variant="secondary" className="gap-1">
                    {certification}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeCertification(certification)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations supplémentaires..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer l'usine"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
