import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  Home,
  Calendar,
  FileText,
  Bell,
  Activity,
  Settings,
  LogOut,
  Users,
  Heart,
} from 'lucide-react';
import { Button } from './ui/button';

export const AppSidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Inicio', url: '/dashboard', icon: Home, roles: ['admin', 'medico', 'paciente'] },
    { title: 'Citas', url: '/dashboard/citas', icon: Calendar, roles: ['admin', 'medico', 'paciente'] },
    { title: 'Resultados', url: '/dashboard/resultados', icon: FileText, roles: ['admin', 'medico', 'paciente'] },
    { title: 'Alertas', url: '/dashboard/alertas', icon: Bell, roles: ['admin', 'medico', 'paciente'] },
    { title: 'Monitoreo', url: '/dashboard/monitoreo', icon: Activity, roles: ['admin'] },
    { title: 'Usuarios', url: '/dashboard/usuarios', icon: Users, roles: ['admin'] },
    { title: 'Configuración', url: '/dashboard/configuracion', icon: Settings, roles: ['admin', 'medico', 'paciente'] },
  ];

  const visibleItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <Sidebar collapsible="icon" className="border-r bg-card">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-black">Salud Vital</span>
            <span className="text-xs text-black">Sistema Médico</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-black px-4 py-2 font-semibold">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'text-black hover:bg-accent'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto border-t">
          <SidebarGroupContent className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
