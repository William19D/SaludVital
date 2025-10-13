import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, FileText, Activity, X } from 'lucide-react';

interface Alerta {
  id: string;
  tipo: 'cita' | 'resultado' | 'medicamento' | 'general';
  titulo: string;
  mensaje: string;
  fecha: string;
  prioridad: 'alta' | 'media' | 'baja';
  leida: boolean;
}

const Alertas = () => {
  const alertas: Alerta[] = [
    { id: '1', tipo: 'cita', titulo: 'Cita Próxima', mensaje: 'Tienes una cita mañana a las 10:00 AM con Dr. García', fecha: '2025-10-13', prioridad: 'alta', leida: false },
    { id: '2', tipo: 'resultado', titulo: 'Resultados Disponibles', mensaje: 'Tus resultados de análisis de sangre están listos', fecha: '2025-10-12', prioridad: 'media', leida: false },
    { id: '3', tipo: 'medicamento', titulo: 'Recordatorio de Medicación', mensaje: 'No olvides tomar tu medicación de las 8:00 PM', fecha: '2025-10-13', prioridad: 'alta', leida: false },
    { id: '4', tipo: 'general', titulo: 'Actualización del Sistema', mensaje: 'Nuevas funcionalidades disponibles en la plataforma', fecha: '2025-10-11', prioridad: 'baja', leida: true },
  ];

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'cita': return Calendar;
      case 'resultado': return FileText;
      case 'medicamento': return Activity;
      default: return Bell;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-destructive/10 text-destructive';
      case 'media': return 'bg-warning/10 text-warning';
      case 'baja': return 'bg-primary/10 text-primary';
      default: return 'bg-muted';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Alertas y Notificaciones</h2>
            <p className="text-muted-foreground mt-1">
              Mantente al día con tus recordatorios importantes
            </p>
          </div>
          <Button variant="outline">Marcar todas como leídas</Button>
        </div>

        <div className="grid gap-3">
          {alertas.map((alerta) => {
            const Icono = getIcono(alerta.tipo);
            return (
              <Card key={alerta.id} className={`${!alerta.leida ? 'border-l-4 border-l-primary' : ''} hover:shadow-md transition-shadow`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPrioridadColor(alerta.prioridad)}`}>
                      <Icono className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{alerta.titulo}</h3>
                        {!alerta.leida && <Badge variant="secondary" className="text-xs">Nueva</Badge>}
                        <Badge variant="outline" className="text-xs capitalize">
                          {alerta.prioridad}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alerta.mensaje}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alerta.fecha).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {alertas.filter(a => !a.leida).length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No hay alertas nuevas</p>
              <p className="text-sm text-muted-foreground">
                Todas tus notificaciones están al día
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alertas;
