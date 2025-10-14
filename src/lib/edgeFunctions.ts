/**
 * Módulo centralizado para Edge Functions de Supabase
 * Todas las funciones de autenticación y gestión de roles
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

// Base URL para todas las Edge Functions
const FUNCTIONS_BASE_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Headers comunes para todas las peticiones
 */
const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  };
  
  if (token) {
    // Usar nuestro token JWT personalizado, NO el token de Supabase
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`🔐 Header Authorization configurado con JWT: ${token.substring(0, 30)}...`);
  } else {
    console.log('⚠️ No se proporcionó token JWT');
  }
  
  return headers;
};

/**
 * Función auxiliar para hacer peticiones a Edge Functions
 */
const callEdgeFunction = async <T = any>(
  functionName: string,
  body?: any,
  token?: string
): Promise<T> => {
  try {
    console.log(`🚀 Llamando Edge Function: ${functionName}`);
    console.log(`🔑 Token enviado: ${token ? token.substring(0, 30) + '...' : 'NO TOKEN'}`);
    
    const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`📡 Respuesta HTTP ${functionName}:`, response.status, response.statusText);
    
    const result = await response.json();
    console.log(`📦 Resultado ${functionName}:`, result);

    // Las Edge Functions retornan { success: true/false, data/error }
    if (!result.success) {
      throw new Error(result.error || `Error en ${functionName}`);
    }

    return result.data as T;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
};

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

