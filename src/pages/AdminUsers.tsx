import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus, Shield, User, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  profiles?: Profile;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  
  // New user creation state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    
    // Set up realtime subscription for user_roles
    const channel = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log('User roles changed:', payload);
          // Refresh users list on any change
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      // Récupérer TOUS les profils d'abord
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Récupérer les rôles utilisateurs
      const { data: userRolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combiner les données - TOUS les profils avec leurs rôles (ou null)
      const combinedData = profilesData?.map(profile => {
        const userRole = userRolesData?.find(ur => ur.user_id === profile.id);
        return {
          id: userRole?.id || `temp-${profile.id}`,
          user_id: profile.id,
          role: userRole?.role || null,
          assigned_at: userRole?.assigned_at || profile.created_at,
          profiles: profile
        };
      }) || [];

      setUsers(combinedData);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);

    try {
      const { error } = await supabase
        .from("pending_users")
        .insert({
          email: inviteEmail,
          role: inviteRole as "admin" | "user",
          invited_by: user?.id || "",
        });

      if (error) throw error;

      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${inviteEmail}`,
      });

      setInviteEmail("");
      setInviteRole("user");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Validate inputs
      if (!newUserEmail || !newUserPassword) {
        throw new Error("Email et mot de passe requis");
      }

      if (newUserPassword.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      // Call edge function using supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserFullName,
          role: newUserRole,
        },
      });

      if (error) {
        throw new Error(error.message || "Erreur lors de la création de l'utilisateur");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Erreur lors de la création de l'utilisateur");
      }

      toast({
        title: "Utilisateur créé",
        description: `${newUserEmail} a été créé avec succès`,
      });

      // Reset form
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setNewUserRole("user");
      
      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Non authentifié");
      }

      const supabaseUrl = 'https://ytbkcsfzghfwsduphjhs.supabase.co';
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été complètement supprimé du système",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string | null) => {
    if (role === "admin") return Shield;
    if (role === "user") return User;
    return User;
  };
  
  const getRoleLabel = (role: string | null) => {
    if (role === "admin") return "Administrateur";
    if (role === "user") return "Coordinateur";
    return "Aucun rôle";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les accès à votre système de production
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Ajouter un nouvel utilisateur
            </CardTitle>
            <CardDescription>
              Créez directement un compte ou envoyez une invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Créer directement</TabsTrigger>
                <TabsTrigger value="invite">Envoyer invitation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4 mt-4">
                <form onSubmit={createUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">Email *</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        placeholder="utilisateur@email.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Prénom Nom"
                        value={newUserFullName}
                        onChange={(e) => setNewUserFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe * (min. 6 caractères)</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRole">Rôle *</Label>
                      <Select value={newUserRole} onValueChange={setNewUserRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="user">Coordinateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={creating} className="w-full md:w-auto">
                    {creating ? "Création en cours..." : "Créer l'utilisateur"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="invite" className="space-y-4 mt-4">
                <form onSubmit={inviteUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="utilisateur@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="user">Coordinateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" disabled={inviting} className="w-full">
                        {inviting ? "Envoi..." : "Envoyer l'invitation"}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs actuels</CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs ayant accès au système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userRole) => {
                  const RoleIcon = getRoleIcon(userRole.role);
                  return (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-medium">
                        {userRole.profiles?.full_name || "Non défini"}
                      </TableCell>
                      <TableCell>{userRole.profiles?.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(userRole.role)}
                          className="flex items-center gap-1 w-fit"
                        >
                          <RoleIcon className="h-3 w-3" />
                          {getRoleLabel(userRole.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(userRole.assigned_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {userRole.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(userRole.user_id)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminUsers;