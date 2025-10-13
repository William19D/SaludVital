import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Stethoscope, Plus, MapPin, Phone, Loader2, Heart, Brain, Eye, Baby, Bone, Scissors, Activity, Zap, Shield, Microscope, Pill } from 'lucide-react';
import { toast } from 'sonner';
import edgeFunctions from '@/lib/edgeFunctions';

interface Doctor {
  id: string;
  personal_info: {
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  professional_info: {
    specialization: string;
    license_number: string;
    years_of_experience: number;
    consultation_fee: number;
    bio?: string;
    education?: string[];
    languages?: string[];
  };
  availability: {
    is_available: boolean;
    rating: number;
    total_reviews: number;
    next_available_slot?: string;
  };
}

interface NuevaCita {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: 'first_visit' | 'follow_up' | 'routine' | 'emergency' | 'telemedicine';
  reason: string;
  especialidad: string;
}

interface Cita {
  id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  appointment_type: string;
  reason: string;
  doctor?: {
    specialization: string;
    profiles: {
      full_name: string;
    };
  };
}

// Lista extensa de especialidades médicas
const especialidadesMedicas = [
  'Medicina General',
  'Medicina Familiar',
  'Medicina Interna',
  'Cardiología',
  'Cardiología Pediátrica',
  'Cirugía General',
  'Cirugía Cardiovascular',
  'Cirugía Plástica y Reconstructiva',
  'Cirugía Pediátrica',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología y Obstetricia',
  'Hematología',
  'Infectología',
  'Medicina de Emergencias',
  'Nefrología',
  'Neumología',
  'Neurología',
  'Neurocirugía',
  'Oftalmología',
  'Oncología',
  'Oncología Pediátrica',
  'Ortopedia y Traumatología',
  'Otorrinolaringología',
  'Pediatría',
  'Psiquiatría',
  'Psicología Clínica',
  'Radiología',
  'Reumatología',
  'Urología',
  'Anestesiología',
  'Medicina del Deporte',
  'Medicina del Trabajo',
  'Geriatría',
  'Nutrición y Dietética',
  'Fisiatría (Rehabilitación)',
  'Medicina Nuclear',
  'Patología',
  'Medicina Preventiva',
  'Inmunología y Alergología'
];

const tiposCita = [
  { value: 'first_visit', label: 'Primera consulta' },
  { value: 'follow_up', label: 'Consulta de seguimiento' },
  { value: 'routine', label: 'Consulta de rutina' },
  { value: 'emergency', label: 'Urgencia' },
  { value: 'telemedicine', label: 'Telemedicina' }
];

const duraciones = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '60 minutos' }
];

// Generar horarios disponibles de 7:00 AM a 6:00 PM cada 15 minutos
const generarHorarios = () => {
  const horarios = [];
  for (let hour = 7; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      horarios.push(timeString);
    }
  }
  return horarios;
};

const horarios = generarHorarios();

