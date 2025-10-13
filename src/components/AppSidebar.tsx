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
  Calendar,
  LogOut,
  Heart,
} from 'lucide-react';
import { Button } from './ui/button';

export const AppSidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    // { title: 'Inicio', url: '/dashboard', icon: Home, roles: ['admin', 'medico', 'paciente'] },
    { title: 'Citas', url: '/dashboard/citas', icon: Calendar, roles: ['admin', 'medico', 'paciente'] },
    // { title: 'Resultados', url: '/dashboard/resultados', icon: FileText, roles: ['admin', 'medico', 'paciente'] },
    // { title: 'Alertas', url: '/dashboard/alertas', icon: Bell, roles: ['admin', 'medico', 'paciente'] },
    // { title: 'Monitoreo', url: '/dashboard/monitoreo', icon: Activity, roles: ['admin'] },
    // { title: 'Usuarios', url: '/dashboard/usuarios', icon: Users, roles: ['admin'] },
    // { title: 'Configuración', url: '/dashboard/configuracion', icon: Settings, roles: ['admin', 'medico', 'paciente'] },
  ];

  const visibleItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <Sidebar collapsible="offcanvas" className="border-r" style={{ backgroundColor: '#d3def3' }}>
      <SidebarHeader className="border-b border-gray-300 p-4" style={{ backgroundColor: '#d3def3' }}>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold" style={{ color: '#454545' }}>Salud Vital</span>
            <span className="text-xs" style={{ color: '#454545', opacity: 0.7 }}>Sistema Médico</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent style={{ backgroundColor: '#d3def3' }}>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 font-semibold" style={{ color: '#454545' }}>
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
                            : 'hover:bg-black/10'
                        }`
                      }
                      style={{
                        color: '#454545 !important'
                      }}
                    >
                      <item.icon className="h-5 w-5 shrink-0" style={{ color: '#454545' }} />
                      <span style={{ color: '#454545' }}>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto border-t border-gray-300">
          <SidebarGroupContent className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-red-100"
              style={{ color: '#dc2626' }}
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
