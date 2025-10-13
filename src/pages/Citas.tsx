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
import { Calendar, Clock, User, Stethoscope, Plus, MapPin, Phone, Loader2, Heart, Brain, Eye, Baby, Bone, Scissors, Activity, Zap, Shield, Microscope, Pill, Edit3, X } from 'lucide-react';
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
  
  // Estados para gestión de citas
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  
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

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      toast.error('Por favor proporciona una razón para la cancelación');
      return;
    }

    if (cancelReason.trim().length < 5) {
      toast.error('La razón de cancelación debe tener al menos 5 caracteres');
      return;
    }

    setLoading(true);
    try {
      console.log('🚫 Cancelando cita:', selectedAppointment.id);
      
      const response = await edgeFunctions.cancelAppointment({
        appointment_id: selectedAppointment.id,
        cancellation_reason: cancelReason.trim()
      }, token || '');

      toast.success('¡Cita cancelada exitosamente! 📅', {
        description: `La cita del ${new Date(response.appointment.appointment_date + 'T00:00:00').toLocaleDateString('es-ES')} a las ${response.appointment.appointment_time.substring(0, 5)} ha sido cancelada.`,
        duration: 5000,
      });

      // Cerrar diálogo y limpiar estado
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      setCancelReason('');
      
      // Recargar las citas
      cargarCitasUsuario();
      
    } catch (error: any) {
      console.error('❌ Error cancelando cita:', error);
      toast.error(error.message || 'Error cancelando la cita. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      toast.error('Por favor completa la nueva fecha y hora');
      return;
    }

    if (rescheduleReason && rescheduleReason.trim().length < 5) {
      toast.error('La razón de reagendamiento debe tener al menos 5 caracteres');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Reagendando cita:', selectedAppointment.id);
      
      const response = await edgeFunctions.rescheduleAppointment({
        appointment_id: selectedAppointment.id,
        new_appointment_date: newDate,
        new_appointment_time: newTime,
        new_duration_minutes: newDuration !== selectedAppointment.appointment_info.duration_minutes ? newDuration : undefined,
        reschedule_reason: rescheduleReason.trim() || undefined
      }, token || '');

      const fechaAnterior = new Date(response.changes.previous.date + 'T00:00:00').toLocaleDateString('es-ES');
      const fechaNueva = new Date(response.changes.new.date + 'T00:00:00').toLocaleDateString('es-ES');

      toast.success('¡Cita reagendada exitosamente! 🔄', {
        description: `Cambiada de ${fechaAnterior} ${response.changes.previous.time.substring(0, 5)} a ${fechaNueva} ${response.changes.new.time.substring(0, 5)}`,
        duration: 5000,
      });

      // Cerrar diálogo y limpiar estado
      setRescheduleDialogOpen(false);
      setSelectedAppointment(null);
      setRescheduleReason('');
      setNewDate('');
      setNewTime('');
      setNewDuration(30);
      
      // Recargar las citas
      cargarCitasUsuario();
      
    } catch (error: any) {
      console.error('❌ Error reagendando cita:', error);
      toast.error(error.message || 'Error reagendando la cita. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const openCancelDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const openRescheduleDialog = (appointment: any) => {
    setSelectedAppointment(appointment);
    setRescheduleReason('');
    setNewDate(appointment.appointment_info.date);
    setNewTime(appointment.appointment_info.time.substring(0, 5)); // Convertir de "HH:MM:SS" a "HH:MM"
    setNewDuration(appointment.appointment_info.duration_minutes);
    setRescheduleDialogOpen(true);
  };

  const canModifyAppointment = (appointment: any) => {
    const isUpcoming = appointment.appointment_info.is_upcoming;
    const status = appointment.appointment_info.status.value;
    return isUpcoming && (status === 'scheduled' || status === 'confirmed');
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
      toast.success(`¡Cita agendada exitosamente!`, {
        description: `${doctorSeleccionado?.professional_info.specialization} - Dr. ${response.doctor.name}\nFecha: ${fechaFormateada} a las ${nuevaCita.appointment_time}\nDuración: ${nuevaCita.duration_minutes} minutos\nNota: ${response.schedule_info.note}`,
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
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-blue-600">
              Gestión de Citas
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              {user?.role === 'paciente' 
                ? 'Agenda y gestiona tus citas médicas de forma rápida y sencilla' 
                : 'Gestiona las citas médicas del sistema de forma eficiente'
              }
            </p>
          </div>
          
          {user?.role === 'paciente' && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-lg font-semibold rounded-xl">
                  <Plus className="mr-3 h-6 w-6" />
                  Agendar Nueva Cita
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="border-b border-blue-100 pb-4">
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    Agendar Nueva Cita
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 mt-2">
                    Completa la información para agendar tu cita médica. Todos los campos marcados con * son obligatorios.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-8 py-6">
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
                            <SelectItem 
                              key={doctor.id} 
                              value={doctor.id} 
                              className="p-0 hover:bg-blue-50/50 transition-all duration-200 ease-in-out focus:bg-blue-50/50 data-[highlighted]:bg-blue-50/50"
                            >
                              <div className="w-full p-3 border-b border-gray-100/50 last:border-b-0 rounded-md">
                                <div className="flex items-center gap-3">
                                  {/* Avatar - más pequeño */}
                                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Stethoscope className="h-5 w-5 text-white" />
                                  </div>
                                  
                                  {/* Doctor info - más compacto */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                                        Dr. {doctor.personal_info.full_name}
                                      </h4>
                                      <div className="flex items-center gap-1 bg-yellow-100 px-1.5 py-0.5 rounded-full">
                                        <User className="h-2.5 w-2.5 text-yellow-600" />
                                        <span className="text-yellow-700 text-xs font-medium">
                                          {doctor.availability.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-xs text-blue-600 font-medium mb-1.5 flex items-center gap-1">
                                      {getEspecialidadIcon(doctor.professional_info.specialization)}
                                      {doctor.professional_info.specialization}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 text-xs text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {doctor.professional_info.years_of_experience} años
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          {doctor.availability.total_reviews} reseñas
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                          ${doctor.professional_info.consultation_fee.toLocaleString()}
                                        </span>
                                        {doctor.availability.next_available_slot && (
                                          <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Calendar className="h-2.5 w-2.5" />
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
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {nuevaCita.especialidad && doctoresFiltrados.length === 0 && (
                      <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        No se encontraron doctores disponibles para <strong>{nuevaCita.especialidad}</strong>. 
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

        {/* Estadísticas de Citas Mejoradas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Total de Citas</p>
                      <p className="text-3xl font-bold text-blue-900">{estadisticas.total_appointments}</p>
                    </div>
                  </div>
                  <div className="w-2 h-12 bg-blue-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">Próximas</p>
                      <p className="text-3xl font-bold text-green-900">{estadisticas.upcoming_appointments}</p>
                    </div>
                  </div>
                  <div className="w-2 h-12 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">Completadas</p>
                      <p className="text-3xl font-bold text-purple-900">{estadisticas.status_breakdown?.completed || 0}</p>
                    </div>
                  </div>
                  <div className="w-2 h-12 bg-purple-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Activity className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Agendadas</p>
                      <p className="text-3xl font-bold text-orange-900">{estadisticas.status_breakdown?.scheduled || 0}</p>
                    </div>
                  </div>
                  <div className="w-2 h-12 bg-orange-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Citas Mejorada */}
        <div className="space-y-6">
          {loadingCitas ? (
            <Card className="border-0 shadow-lg bg-blue-50">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Cargando tus citas...</h3>
                  <p className="text-gray-500">Un momento por favor mientras obtenemos tu información</p>
                </div>
              </CardContent>
            </Card>
          ) : citasUsuario.length === 0 ? (
            <Card className="border-0 shadow-lg bg-gray-50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No tienes citas programadas</h3>
                <p className="text-gray-600 text-center text-lg mb-8 max-w-md">
                  {user?.role === 'paciente' 
                    ? 'Es el momento perfecto para agendar tu primera cita médica y cuidar de tu salud'
                    : 'No hay citas registradas en el sistema actualmente'
                  }
                </p>
                {user?.role === 'paciente' && (
                  <Button 
                    onClick={() => setOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    Agendar Mi Primera Cita
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            citasUsuario.map((cita) => (
              <Card key={cita.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Barra lateral de color según estado */}
                    <div className={`w-2 ${
                      cita.appointment_info.status.color === 'blue' ? 'bg-gradient-to-b from-blue-400 to-blue-600' :
                      cita.appointment_info.status.color === 'green' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                      cita.appointment_info.status.color === 'red' ? 'bg-gradient-to-b from-red-400 to-red-600' :
                      cita.appointment_info.status.color === 'yellow' ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' :
                      'bg-gradient-to-b from-gray-400 to-gray-600'
                    }`}></div>

                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4 flex-1">
                          {/* Header con doctor y estado */}
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <Stethoscope className="h-8 w-8 text-white" />
                              </div>
                              {/* Badge de estado sobre el avatar */}
                              <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold shadow-md ${
                                cita.appointment_info.status.color === 'blue' ? 'bg-blue-500 text-white' :
                                cita.appointment_info.status.color === 'green' ? 'bg-green-500 text-white' :
                                cita.appointment_info.status.color === 'red' ? 'bg-red-500 text-white' :
                                cita.appointment_info.status.color === 'yellow' ? 'bg-yellow-500 text-white' :
                                'bg-gray-500 text-white'
                              }`}>
                                {cita.appointment_info.status.label}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Dr. {cita.doctor?.name || 'Doctor no especificado'}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                                  {getEspecialidadIcon(cita.doctor?.specialization || '')}
                                  <span className="text-blue-800 text-sm font-semibold">
                                    {cita.doctor?.specialization}
                                  </span>
                                </div>
                                {cita.appointment_info.is_upcoming && (
                                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-1 rounded-full">
                                    <span className="text-xs font-bold">{cita.appointment_info.time_until}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Información de fecha y hora con mejor diseño */}
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                  <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Fecha</p>
                                  <p className="font-bold text-gray-900">
                                    {new Date(cita.appointment_info.date + 'T00:00:00').toLocaleDateString('es-ES', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                  <Clock className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Horario</p>
                                  <p className="font-bold text-gray-900">
                                    {cita.appointment_info.time.substring(0, 5)} - {cita.appointment_info.end_time}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                  <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tipo</p>
                                  <p className="font-bold text-gray-900">{cita.appointment_info.type.label}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Motivo de la cita */}
                          <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1 font-medium">Motivo de consulta:</p>
                            <p className="text-gray-900 font-medium">{cita.details.reason}</p>
                            {cita.details.notes && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-1 font-medium">Notas:</p>
                                <p className="text-sm text-gray-700">{cita.details.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Información del doctor */}
                          {cita.doctor && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <User className="h-5 w-5 text-yellow-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Calificación</p>
                                    <p className="font-bold text-gray-900">
                                      {cita.doctor.rating.toFixed(1)} ({cita.doctor.total_reviews} reseñas)
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Pill className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Consulta</p>
                                    <p className="font-bold text-green-600">${cita.doctor.consultation_fee.toLocaleString()}</p>
                                  </div>
                                </div>

                                {cita.doctor.phone && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <Phone className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 font-medium">Contacto</p>
                                      <p className="font-medium text-gray-900">{cita.doctor.phone}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Información de cancelación */}
                          {cita.cancellation && (
                            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <X className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-red-800 mb-1">Cita Cancelada</p>
                                  <p className="text-sm text-red-700 mb-2"><strong>Motivo:</strong> {cita.cancellation.reason}</p>
                                  <p className="text-xs text-red-600">
                                    Cancelada el {new Date(cita.cancellation.cancelled_at || '').toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Botones de acción mejorados */}
                          {user?.role === 'paciente' && canModifyAppointment(cita) && (
                            <div className="flex gap-3 pt-2">
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => openRescheduleDialog(cita)}
                                className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 font-semibold transition-all duration-300"
                              >
                                <Edit3 className="h-5 w-5 mr-2" />
                                Reagendar Cita
                              </Button>
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => openCancelDialog(cita)}
                                className="flex-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 font-semibold transition-all duration-300"
                              >
                                <X className="h-5 w-5 mr-2" />
                                Cancelar Cita
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Diálogo de Cancelación */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <X className="h-5 w-5" />
                Cancelar Cita
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Detalles de la cita:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctor?.name}</p>
                    <p><strong>Fecha:</strong> {new Date(selectedAppointment.appointment_info.date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p><strong>Hora:</strong> {selectedAppointment.appointment_info.time.substring(0, 5)} - {selectedAppointment.appointment_info.end_time}</p>
                    <p><strong>Especialidad:</strong> {selectedAppointment.doctor?.specialization}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">Razón de la cancelación *</Label>
                  <Textarea
                    id="cancel-reason"
                    placeholder="Explica brevemente por qué cancelas la cita (mínimo 5 caracteres)"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {cancelReason.length}/5 caracteres mínimos
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={loading}>
                    No, mantener cita
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelAppointment} 
                    disabled={loading || cancelReason.trim().length < 5}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sí, cancelar cita
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de Reagendamiento */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-600">
                <Edit3 className="h-5 w-5" />
                Reagendar Cita
              </DialogTitle>
              <DialogDescription>
                Selecciona la nueva fecha y hora para tu cita médica.
              </DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cita actual:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Doctor:</strong> Dr. {selectedAppointment.doctor?.name}</p>
                    <p><strong>Fecha actual:</strong> {new Date(selectedAppointment.appointment_info.date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p><strong>Hora actual:</strong> {selectedAppointment.appointment_info.time.substring(0, 5)} - {selectedAppointment.appointment_info.end_time}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-date">Nueva Fecha *</Label>
                    <Input
                      id="new-date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-time">Nueva Hora *</Label>
                    <Select value={newTime} onValueChange={setNewTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona hora" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-duration">Duración (minutos)</Label>
                  <Select value={newDuration.toString()} onValueChange={(val) => setNewDuration(parseInt(val))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                      <SelectItem value="120">120 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reschedule-reason">Razón del reagendamiento (opcional)</Label>
                  <Textarea
                    id="reschedule-reason"
                    placeholder="Explica brevemente por qué reagendas la cita"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleRescheduleAppointment} 
                    disabled={loading || !newDate || !newTime}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reagendar Cita
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Citas;
