import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Stethoscope, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Cita {
  id: string;
  paciente: string;
  medico: string;
  fecha: string;
  hora: string;
  especialidad: string;
  estado: 'programada' | 'completada' | 'cancelada';
}

const Citas = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  // TODO: Cargar citas desde Supabase
  const [citas, setCitas] = useState<Cita[]>([]);

  const [nuevaCita, setNuevaCita] = useState({
    paciente: user?.role === 'paciente' ? user.full_name : '',
    medico: '',
    fecha: '',
    hora: '',
    especialidad: '',
  });

  const handleCrearCita = () => {
    // TODO: Guardar cita en Supabase
    const cita: Cita = {
      id: Date.now().toString(),
      paciente: nuevaCita.paciente,
      medico: nuevaCita.medico,
      fecha: nuevaCita.fecha,
      hora: nuevaCita.hora,
      especialidad: nuevaCita.especialidad,
      estado: 'programada',
    };
    setCitas([...citas, cita]);
    setOpen(false);
    toast.success('Cita agendada exitosamente');
    setNuevaCita({ paciente: user?.role === 'paciente' ? user.full_name : '', medico: '', fecha: '', hora: '', especialidad: '' });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada': return 'bg-primary/10 text-primary';
      case 'completada': return 'bg-success/10 text-success';
      case 'cancelada': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Gestión de Citas</h2>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'admin' ? 'Administra todas las citas del sistema' : 
               user?.role === 'medico' ? 'Tus citas programadas' : 
               'Agenda y gestiona tus citas médicas'}
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agendar Nueva Cita</DialogTitle>
                <DialogDescription>
                  Completa los datos para agendar una nueva cita médica
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {user?.role !== 'paciente' && (
                  <div className="space-y-2">
                    <Label htmlFor="paciente">Paciente</Label>
                    <Input
                      id="paciente"
                      value={nuevaCita.paciente}
                      onChange={(e) => setNuevaCita({ ...nuevaCita, paciente: e.target.value })}
                      placeholder="Nombre del paciente"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="medico">Médico</Label>
                  <Select value={nuevaCita.medico} onValueChange={(val) => setNuevaCita({ ...nuevaCita, medico: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Cargar médicos desde Supabase */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Select value={nuevaCita.especialidad} onValueChange={(val) => setNuevaCita({ ...nuevaCita, especialidad: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: Cargar especialidades desde Supabase */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={nuevaCita.fecha}
                      onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={nuevaCita.hora}
                      onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleCrearCita} className="w-full">
                  Agendar Cita
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {citas.map((cita) => (
            <Card key={cita.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">{cita.especialidad}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Paciente</p>
                          <p className="font-medium">{cita.paciente}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Médico</p>
                          <p className="font-medium">{cita.medico}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha</p>
                          <p className="font-medium">{new Date(cita.fecha).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Hora</p>
                          <p className="font-medium">{cita.hora}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Ver</Button>
                    {cita.estado === 'programada' && (
                      <Button variant="outline" size="sm" className="text-destructive">
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Citas;