export interface RegisterParams {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

/**
 * Registrar un nuevo usuario con rol
 */
export const register = async (params: RegisterParams): Promise<AuthResponse> => {
  return callEdgeFunction<AuthResponse>('register', params);
};

/**
 * Iniciar sesión
 */
export const login = async (params: LoginParams): Promise<AuthResponse> => {
  return callEdgeFunction<AuthResponse>('login', params);
};

/**
 * Cerrar sesión
 */
export const logout = async (token: string): Promise<{ success: boolean }> => {
  return callEdgeFunction<{ success: boolean }>('logout', {}, token);
};

/**
 * Refrescar token de sesión
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  return callEdgeFunction<AuthResponse>('refresh-token', { refresh_token: refreshToken });
};

// ============================================
// FUNCIONES DE CITAS MÉDICAS  
// ============================================

export interface CreateAppointmentParams {
  doctor_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  duration_minutes?: number; // 15, 30, 45, 60, 90, 120
  appointment_type?: 'first_visit' | 'follow_up' | 'emergency' | 'routine' | 'telemedicine';
  reason: string;
}

export interface AppointmentResponse {
  appointment: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    duration_minutes: number;
    status: string;
    appointment_type: string;
    reason: string;
    created_at: string;
  };
  doctor: {
    name: string;
    specialization: string;
  };
  schedule_info: {
    estimated_end_time: string;
    mode: string;
    note: string;
  };
}

export interface UserAppointment {
  id: string;
  appointment_info: {
    date: string;
    time: string;
    end_time: string;
    duration_minutes: number;
    status: {
      value: string;
      label: string;
      color: string;
      description: string;
    };
    type: {
      value: string;
      label: string;
      icon: string;
    };
    is_upcoming: boolean;
    time_until: string;
  };
  details: {
    reason: string;
    notes?: string;
    reminder_sent: boolean;
  };
  cancellation?: {
    reason?: string;
    cancelled_by?: string;
    cancelled_at?: string;
  } | null;
  timestamps: {
    created_at: string;
    updated_at: string;
  };
  doctor?: {
    id: string;
    name: string;
    specialization: string;
    consultation_fee: number;
    phone?: string;
    avatar_url?: string;
    rating: number;
    total_reviews: number;
  };
  patient?: {
    id: string;
    name: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    avatar_url?: string;
    medical_info?: {
      blood_type?: string;
      allergies?: string[];
      chronic_conditions?: string[];
    };
  };
}

export interface UserAppointmentsResponse {
  appointments: UserAppointment[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
  statistics: {
    total_appointments: number;
    upcoming_appointments: number;
    status_breakdown: Record<string, number>;
    type_breakdown: Record<string, number>;
  };
  next_appointment?: UserAppointment | null;
  metadata: {
    user_role: string;
    user_info: any;
    filters_applied: any;
    timestamp: string;
  };
}

export interface CancelAppointmentParams {
  appointment_id: string;
  cancellation_reason: string;
}

export interface CancelAppointmentResponse {
  appointment: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    cancellation_reason: string;
    cancelled_at: string;
  };
  cancelled_by: {
    user_id: string;
    role: string;
    email: string;
  };
  original_appointment: {
    doctor_name: string;
    patient_name: string;
    specialization: string;
    original_reason: string;
  };
}

export interface RescheduleAppointmentParams {
  appointment_id: string;
  new_appointment_date: string;
  new_appointment_time: string;
  new_duration_minutes?: number;
  reschedule_reason?: string;
}

export interface RescheduleAppointmentResponse {
  appointment: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    duration_minutes: number;
    estimated_end_time: string;
    status: string;
    updated_at: string;
  };
  rescheduled_by: {
    user_id: string;
    role: string;
    email: string;
  };
  changes: {
    previous: {
      date: string;
      time: string;
      duration: number;
    };
    new: {
      date: string;
      time: string;
      duration: number;
    };
    reason: string;
  };
  doctor_info: {
    name: string;
    specialization: string;
  };
  patient_info: {
    name: string;
  };
}

export interface DoctorInfo {
  id: string;
  personal_info: {
    full_name: string;
    email: string;
    phone: string;
  };
  professional_info: {
    specialization: string;
    license_number: string;
    years_of_experience: number;
    consultation_fee: number;
    bio?: string;
  };
  availability: {
    is_available: boolean;
    rating: number;
    total_reviews: number;
    next_available_slot?: string;
  };
}

// Interfaz para citas de doctor
export interface DoctorAppointment {
  appointment_id: string;
  date: string;
  time: string;
  estimated_end_time: string;
  duration_minutes: number;
  status: string;
  status_label: string;
  status_icon: string;
  appointment_type: string;
  appointment_type_label: string;
  reason: string;
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  patient: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone?: string;
    age?: number;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    blood_type?: string;
    allergies: string[];
    chronic_conditions: string[];
    current_medications: string[];
    insurance_provider?: string;
    insurance_number?: string;
    preferred_language?: string;
    emergency_contact: {
      name?: string;
      phone?: string;
    };
  };
}

export interface DoctorAppointmentsResponse {
  success: boolean;
  data: {
    appointments: DoctorAppointment[];
    statistics: {
      total_appointments: number;
      today_appointments: number;
      upcoming_appointments: number;
      completed_appointments: number;
      cancelled_appointments: number;
      status_breakdown: Record<string, number>;
      type_breakdown: Record<string, number>;
    };
    pagination: {
      page: number;
      limit: number;
      total_results: number;
      has_more: boolean;
    };
    filters_applied: {
      date?: string;
      status?: string;
      type?: string;
      sort_by: string;
      sort_order: string;
    };
    doctor_info: {
      doctor_id: string;
      user_id: string;
      specialization: string;
      is_available: boolean;
    };
    system_info: {
      queried_by: string;
      queried_at: string;
      timezone: string;
    };
  };
  message: string;
}

// Interfaces para completar cita
export interface CompleteAppointmentParams {
  appointment_id: string;
  medical_notes: string;
  follow_up_required?: string;
}

export interface CompleteAppointmentResponse {
  success: boolean;
  data: {
    appointment: {
      id: string;
      appointment_date: string;
      appointment_time: string;
      duration_minutes: number;
      status: string;
      appointment_type: string;
      reason: string;
      notes: string;
      updated_at: string;
    };
    completed_by: {
      user_id: string;
      role: string;
      email: string;
    };
    patient_info: {
      name: string;
      email: string;
    };
    doctor_info: {
      specialization: string;
    };
    email_notification: {
      sent: boolean;
      recipient: string;
      from: string;
      message: string;
    };
    system_info: {
      completed_by: string;
      completed_at_local: string;
      timezone: string;
      email_provider: string;
      email_domain: string;
      follow_up_required?: string;
    };
  };
  message: string;
}

// ============================================
// FUNCIONES DE GESTIÓN DE ROLES
// ============================================

export interface AssignRoleParams {
  userId: string;
  role: 'admin' | 'medico' | 'paciente';
}

export interface UserRoleResponse {
  userId: string;
  role: string;
  email: string;
  name?: string;
}

/**
 * Asignar rol a un usuario (requiere permisos de admin)
 */
export const assignRole = async (
  params: AssignRoleParams,
  adminToken: string
): Promise<{ success: boolean; user: UserRoleResponse }> => {
  return callEdgeFunction('assign-role', params, adminToken);
};

/**
 * Obtener el rol de un usuario
 */
export const getUserRole = async (
  userId: string,
  token: string
): Promise<UserRoleResponse> => {
  return callEdgeFunction<UserRoleResponse>('get-user-role', { userId }, token);
};

/**
 * Crear usuario con rol específico (requiere permisos de admin)
 */
export const createUserWithRole = async (
  params: RegisterParams,
  adminToken: string
): Promise<AuthResponse> => {
  return callEdgeFunction<AuthResponse>('create-user-with-role', params, adminToken);
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Verificar si hay variables de entorno configuradas
 */
export const isConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && PROJECT_ID);
};

