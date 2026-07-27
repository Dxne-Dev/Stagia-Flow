import * as React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  Upload,
  Settings,
  LogOut,
  ChevronDown,
  Briefcase,
  FileText,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  title: string
  url: string
  icon: React.ElementType
}

const managerNav: NavItem[] = [
  { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Organisation', url: '/organization', icon: Building2 },
  { title: 'Stagiaires', url: '/stagiaires', icon: Users },
  { title: 'Sessions', url: '/sessions', icon: FolderKanban },
  { title: 'Projets', url: '/projects', icon: FolderKanban },
  { title: 'Livrables', url: '/deliverables', icon: FileText },
]

const stagiaireNav: NavItem[] = [
  { title: 'Mon Brief', url: '/my-brief', icon: Briefcase },
  { title: 'Mes Livrables', url: '/my-deliverables', icon: Upload },
]

function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isStagiaire = profile?.role === 'stagiaire'
  const navItems = isStagiaire ? stagiaireNav : managerNav

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-xs">SP</span>
            </div>
            <span className="font-semibold text-sm">StagePilot</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              {isStagiaire ? 'Espace Stagiaire' : 'Navigation'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <NavLink to={item.url}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive}>
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">
                        {getInitials(profile?.full_name ?? user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 text-left min-w-0 flex-1">
                      <span className="text-sm font-medium truncate leading-none">
                        {profile?.full_name ?? user?.email?.split('@')[0]}
                      </span>
                      <span className="text-xs text-muted-foreground truncate leading-none capitalize">
                        {profile?.role ?? 'utilisateur'}
                      </span>
                    </div>
                    <ChevronDown className="size-4 ml-auto shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-52">
                  <DropdownMenuItem asChild>
                    <NavLink to="/settings">
                      <Settings className="size-4" />
                      Paramètres
                    </NavLink>
                  </DropdownMenuItem>
                  <Separator className="my-1" />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">{user?.email}</span>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
