import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// ============================================
// JWT UTILITIES (inline para validar token)
// ============================================
const JWT_SECRET = Deno.env.get('JWT_SECRET') || '';

async function getKey() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  return await crypto.subtle.importKey("raw", keyData, {
    name: "HMAC",
    hash: "SHA-256"
  }, true, [
    "sign",
    "verify"
  ]);
}

async function verifyAccessToken(token) {
  try {
    const key = await getKey();
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      return null;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(`${header}.${payload}`);
    const signatureData = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), (c)=>c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signatureData, data);
    if (!isValid) return null;
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null;
    }
    return decodedPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// ============================================
// UTILIDADES DE VALIDACIÓN
// ============================================
function isValidTime(time) {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

function isValidDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const parsedDate = new Date(date + 'T00:00:00Z');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsedDate >= today; // No permitir fechas pasadas
}

function isBusinessHours(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  // Horarios de negocio: 7:00 AM a 6:00 PM
  const startTime = 7 * 60; // 7:00 AM
  const endTime = 18 * 60; // 6:00 PM
  return timeInMinutes >= startTime && timeInMinutes <= endTime;
}

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

// ============================================
// MAIN HANDLER
// ============================================
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    console.log('🏥 [APPOINTMENT] Iniciando creación de cita...');

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token de acceso requerido');
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyAccessToken(token);
    if (!payload) {
      throw new Error('Token inválido o expirado');
    }

    // Solo pacientes pueden agendar citas
    if (payload.role !== 'patient') {
      throw new Error('Solo los pacientes pueden agendar citas');
    }

    console.log(`👤 [APPOINTMENT] Paciente: ${payload.user_id} (${payload.email})`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      doctor_id, 
      appointment_date, 
      appointment_time, 
      duration_minutes = 30, 
      appointment_type = 'routine', 
      reason 
    } = await req.json();

    console.log(`📅 [APPOINTMENT] Datos: doctor=${doctor_id}, fecha=${appointment_date}, hora=${appointment_time}`);

    // ============================================
    // VALIDACIONES DE ENTRADA
    // ============================================
    if (!doctor_id || !appointment_date || !appointment_time || !reason) {
      throw new Error('Faltan campos requeridos: doctor_id, appointment_date, appointment_time, reason');
    }

    if (!isValidDate(appointment_date)) {
      throw new Error('Fecha inválida o en el pasado');
    }

    if (!isValidTime(appointment_time)) {
      throw new Error('Hora inválida. Formato: HH:MM');
    }

    if (!isBusinessHours(appointment_time)) {
      throw new Error('La cita debe ser entre 7:00 AM y 6:00 PM');
    }

    if (![15, 30, 45, 60].includes(duration_minutes)) {
      throw new Error('Duración debe ser 15, 30, 45 o 60 minutos');
    }

    if (!['first_visit', 'follow_up', 'emergency', 'routine', 'telemedicine'].includes(appointment_type)) {
      throw new Error('Tipo de cita inválido');
    }

    if (reason.trim().length < 10) {
      throw new Error('La razón de la cita debe tener al menos 10 caracteres');
    }

    // ============================================
    // OBTENER INFORMACIÓN DEL PACIENTE
    // ============================================
    console.log('🔍 [APPOINTMENT] Buscando información del paciente...');
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id, user_id')
      .eq('user_id', payload.user_id)
      .single();

    if (patientError || !patient) {
      throw new Error('Registro de paciente no encontrado');
    }

    console.log(`✅ [APPOINTMENT] Paciente encontrado: ${patient.id}`);

    // ============================================
    // VERIFICAR QUE EL DOCTOR EXISTE Y ESTÁ ACTIVO
    // ============================================
    console.log('👨‍⚕️ [APPOINTMENT] Verificando doctor...');
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .select(`
        id,
        user_id,
        specialization,
        is_available,
        profiles!inner(full_name, is_active)
      `)
      .eq('id', doctor_id)
      .single();

    if (doctorError || !doctor) {
      throw new Error('Doctor no encontrado');
    }

    if (!doctor.is_available || !doctor.profiles.is_active) {
      throw new Error('Doctor no disponible actualmente');
    }

    console.log(`✅ [APPOINTMENT] Doctor encontrado: ${doctor.profiles.full_name} (${doctor.specialization})`);

    // ============================================
    // VERIFICAR HORARIO DEL DOCTOR
    // ============================================
    console.log('📋 [APPOINTMENT] Verificando horario del doctor...');
    const appointmentDate = new Date(appointment_date + 'T00:00:00Z');
    const dayOfWeek = appointmentDate.getUTCDay(); // 0=Domingo, 6=Sábado

    const { data: schedule, error: scheduleError } = await supabaseAdmin
      .from('doctor_schedules')
      .select('start_time, end_time')
      .eq('doctor_id', doctor_id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single();

    if (scheduleError || !schedule) {
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      throw new Error(`El doctor no atiende los ${days[dayOfWeek]}`);
    }

    // Verificar que la hora esté dentro del horario del doctor
    const [reqHours, reqMinutes] = appointment_time.split(':').map(Number);
    const [startHours, startMinutes] = schedule.start_time.split(':').map(Number);
    const [endHours, endMinutes] = schedule.end_time.split(':').map(Number);

    const requestedTime = reqHours * 60 + reqMinutes;
    const doctorStartTime = startHours * 60 + startMinutes;
    const doctorEndTime = endHours * 60 + endMinutes;
    const appointmentEndTime = requestedTime + duration_minutes;

    if (requestedTime < doctorStartTime || appointmentEndTime > doctorEndTime) {
      throw new Error(`El doctor atiende de ${schedule.start_time} a ${schedule.end_time}`);
    }

    console.log(`✅ [APPOINTMENT] Horario válido: ${schedule.start_time} - ${schedule.end_time}`);

    // ============================================
    // VERIFICAR CONFLICTOS DE HORARIO
    // ============================================
    console.log('⏰ [APPOINTMENT] Verificando conflictos de horario...');
    const endTime = addMinutes(appointment_time, duration_minutes);

    const { data: conflicts, error: conflictError } = await supabaseAdmin
      .from('appointments')
      .select('id, appointment_time, duration_minutes')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', appointment_date)
      .in('status', ['scheduled', 'confirmed', 'in_progress']);

    if (conflictError) {
      console.log('⚠️ [APPOINTMENT] Error verificando conflictos:', conflictError);
      throw new Error('Error verificando disponibilidad');
    }

    if (conflicts && conflicts.length > 0) {
      for (const conflict of conflicts) {
        const conflictStart = conflict.appointment_time;
        const conflictEnd = addMinutes(conflictStart, conflict.duration_minutes);

        // Verificar solapamiento
        if (
          (appointment_time >= conflictStart && appointment_time < conflictEnd) ||
          (endTime > conflictStart && endTime <= conflictEnd) ||
          (appointment_time <= conflictStart && endTime >= conflictEnd)
        ) {
          throw new Error(`Conflicto de horario. El doctor tiene una cita de ${conflictStart} a ${conflictEnd}`);
        }
      }
    }

    console.log('✅ [APPOINTMENT] No hay conflictos de horario');

    // ============================================
    // VERIFICAR LÍMITE DE CITAS POR PACIENTE
    // ============================================
    console.log('📊 [APPOINTMENT] Verificando límite de citas...');
    const { data: patientAppointments, error: limitError } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('patient_id', patient.id)
      .in('status', ['scheduled', 'confirmed'])
      .gte('appointment_date', new Date().toISOString().split('T')[0]);

    if (limitError) {
      console.log('⚠️ [APPOINTMENT] Error verificando límite:', limitError);
    } else if (patientAppointments && patientAppointments.length >= 5) {
      throw new Error('Máximo 5 citas pendientes por paciente');
    }

    console.log(`✅ [APPOINTMENT] Citas pendientes: ${patientAppointments?.length || 0}/5`);

    // ============================================
    // CREAR LA CITA
    // ============================================
    console.log('💾 [APPOINTMENT] Creando cita...');
    const { data: newAppointment, error: createError } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_id: patient.id,
        doctor_id: doctor_id,
        appointment_date: appointment_date,
        appointment_time: appointment_time,
        duration_minutes: duration_minutes,
        status: 'scheduled',
        appointment_type: appointment_type,
        reason: reason.trim(),
        reminder_sent: false
      })
      .select(`
        id,
        appointment_date,
        appointment_time,
        duration_minutes,
        status,
        appointment_type,
        reason,
        created_at
      `)
      .single();

    if (createError) {
      console.log('❌ [APPOINTMENT] Error creando cita:', createError);
      throw new Error('Error creando la cita. Intenta nuevamente.');
    }

    console.log(`✅ [APPOINTMENT] Cita creada: ${newAppointment.id}`);

    // ============================================
    // REGISTRAR EN AUDIT LOG
    // ============================================
    try {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: payload.user_id,
        action: 'create_appointment',
        table_name: 'appointments',
        record_id: newAppointment.id,
        new_data: {
          appointment_id: newAppointment.id,
          doctor_id: doctor_id,
          appointment_date: appointment_date,
          appointment_time: appointment_time
        },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });
    } catch (e) {
      console.log('⚠️ [APPOINTMENT] Error en audit log:', e.message);
    }

    // ============================================
    // RESPUESTA EXITOSA
    // ============================================
    console.log('🎉 [APPOINTMENT] Cita agendada exitosamente');
    return new Response(JSON.stringify({
      success: true,
      data: {
        appointment: {
          id: newAppointment.id,
          appointment_date: newAppointment.appointment_date,
          appointment_time: newAppointment.appointment_time,
          duration_minutes: newAppointment.duration_minutes,
          status: newAppointment.status,
          appointment_type: newAppointment.appointment_type,
          reason: newAppointment.reason,
          created_at: newAppointment.created_at
        },
        doctor: {
          name: doctor.profiles.full_name,
          specialization: doctor.specialization
        },
        estimated_end_time: endTime
      },
      message: 'Cita agendada exitosamente'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 201
    });

  } catch (error) {
    console.log('💥 [APPOINTMENT] Error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});