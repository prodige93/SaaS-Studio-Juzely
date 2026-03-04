import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"
import { ReactNode } from "react"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useLanguage } from "@/contexts/LanguageContext"
import { NewProjectModal } from "@/components/forms/NewProjectModal"
import { factories } from "@/data/mockData"
import { Project } from "@/types"

interface LayoutProps {
  children: ReactNode
  onProjectCreated?: (project: Project) => void
}

export default function Layout({ children, onProjectCreated }: LayoutProps) {
  const { t } = useLanguage();
  
  const handleProjectCreated = (project: Project) => {
    if (onProjectCreated) {
      onProjectCreated(project);
    }
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border/60 bg-background/95 backdrop-blur-lg flex items-center justify-between px-6">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
            </div>
            
            <div className="flex items-center gap-3">
              <LanguageSelector />
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}