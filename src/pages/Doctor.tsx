import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Users, Clock, Activity, Stethoscope, FileText, Phone, Mail, MapPin, AlertCircle, User, Heart, CheckCircle, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import edgeFunctions, { DoctorAppointment, DoctorAppointmentsResponse, CompleteAppointmentParams } from '@/lib/edgeFunctions';

const Doctor = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  // Estados para completar cita
  const [isCompletingAppointment, setIsCompletingAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointment | null>(null);
  const [completionData, setCompletionData] = useState({
    medical_notes: '',
    follow_up_required: ''
  });
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  // Obtener token del localStorage
  const getToken = () => {
    const tokens = localStorage.getItem('saludvital_tokens');
    if (tokens) {
      const tokensObj = JSON.parse(tokens);
      return tokensObj.access_token;
    }
    return null;
  };

  // Cargar citas del doctor
  const loadDoctorAppointments = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Obtener citas con filtros
      const filters: any = { limit: 50, sort: 'appointment_date', order: 'ASC' };
      
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'today') {
          filters.date = new Date().toISOString().split('T')[0];
        } else {
          filters.status = selectedFilter;
        }
      }

      const response = await edgeFunctions.getDoctorAppointments(token, filters);
      
      if (response.success) {
        setAppointments(response.data.appointments);
        setStatistics(response.data.statistics);
        console.log('✅ Citas cargadas:', response.data.appointments.length);
      } else {
        throw new Error('Error obteniendo las citas');
      }
    } catch (error) {
      console.error('❌ Error cargando citas:', error);
      toast.error('Error al cargar las citas del doctor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'medico') {
      loadDoctorAppointments();
    }
  }, [user, selectedFilter]);

  // Función para obtener color del badge según el estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener color del tipo de cita
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'first_visit': return 'bg-indigo-100 text-indigo-800';
      case 'follow_up': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'routine': return 'bg-green-100 text-green-800';
      case 'telemedicine': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para abrir el dialog de completar cita
  const handleCompleteAppointment = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setCompletionData({
      medical_notes: '',
      follow_up_required: ''
    });
    setIsCompleteDialogOpen(true);
  };

  // Función para completar la cita
  const completeAppointment = async () => {
    if (!selectedAppointment) return;

    // Validaciones
    if (!completionData.medical_notes.trim()) {
      toast.error('Las notas médicas son requeridas');
      return;
    }

    if (completionData.medical_notes.trim().length < 10) {
      toast.error('Las notas médicas deben tener al menos 10 caracteres');
      return;
    }

    setIsCompletingAppointment(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const params: CompleteAppointmentParams = {
        appointment_id: selectedAppointment.appointment_id,
        medical_notes: completionData.medical_notes.trim(),
        ...(completionData.follow_up_required.trim() && {
          follow_up_required: completionData.follow_up_required.trim()
        })
      };

      const response = await edgeFunctions.completeAppointment(token, params);
      
      if (response.success) {
        toast.success('Cita completada exitosamente. Se ha enviado confirmación al paciente.');
        
        // Actualizar la lista de citas
        await loadDoctorAppointments();
        
        // Cerrar el dialog
        setIsCompleteDialogOpen(false);
        setSelectedAppointment(null);
        setCompletionData({
          medical_notes: '',
          follow_up_required: ''
        });
      } else {
        throw new Error('Error completando la cita');
      }
    } catch (error) {
      console.error('❌ Error completando cita:', error);
      toast.error(error instanceof Error ? error.message : 'Error al completar la cita');
    } finally {
      setIsCompletingAppointment(false);
    }
  };

  // Función para verificar si una cita se puede completar
  const canCompleteAppointment = (appointment: DoctorAppointment) => {
    return ['scheduled', 'confirmed', 'in_progress'].includes(appointment.status);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-600">
              Panel Médico
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Bienvenido Dr. {user?.full_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {statistics && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-blue-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Citas Hoy
                </CardTitle>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{statistics.today_appointments}</div>
                <p className="text-xs text-blue-600 mt-1">
                  Programadas para hoy
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  Próximas Citas
                </CardTitle>
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{statistics.upcoming_appointments}</div>
                <p className="text-xs text-green-600 mt-1">
                  Confirmadas y programadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Completadas
                </CardTitle>
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{statistics.completed_appointments}</div>
                <p className="text-xs text-purple-600 mt-1">
                  Consultas finalizadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">
                  Total Citas
                </CardTitle>
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{statistics.total_appointments}</div>
                <p className="text-xs text-orange-600 mt-1">
                  Todas las citas
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={selectedFilter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('today')}
          >
            Hoy
          </Button>
          <Button
            variant={selectedFilter === 'scheduled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('scheduled')}
          >
            Programadas
          </Button>
          <Button
            variant={selectedFilter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('confirmed')}
          >
            Confirmadas
          </Button>
          <Button
            variant={selectedFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('completed')}
          >
            Completadas
          </Button>
        </div>

        {/* Lista de Citas */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              Citas del Doctor
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Cargando citas...' : `${appointments.length} citas encontradas`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron citas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.appointment_id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Información básica de la cita */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-blue-600" />
                          {appointment.date} - {appointment.time}
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusBadgeColor(appointment.status)}>
                            {appointment.status_label}
                          </Badge>
                          <Badge className={getTypeBadgeColor(appointment.appointment_type)}>
                            {appointment.appointment_type_label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Duración: {appointment.duration_minutes} min
                        </p>
                      </div>

                      {/* Información del paciente */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{appointment.patient.full_name}</span>
                          {appointment.patient.age && (
                            <span className="text-sm text-gray-500">({appointment.patient.age} años)</span>
                          )}
                        </div>
                        {appointment.patient.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            {appointment.patient.email}
                          </div>
                        )}
                        {appointment.patient.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {appointment.patient.phone}
                          </div>
                        )}
                        {appointment.patient.blood_type && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <Heart className="h-3 w-3" />
                            Tipo: {appointment.patient.blood_type}
                          </div>
                        )}
                      </div>

                      {/* Motivo y notas */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Motivo:</p>
                          <p className="text-sm text-gray-600">{appointment.reason}</p>
                        </div>
                        {appointment.notes && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Notas:</p>
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          </div>
                        )}
                        {appointment.patient.allergies?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-700 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Alergias:
                            </p>
                            <p className="text-sm text-red-600">
                              {appointment.patient.allergies.join(', ')}
                            </p>
                          </div>
                        )}
                        
                        {/* Acciones */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          {canCompleteAppointment(appointment) ? (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completar Cita
                            </Button>
                          ) : appointment.status === 'completed' ? (
                            <Badge className="bg-green-100 text-green-800">
                              ✅ Completada
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-600">
                              {appointment.status_label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notice si no es doctor */}
        {user?.role !== 'medico' && (
          <Card className="border-0 shadow-lg bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                    Acceso Restringido
                  </h3>
                  <p className="text-yellow-700">
                    Esta interfaz está destinada solo para médicos registrados en el sistema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para completar cita */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              Completar Cita Médica
            </DialogTitle>
            <DialogDescription>
              Complete la consulta agregando las notas médicas y recomendaciones para el paciente.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Información de la cita */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Información de la Cita</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Paciente:</span>
                    <p className="text-blue-900">{selectedAppointment.patient.full_name}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Fecha:</span>
                    <p className="text-blue-900">{selectedAppointment.date} - {selectedAppointment.time}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Tipo:</span>
                    <p className="text-blue-900">{selectedAppointment.appointment_type_label}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Duración:</span>
                    <p className="text-blue-900">{selectedAppointment.duration_minutes} min</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-700 font-medium">Motivo:</span>
                    <p className="text-blue-900">{selectedAppointment.reason}</p>
                  </div>
                </div>
              </div>

              {/* Alertas médicas */}
              {selectedAppointment.patient.allergies?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Alergias del Paciente
                  </h4>
                  <p className="text-red-800 text-sm">
                    {selectedAppointment.patient.allergies.join(', ')}
                  </p>
                </div>
              )}

              {/* Notas médicas */}
              <div className="space-y-3">
                <Label htmlFor="medical_notes" className="text-base font-semibold">
                  Notas Médicas de la Consulta *
                </Label>
                <Textarea
                  id="medical_notes"
                  placeholder="Escriba aquí las notas médicas, diagnósticos, observaciones y recomendaciones de la consulta..."
                  value={completionData.medical_notes}
                  onChange={(e) => setCompletionData({ ...completionData, medical_notes: e.target.value })}
                  className="min-h-[120px] resize-none"
                  disabled={isCompletingAppointment}
                />
                <p className="text-xs text-gray-500">
                  Mínimo 10 caracteres. Estas notas serán enviadas al paciente por email.
                </p>
              </div>

              {/* Seguimiento requerido */}
              <div className="space-y-3">
                <Label htmlFor="follow_up" className="text-base font-semibold">
                  Seguimiento Requerido (Opcional)
                </Label>
                <Input
                  id="follow_up"
                  placeholder="Ej: Control en 2 semanas, exámenes de laboratorio, cita con especialista..."
                  value={completionData.follow_up_required}
                  onChange={(e) => setCompletionData({ ...completionData, follow_up_required: e.target.value })}
                  disabled={isCompletingAppointment}
                />
                <p className="text-xs text-gray-500">
                  Opcional. Especifique si el paciente requiere seguimiento médico.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCompleteDialogOpen(false)}
                  disabled={isCompletingAppointment}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={completeAppointment}
                  disabled={isCompletingAppointment || !completionData.medical_notes.trim() || completionData.medical_notes.trim().length < 10}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isCompletingAppointment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completar Cita
                    </>
                  )}
                </Button>
              </div>

              {/* Información adicional */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-1">
                  📧 Notificación Automática
                </h4>
                <p className="text-yellow-800 text-sm">
                  Al completar la cita, se enviará automáticamente un email al paciente con 
                  las notas médicas y las recomendaciones de seguimiento.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Doctor;