// Función para obtener el icono de la especialidad
const getEspecialidadIcon = (especialidad: string) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    'Medicina General': <Stethoscope className="h-4 w-4" />,
    'Medicina Familiar': <User className="h-4 w-4" />,
    'Medicina Interna': <Stethoscope className="h-4 w-4" />,
    'Cardiología': <Heart className="h-4 w-4" />,
    'Cardiología Pediátrica': <Heart className="h-4 w-4" />,
    'Cirugía General': <Scissors className="h-4 w-4" />,
    'Cirugía Cardiovascular': <Scissors className="h-4 w-4" />,
    'Cirugía Plástica y Reconstructiva': <Scissors className="h-4 w-4" />,
    'Cirugía Pediátrica': <Scissors className="h-4 w-4" />,
    'Dermatología': <User className="h-4 w-4" />,
    'Endocrinología': <Pill className="h-4 w-4" />,
    'Gastroenterología': <Stethoscope className="h-4 w-4" />,
    'Ginecología y Obstetricia': <User className="h-4 w-4" />,
    'Hematología': <Activity className="h-4 w-4" />,
    'Infectología': <Shield className="h-4 w-4" />,
    'Medicina de Emergencias': <Zap className="h-4 w-4" />,
    'Nefrología': <Stethoscope className="h-4 w-4" />,
    'Neumología': <Activity className="h-4 w-4" />,
    'Neurología': <Brain className="h-4 w-4" />,
    'Neurocirugía': <Brain className="h-4 w-4" />,
    'Oftalmología': <Eye className="h-4 w-4" />,
    'Oncología': <Shield className="h-4 w-4" />,
    'Oncología Pediátrica': <Shield className="h-4 w-4" />,
    'Ortopedia y Traumatología': <Bone className="h-4 w-4" />,
    'Otorrinolaringología': <Stethoscope className="h-4 w-4" />,
    'Pediatría': <Baby className="h-4 w-4" />,
    'Psiquiatría': <Brain className="h-4 w-4" />,
    'Psicología Clínica': <Brain className="h-4 w-4" />,
    'Radiología': <Microscope className="h-4 w-4" />,
    'Reumatología': <Bone className="h-4 w-4" />,
    'Urología': <Stethoscope className="h-4 w-4" />,
    'Anestesiología': <Pill className="h-4 w-4" />,
    'Medicina del Deporte': <Activity className="h-4 w-4" />,
    'Medicina del Trabajo': <Shield className="h-4 w-4" />,
    'Geriatría': <User className="h-4 w-4" />,
    'Nutrición y Dietética': <Pill className="h-4 w-4" />,
    'Fisiatría (Rehabilitación)': <Activity className="h-4 w-4" />,
    'Medicina Nuclear': <Zap className="h-4 w-4" />,
    'Patología': <Microscope className="h-4 w-4" />,
    'Medicina Preventiva': <Shield className="h-4 w-4" />,
    'Inmunología y Alergología': <Shield className="h-4 w-4" />
  };
  return iconMap[especialidad] || <Stethoscope className="h-4 w-4" />;
};