/**
 * Obtener información de configuración (sin exponer las claves)
 */
export const getConfig = () => ({
  projectId: PROJECT_ID,
  baseUrl: SUPABASE_URL,
  functionsUrl: FUNCTIONS_BASE_URL,
  isConfigured: isConfigured(),
});

export default {
  // Auth
  register,
  login,
  logout,
  refreshToken,
  // Roles
  assignRole,
  getUserRole,
  createUserWithRole,
  // Appointments - Nueva versión sin restricciones de horario
  createAppointment: async (data: CreateAppointmentParams, token: string): Promise<AppointmentResponse> => {
    return callEdgeFunction<AppointmentResponse>('create-appointment', {
      doctor_id: data.doctor_id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      duration_minutes: data.duration_minutes || 30,
      appointment_type: data.appointment_type || 'routine',
      reason: data.reason
    }, token);
  },
  
  // Obtener citas del usuario actual
  getUserAppointments: async (
    filters?: { 
      status?: string; 
      date_from?: string; 
      date_to?: string; 
      upcoming?: boolean; 
      limit?: number; 
      offset?: number; 
      sort_by?: string; 
      sort_order?: string; 
    }, 
    token?: string
  ): Promise<UserAppointmentsResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.upcoming) params.append('upcoming', 'true');
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    
    const url = `${FUNCTIONS_BASE_URL}/get-user-appointments${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, { 
      headers: getHeaders(token),
      method: 'GET'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Error obteniendo citas del usuario');
    }
    
    return result.data;
  },

  // Cancelar una cita
  cancelAppointment: async (data: CancelAppointmentParams, token: string): Promise<CancelAppointmentResponse> => {
    return callEdgeFunction<CancelAppointmentResponse>('cancel-appointment', {
      appointment_id: data.appointment_id,
      cancellation_reason: data.cancellation_reason
    }, token);
  },

  // Reagendar una cita
  rescheduleAppointment: async (data: RescheduleAppointmentParams, token: string): Promise<RescheduleAppointmentResponse> => {
    return callEdgeFunction<RescheduleAppointmentResponse>('reschedule-appointment', {
      appointment_id: data.appointment_id,
      new_appointment_date: data.new_appointment_date,
      new_appointment_time: data.new_appointment_time,
      new_duration_minutes: data.new_duration_minutes,
      reschedule_reason: data.reschedule_reason
    }, token);
  },
  getDoctors: async (filters?: { 
    specialization?: string, 
    available_only?: boolean, 
    include_schedule?: boolean,
    include_next_slot?: boolean 
  }): Promise<{ success: boolean; data: { doctors: DoctorInfo[]; statistics: any; metadata: any } }> => {
    const params = new URLSearchParams();
    if (filters?.specialization) params.append('specialization', filters.specialization);
    if (filters?.available_only) params.append('available_only', 'true');
    if (filters?.include_schedule) params.append('include_schedule', 'true');
    if (filters?.include_next_slot) params.append('include_next_slot', 'true');
    
    const url = `https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/get-doctors${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, { 
      headers: getHeaders(),
      method: 'GET'
    });
    
    return response.json();
  },
  getDoctorAppointments: async (
    token: string,
    filters?: {
      date?: string;
      status?: string;
      type?: string;
      page?: number;
      limit?: number;
      sort?: string;
      order?: 'ASC' | 'DESC';
    }
  ): Promise<DoctorAppointmentsResponse> => {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);

    const url = `https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/get-doctor-appointments${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log(`🩺 Obteniendo citas del doctor con URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error obteniendo citas del doctor:', result);
      throw new Error(result.error || 'Error obteniendo las citas del doctor');
    }

    console.log('✅ Citas del doctor obtenidas exitosamente:', result.data?.appointments?.length || 0, 'citas');
    return result;
  },
  completeAppointment: async (
    token: string, 
    data: CompleteAppointmentParams
  ): Promise<CompleteAppointmentResponse> => {
    console.log('✅ Completando cita:', data.appointment_id);
    
    const response = await fetch('https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/complete-appointment', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error completando cita:', result);
      throw new Error(result.error || 'Error completando la cita');
    }

    console.log('✅ Cita completada exitosamente:', result.data?.appointment?.id);
    return result;
  },
  // Utils
  isConfigured,
  getConfig,
};
