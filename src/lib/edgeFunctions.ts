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
    headers['Authorization'] = `Bearer ${token}`;
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
    const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();

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
  // Utils
  isConfigured,
  getConfig,
};