const Citas = () => {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(false);
  
  const [citas, setCitas] = useState<Cita[]>([]);
  const [citasUsuario, setCitasUsuario] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [especialidades, setEspecialidades] = useState<string[]>([]);

  const [nuevaCita, setNuevaCita] = useState<NuevaCita>({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    appointment_type: 'routine',
    reason: '',
    especialidad: ''
  });

  // Cargar doctores y especialidades
  useEffect(() => {
    cargarDoctores();
    cargarCitasUsuario();
  }, []);

  const cargarCitasUsuario = async () => {
    if (!token) return;
    
    setLoadingCitas(true);
    try {
      console.log('📅 Cargando citas del usuario...');
      
      const response = await edgeFunctions.getUserAppointments({
        upcoming: false, // Obtener todas las citas
        sort_by: 'appointment_date',
        sort_order: 'desc',
        limit: 20
      }, token);
      
      console.log('✅ Citas del usuario:', response);
      setCitasUsuario(response.appointments);
      setEstadisticas(response.statistics);
      
    } catch (error: any) {
      console.error('❌ Error cargando citas:', error);
      toast.error('Error cargando tus citas: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoadingCitas(false);
    }
  };

  const cargarDoctores = async () => {
    setLoadingDoctors(true);
    try {
      const response = await edgeFunctions.getDoctors({
        available_only: true,
        include_next_slot: true
      });
      
      if (response.success && response.data && response.data.doctors) {
        setDoctores(response.data.doctors);
        
        // Extraer especialidades únicas de los doctores
        const especialidadesUnicas = [...new Set(
          response.data.doctors.map((doc: Doctor) => doc.professional_info.specialization)
        )].sort() as string[];
        
        setEspecialidades(especialidadesUnicas);
        
        console.log(`✅ Cargados ${response.data.doctors.length} doctores con ${especialidadesUnicas.length} especialidades`);
        console.log('📊 Estadísticas:', response.data.statistics);
      } else {
        console.warn('⚠️ Error en respuesta de doctores:', response);
        toast.error('Error cargando doctores');
        // Usar especialidades por defecto si hay error
        setEspecialidades(especialidadesMedicas);
      }
    } catch (error: any) {
      console.error('❌ Error cargando doctores:', error);
      toast.error('Error cargando doctores: ' + (error.message || 'Error desconocido'));
      // Usar especialidades por defecto si hay error
      setEspecialidades(especialidadesMedicas);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Filtrar doctores por especialidad
  const doctoresFiltrados = nuevaCita.especialidad 
    ? (doctores || []).filter(doc => doc.professional_info.specialization === nuevaCita.especialidad)
    : (doctores || []);

  const handleCrearCita = async () => {
    // Validaciones
    if (!nuevaCita.doctor_id || !nuevaCita.appointment_date || !nuevaCita.appointment_time || !nuevaCita.reason.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (nuevaCita.reason.trim().length < 10) {
      toast.error('La razón de la cita debe tener al menos 10 caracteres');
      return;
    }

    // Verificar que tengamos un token válido
    if (!token) {
      toast.error('No tienes una sesión activa. Inicia sesión nuevamente.');
      return;
    }

    console.log('🔑 Token a enviar:', token.substring(0, 50) + '...');
    console.log('👤 Usuario actual:', user);

    setLoading(true);
    try {
      const response = await edgeFunctions.createAppointment({
        doctor_id: nuevaCita.doctor_id,
        appointment_date: nuevaCita.appointment_date,
        appointment_time: nuevaCita.appointment_time,
        duration_minutes: nuevaCita.duration_minutes,
        appointment_type: nuevaCita.appointment_type,
        reason: nuevaCita.reason.trim()
      }, token);

      // La nueva Edge Function retorna los datos directamente
      console.log('✅ Respuesta de cita:', response);
      
      // Encontrar el doctor seleccionado para mostrar información completa
      const doctorSeleccionado = doctores.find(doc => doc.id === nuevaCita.doctor_id);
      
      // Formatear fecha y hora para mostrar
      const fechaFormateada = new Date(nuevaCita.appointment_date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Mostrar toast de éxito con información detallada
      toast.success(`¡Cita agendada exitosamente! 🎉`, {
        description: `${doctorSeleccionado?.professional_info.specialization} - Dr. ${response.doctor.name}\n📅 ${fechaFormateada} a las ${nuevaCita.appointment_time}\n⏱️ Duración: ${nuevaCita.duration_minutes} minutos\n💡 ${response.schedule_info.note}`,
        duration: 6000,
      });

      setOpen(false);
      
      // Resetear formulario
      setNuevaCita({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        duration_minutes: 30,
        appointment_type: 'routine',
        reason: '',
        especialidad: ''
      });
      
      // Recargar las citas del usuario
      cargarCitasUsuario();
      
      console.log('📋 Cita creada:', {
        id: response.appointment.id,
        fecha: response.appointment.appointment_date,
        hora: response.appointment.appointment_time,
        doctor: response.doctor.name,
        especialidad: response.doctor.specialization,
        modo: response.schedule_info.mode
      });
      
    } catch (error: any) {
      console.error('❌ Error agendando cita:', error);
      toast.error(error.message || 'Error agendando la cita. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearEstado = (estado: string) => {
    const estados = {
      'scheduled': 'Programada',
      'confirmed': 'Confirmada',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'in_progress': 'En progreso'
    };
    return estados[estado as keyof typeof estados] || estado;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Citas</h1>
            <p className="text-muted-foreground">
              {user?.role === 'paciente' ? 'Agenda y gestiona tus citas médicas' : 'Gestiona las citas médicas'}
            </p>
          </div>
          
          {user?.role === 'paciente' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Cita
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Agendar Nueva Cita
                  </DialogTitle>
                  <DialogDescription>
                    Completa la información para agendar tu cita médica. Todos los campos marcados con * son obligatorios.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  {/* Especialidad */}
                  <div className="grid gap-3">
                    <Label htmlFor="especialidad" className="text-sm font-medium">
                      Especialidad Médica *
                    </Label>
                    <Select 
                      value={nuevaCita.especialidad} 
                      onValueChange={(val) => setNuevaCita({ ...nuevaCita, especialidad: val, doctor_id: '' })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecciona una especialidad médica" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {loadingDoctors ? (
                          <SelectItem value="loading" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cargando especialidades...
                          </SelectItem>
                        ) : especialidades.length > 0 ? (
                          especialidades.map((esp) => (
                            <SelectItem key={esp} value={esp}>
                              <div className="flex items-center gap-3 py-1">
                                {getEspecialidadIcon(esp)}
                                <span className="font-medium">{esp}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          especialidadesMedicas.map((esp) => (
                            <SelectItem key={esp} value={esp}>
                              <div className="flex items-center gap-3 py-1">
                                {getEspecialidadIcon(esp)}
                                <span className="font-medium">{esp}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Doctor */}
                  <div className="grid gap-3">
                    <Label htmlFor="doctor" className="text-sm font-medium">
                      Médico Especialista *
                    </Label>
                    <Select 
                      value={nuevaCita.doctor_id} 
                      onValueChange={(val) => setNuevaCita({ ...nuevaCita, doctor_id: val })}
                      disabled={!nuevaCita.especialidad}
                    >
                      <SelectTrigger className="h-auto min-h-[56px]">
                        <SelectValue placeholder="Selecciona un médico especialista" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {doctoresFiltrados.length === 0 ? (
                          <div className="p-6 text-center">
                            <Stethoscope className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              {nuevaCita.especialidad 
                                ? 'No hay doctores disponibles para esta especialidad' 
                                : 'Primero selecciona una especialidad médica'
                              }
                            </p>
                          </div>
                        ) : (
                          doctoresFiltrados.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id} className="p-0">
                              <div className="w-full p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0">
                                <div className="flex items-start gap-4">
                                  {/* Avatar */}
                                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Stethoscope className="h-7 w-7 text-white" />
                                  </div>
                                  
                                  {/* Doctor info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-base text-gray-900 truncate">
                                        {doctor.personal_info.full_name}
                                      </h4>
                                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                                        <span className="text-yellow-600 text-sm">⭐</span>
                                        <span className="text-yellow-700 text-sm font-medium">
                                          {doctor.availability.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm text-blue-600 font-medium mb-2 flex items-center gap-1">
                                      {getEspecialidadIcon(doctor.professional_info.specialization)}
                                      {doctor.professional_info.specialization}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-2">
                                      <span className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        {doctor.professional_info.years_of_experience} años exp.
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span>💬</span>
                                        {doctor.availability.total_reviews} reseñas
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className="text-base font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                        ${doctor.professional_info.consultation_fee}
                                      </span>
                                      {doctor.availability.next_available_slot && (
                                        <span className="text-sm text-orange-700 bg-orange-100 px-3 py-1 rounded-full flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {new Date(doctor.availability.next_available_slot).toLocaleDateString('es-ES', {
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {nuevaCita.especialidad && doctoresFiltrados.length === 0 && (
                      <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        ⚠️ No se encontraron doctores disponibles para <strong>{nuevaCita.especialidad}</strong>. 
                        Intenta con otra especialidad.
                      </p>
                    )}
                  </div>

                  {/* Tipo de Cita */}
                  <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo de Cita *</Label>
                    <Select 
                      value={nuevaCita.appointment_type} 
                      onValueChange={(val: NuevaCita['appointment_type']) => setNuevaCita({ ...nuevaCita, appointment_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposCita.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duración */}
                  <div className="grid gap-2">
                    <Label htmlFor="duracion">Duración *</Label>
                    <Select 
                      value={nuevaCita.duration_minutes.toString()} 
                      onValueChange={(val) => setNuevaCita({ ...nuevaCita, duration_minutes: parseInt(val) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {duraciones.map((duracion) => (
                          <SelectItem key={duracion.value} value={duracion.value.toString()}>
                            {duracion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fecha */}
                  <div className="grid gap-2">
                    <Label htmlFor="fecha">Fecha de la Cita *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={nuevaCita.appointment_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNuevaCita({ ...nuevaCita, appointment_date: e.target.value })}
                    />
                  </div>

                  {/* Hora */}
                  <div className="grid gap-2">
                    <Label htmlFor="hora">Hora *</Label>
                    <Select 
                      value={nuevaCita.appointment_time} 
                      onValueChange={(val) => setNuevaCita({ ...nuevaCita, appointment_time: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {horarios.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            {hora}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Razón/Motivo */}
                  <div className="grid gap-2">
                    <Label htmlFor="razon">Motivo de la consulta *</Label>
                    <Textarea
                      id="razon"
                      placeholder="Describe brevemente el motivo de tu consulta (mínimo 10 caracteres)"
                      value={nuevaCita.reason}
                      onChange={(e) => setNuevaCita({ ...nuevaCita, reason: e.target.value })}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      {nuevaCita.reason.length}/10 caracteres mínimos
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCrearCita} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Agendar Cita
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Estadísticas de Citas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Citas</p>
                    <p className="text-2xl font-bold">{estadisticas.total_appointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Próximas</p>
                    <p className="text-2xl font-bold">{estadisticas.upcoming_appointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completadas</p>
                    <p className="text-2xl font-bold">{estadisticas.status_breakdown?.completed || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Agendadas</p>
                    <p className="text-2xl font-bold">{estadisticas.status_breakdown?.scheduled || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Citas */}
        <div className="grid gap-4">
          {loadingCitas ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Cargando tus citas...</span>
              </CardContent>
            </Card>
          ) : citasUsuario.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No tienes citas programadas</h3>
                <p className="text-muted-foreground text-center">
                  {user?.role === 'paciente' 
                    ? 'Agenda tu primera cita médica para comenzar'
                    : 'No hay citas registradas en el sistema'
                  }
                </p>
                {user?.role === 'paciente' && (
                  <Button className="mt-4" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agendar Primera Cita
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            citasUsuario.map((cita) => (
              <Card key={cita.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg">
                              Dr. {cita.doctor?.name || 'Doctor no especificado'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              cita.appointment_info.status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                              cita.appointment_info.status.color === 'green' ? 'bg-green-100 text-green-800' :
                              cita.appointment_info.status.color === 'red' ? 'bg-red-100 text-red-800' :
                              cita.appointment_info.status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {cita.appointment_info.status.label}
                            </span>
                          </div>
                          <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                            {getEspecialidadIcon(cita.doctor?.specialization || '')}
                            {cita.doctor?.specialization}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(cita.appointment_info.date).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{cita.appointment_info.time} - {cita.appointment_info.end_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            {cita.appointment_info.type.icon} {cita.appointment_info.type.label}
                          </span>
                          {cita.appointment_info.is_upcoming && (
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                              {cita.appointment_info.time_until}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <p className="text-sm"><strong>Motivo:</strong> {cita.details.reason}</p>
                        {cita.details.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Notas:</strong> {cita.details.notes}
                          </p>
                        )}
                      </div>

                      {cita.doctor && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
                          <div className="flex items-center gap-1">
                            <span>⭐</span>
                            <span>{cita.doctor.rating.toFixed(1)} ({cita.doctor.total_reviews} reseñas)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span>${cita.doctor.consultation_fee}</span>
                          </div>
                          {cita.doctor.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{cita.doctor.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {cita.cancellation && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                          <p className="text-sm text-red-800">
                            <strong>Cancelada:</strong> {cita.cancellation.reason}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Cancelada el {new Date(cita.cancellation.cancelled_at || '').toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Citas;
