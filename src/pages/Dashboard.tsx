import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Bell, Activity, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleName = (role: string) => {
    const roles = {
      admin: 'Administrador',
      medico: 'Médico',
      paciente: 'Paciente',
    };
    return roles[role as keyof typeof roles] || role;
  };

  const quickActions = [
    { title: 'Agendar Cita', icon: Calendar, path: '/dashboard/citas', color: 'bg-primary', roles: ['paciente', 'medico'] },
    { title: 'Ver Resultados', icon: FileText, path: '/dashboard/resultados', color: 'bg-accent', roles: ['paciente', 'medico'] },
    { title: 'Alertas', icon: Bell, path: '/dashboard/alertas', color: 'bg-warning', roles: ['admin', 'medico', 'paciente'] },
    { title: 'Gestionar Usuarios', icon: Users, path: '/dashboard/usuarios', color: 'bg-primary', roles: ['admin'] },
  ];

  const visibleActions = quickActions.filter(action => 
    user && action.roles.includes(user.role)
  );

  const stats = user?.role === 'admin' 
    ? [
        { label: 'Usuarios Activos', value: '248', change: '+12%' },
        { label: 'Citas Hoy', value: '34', change: '+5%' },
        { label: 'Médicos', value: '18', change: '0%' },
        { label: 'Alertas Pendientes', value: '7', change: '-3%' },
      ]
    : user?.role === 'medico'
    ? [
        { label: 'Citas Hoy', value: '8', change: '+2' },
        { label: 'Pacientes', value: '45', change: '+3' },
        { label: 'Resultados Pendientes', value: '5', change: '-1' },
      ]
    : [
        { label: 'Próxima Cita', value: 'Mañana', change: '10:00 AM' },
        { label: 'Resultados Nuevos', value: '2', change: 'Ver' },
        { label: 'Alertas', value: '1', change: 'Revisar' },
      ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Bienvenido, {user?.name}
          </h2>
          <p className="text-muted-foreground mt-1">
            Rol: {getRoleName(user?.role || '')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Accesos Rápidos</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleActions.map((action, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(action.path)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between">
                    Acceder
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {user?.role === 'paciente' && (
          <Card>
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
              <CardDescription>Tus citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Dr. García - Cardiología</p>
                    <p className="text-sm text-muted-foreground">Mañana, 10:00 AM</p>
                  </div>
                  <Button size="sm">Ver Detalles</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Dr. López - Medicina General</p>
                    <p className="text-sm text-muted-foreground">15 May, 3:00 PM</p>
                  </div>
                  <Button size="sm">Ver Detalles</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
