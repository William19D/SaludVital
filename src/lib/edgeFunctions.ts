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
  // Utils
  isConfigured,
  getConfig,
};
