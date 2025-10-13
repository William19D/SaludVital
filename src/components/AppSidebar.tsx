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
  useSidebar,
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
} from 'lucide-react';
import { Button } from './ui/button';

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!isCollapsed && 'Navegación'}
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
                        isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                          : 'hover:bg-accent'
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
