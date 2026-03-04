import Layout from "@/components/layout/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Shield,
  Save,
  Camera
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProfileData {
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  company: string | null
  notifications_email: boolean
  notifications_projects: boolean
  notifications_orders: boolean
  notifications_quality: boolean
  dark_mode: boolean
  compact_view: boolean
  language: string
  timezone: string
  currency: string
  two_factor_enabled: boolean
  login_alerts_enabled: boolean
}

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive"
        })
        return
      }

      if (profileData) {
        setProfile(profileData)
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (roleData) {
        setUserRole(roleData.role)
      }
    }

    fetchUserData()
  }, [user, toast])

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.substring(0, 1).toUpperCase() || "U"
    return name.substring(0, 1).toUpperCase()
  }

  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      return `https://ytbkcsfzghfwsduphjhs.supabase.co/storage/v1/object/public/avatars/${profile.avatar_url}`
    }
    return null
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user!.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user!.id)

      if (updateError) throw updateError

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (updatedProfile) {
        setProfile(updatedProfile)
        toast({
          title: "Succès",
          description: "Photo de profil mise à jour"
        })
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!profile || !user) return

    try {
      setSaving(true)

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          company: profile.company,
          notifications_email: profile.notifications_email,
          notifications_projects: profile.notifications_projects,
          notifications_orders: profile.notifications_orders,
          notifications_quality: profile.notifications_quality,
          dark_mode: profile.dark_mode,
          compact_view: profile.compact_view,
          language: profile.language,
          timezone: profile.timezone,
          currency: profile.currency,
          two_factor_enabled: profile.two_factor_enabled,
          login_alerts_enabled: profile.login_alerts_enabled
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Paramètres sauvegardés avec succès"
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      })
      return
    }

    try {
      setChangingPassword(true)

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast({
        title: "Succès",
        description: "Mot de passe changé avec succès"
      })
      
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: "Erreur",
        description: "Impossible de changer le mot de passe",
        variant: "destructive"
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const updateProfile = (field: keyof ProfileData, value: any) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Chargement...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">Gérez vos préférences et configurations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {getAvatarUrl() && <AvatarImage src={getAvatarUrl()!} />}
                    <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 cursor-pointer"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Camera className="h-3 w-3" />
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{profile.full_name || user?.email || "Utilisateur"}</h3>
                  <p className="text-sm text-muted-foreground">{userRole === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
                  <Badge variant="outline" className="mt-1">Premium</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input 
                    id="phone" 
                    placeholder="+33 1 23 45 67 89"
                    value={profile.phone || ""}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Entreprise</Label>
                  <Input 
                    id="company" 
                    placeholder="Nom de l'entreprise"
                    value={profile.company || ""}
                    onChange={(e) => updateProfile('company', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Préférences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <h4 className="font-medium">Notifications</h4>
                </div>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">Recevez les mises à jour importantes par email</p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={profile.notifications_email}
                      onCheckedChange={(checked) => updateProfile('notifications_email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="project-updates">Mises à jour de projets</Label>
                      <p className="text-sm text-muted-foreground">Alertes lors des changements de statut</p>
                    </div>
                    <Switch 
                      id="project-updates" 
                      checked={profile.notifications_projects}
                      onCheckedChange={(checked) => updateProfile('notifications_projects', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order-notifications">Notifications de commandes</Label>
                      <p className="text-sm text-muted-foreground">Alertes pour les nouvelles commandes</p>
                    </div>
                    <Switch 
                      id="order-notifications" 
                      checked={profile.notifications_orders}
                      onCheckedChange={(checked) => updateProfile('notifications_orders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="quality-alerts">Alertes qualité</Label>
                      <p className="text-sm text-muted-foreground">Notifications des contrôles qualité</p>
                    </div>
                    <Switch 
                      id="quality-alerts"
                      checked={profile.notifications_quality}
                      onCheckedChange={(checked) => updateProfile('notifications_quality', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <h4 className="font-medium">Apparence</h4>
                </div>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode">Mode sombre</Label>
                      <p className="text-sm text-muted-foreground">Basculer vers le thème sombre</p>
                    </div>
                    <Switch 
                      id="dark-mode"
                      checked={profile.dark_mode}
                      onCheckedChange={(checked) => updateProfile('dark_mode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view">Vue compacte</Label>
                      <p className="text-sm text-muted-foreground">Affichage dense pour plus d'informations</p>
                    </div>
                    <Switch 
                      id="compact-view"
                      checked={profile.compact_view}
                      onCheckedChange={(checked) => updateProfile('compact_view', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <h4 className="font-medium">Langue et région</h4>
                </div>
                <div className="space-y-3 pl-6">
                  <div>
                    <Label htmlFor="language">Langue</Label>
                    <Input 
                      id="language" 
                      value={profile.language}
                      onChange={(e) => updateProfile('language', e.target.value)}
                      className="max-w-xs" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Input 
                      id="timezone" 
                      value={profile.timezone}
                      onChange={(e) => updateProfile('timezone', e.target.value)}
                      className="max-w-xs" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Input 
                      id="currency" 
                      value={profile.currency}
                      onChange={(e) => updateProfile('currency', e.target.value)}
                      className="max-w-xs" 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <h4 className="font-medium">Sécurité</h4>
                </div>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                      <p className="text-sm text-muted-foreground">Sécurité renforcée avec code SMS</p>
                    </div>
                    <Switch 
                      id="two-factor"
                      checked={profile.two_factor_enabled}
                      onCheckedChange={(checked) => updateProfile('two_factor_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="login-alerts">Alertes de connexion</Label>
                      <p className="text-sm text-muted-foreground">Notifications des nouvelles connexions</p>
                    </div>
                    <Switch 
                      id="login-alerts"
                      checked={profile.login_alerts_enabled}
                      onCheckedChange={(checked) => updateProfile('login_alerts_enabled', checked)}
                    />
                  </div>
                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Changer le mot de passe
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Changer le mot de passe</DialogTitle>
                          <DialogDescription>
                            Entrez votre nouveau mot de passe (minimum 6 caractères)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="new-password">Nouveau mot de passe</Label>
                            <Input 
                              id="new-password" 
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                            <Input 
                              id="confirm-password" 
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="w-full"
                          >
                            {changingPassword ? "Changement..." : "Confirmer"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  className="gap-2"
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}