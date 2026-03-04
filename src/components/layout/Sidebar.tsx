import { useState } from "react"
import { 
  Home, 
  FolderOpen, 
  Building2,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  Bell,
  Search,
  PlusCircle,
  Cog,
  LogOut,
  Users,
  UserCircle
} from "lucide-react"
import { NavLink } from "@/components/NavLink"
import { useLocation } from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { NewProjectModal } from "@/components/forms/NewProjectModal"
import { Project } from "@/types"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const getMainItems = (t: (key: string) => string, isAdmin: boolean) => {
  const items = [
    { title: t("dashboard"), url: "/", icon: Home },
    { title: t("projects"), url: "/projects", icon: FolderOpen },
  ]
  
  // Admin-only items
  if (isAdmin) {
    items.push({ title: "Clients", url: "/clients", icon: UserCircle })
    items.push({ title: "Suivi de Production", url: "/production", icon: ClipboardList })
  }
  
  items.push(
    { title: "Production Sample", url: "/production-sample", icon: Package },
    { title: "Production Bulk", url: "/production-bulk", icon: Cog }
  )
  
  // More admin-only items
  if (isAdmin) {
    items.push(
      { title: t("factories"), url: "/factories", icon: Building2 },
      { title: t("analytics"), url: "/analytics", icon: BarChart3 }
    )
  }
  
  return items
}

const getSettingsItems = (t: (key: string) => string, isAdmin: boolean) => {
  const items = [
    { title: t("settings"), url: "/settings", icon: Settings },
  ]
  
  // Admin-only items
  if (isAdmin) {
    items.push({ title: "Gestion Utilisateurs", url: "/admin/users", icon: Users })
  }
  
  return items
}

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const [searchQuery, setSearchQuery] = useState("")
  const collapsed = state === "collapsed"
  const { t } = useLanguage()
  const { signOut, user } = useAuth()
  const { isAdmin } = useUserRole()
  
  const mainItems = getMainItems(t, isAdmin)
  const settingsItems = getSettingsItems(t, isAdmin)

  const handleProjectCreated = (project: Project) => {
    console.log("Nouveau projet créé:", project)
    // Le projet sera ajouté à la liste via le state management
  }

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex flex-col h-full">
          <div className={collapsed ? "p-2" : "p-4"}>
            <div className="mb-6 flex items-center justify-center">
              {collapsed ? (
                <div className="flex items-center justify-center w-full py-1">
                  <img 
                    src="/logo.png" 
                    alt="LE STUDIO" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
              ) : (
                <img 
                  src="/logo.png" 
                  alt="LE STUDIO" 
                  className="w-40 h-auto object-contain"
                />
              )}
            </div>

            {!collapsed && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="mb-4 flex justify-center">
                <NewProjectModal
                  onProjectCreated={handleProjectCreated}
                  trigger={
                    <Button 
                      variant="hero" 
                      size={collapsed ? "icon" : "default"} 
                      className={collapsed ? "h-10 w-10" : "w-full"}
                    >
                      <PlusCircle className={collapsed ? "h-5 w-5" : "h-4 w-4 mr-2"} />
                      {!collapsed && <span>{t("newProject")}</span>}
                    </Button>
                  }
                />
              </div>
            )}
          </div>

          <div className={collapsed ? "flex-1 overflow-y-auto px-0.5" : "flex-1 overflow-y-auto px-2"}>
            <SidebarGroup>
              {!collapsed && (
                <SidebarGroupLabel>
                  {t("navigation")}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        tooltip={collapsed ? item.title : undefined}
                        className={collapsed ? "justify-start px-1.5" : ""}
                      >
                        <NavLink 
                          to={item.url} 
                          end 
                          className={getNavCls}
                        >
                          <item.icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <div className={collapsed ? "p-0.5 border-t border-border" : "p-2 border-t border-border"}>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        tooltip={collapsed ? item.title : undefined}
                        className={collapsed ? "justify-start px-1.5" : ""}
                      >
                        <NavLink 
                          to={item.url} 
                          className={getNavCls}
                        >
                          <item.icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={signOut} 
                      className={collapsed ? "justify-start px-1.5 hover:bg-destructive/10 hover:text-destructive" : "hover:bg-destructive/10 hover:text-destructive"}
                      tooltip={collapsed ? "Déconnexion" : undefined}
                    >
                      <LogOut className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
                      {!collapsed && <span>Déconnexion</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
              {!collapsed && user && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Connecté</p>
                </div>
              )}
            </SidebarGroup>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}