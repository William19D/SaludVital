import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as edgeFunctions from '@/lib/edgeFunctions';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'medico' | 'paciente';

// Mapeo de roles entre backend y frontend
const roleMap: { [key: string]: UserRole } = {
  'admin': 'admin',
  'doctor': 'medico',
  'patient': 'paciente',
  'medico': 'medico',
  'paciente': 'paciente',
};

const getRoleForBackend = (role: UserRole): string => {
  const backendRoles: { [key in UserRole]: string } = {
    'admin': 'admin',
    'medico': 'doctor',
    'paciente': 'patient',
  };
  return backendRoles[role];
};

const getRoleForFrontend = (role: string): UserRole => {
  return roleMap[role] || 'paciente';
};

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('saludvital_user');
    const savedTokens = localStorage.getItem('saludvital_tokens');
    
    console.log('🔍 AuthContext - Verificando localStorage:');
    console.log('   - savedUser:', savedUser ? 'EXISTE' : 'NO EXISTE');
    console.log('   - savedTokens:', savedTokens ? 'EXISTE' : 'NO EXISTE');
    
    if (savedUser && savedTokens) {
      const userObj = JSON.parse(savedUser);
      const tokensObj = JSON.parse(savedTokens);
      
      console.log('✅ Restaurando sesión:', userObj.email, userObj.role);
      console.log('🔑 Token JWT:', tokensObj.access_token?.substring(0, 50) + '...');
      
      setUser(userObj);
      setTokens(tokensObj);
    } else {
      console.log('❌ No hay sesión guardada');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Iniciando login para:', email);
      const response = await edgeFunctions.login({ email, password });
      
      console.log('✅ Respuesta de login:', {
        user: response.user,
        hasTokens: !!response.tokens,
        tokenType: response.tokens?.token_type,
        expiresIn: response.tokens?.expires_in
      });
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name,
        role: getRoleForFrontend(response.user.role),
      };
      
      setUser(userData);
      setTokens(response.tokens);
      
      localStorage.setItem('saludvital_user', JSON.stringify(userData));
      localStorage.setItem('saludvital_tokens', JSON.stringify(response.tokens));
      
      console.log('💾 Sesión guardada en localStorage');
      
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard/citas');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      console.error('❌ Error en login:', errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // El backend siempre crea pacientes en el endpoint de register
      const response = await edgeFunctions.register({ 
        email, 
        password, 
        full_name: name 
      });
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name,
        role: getRoleForFrontend(response.user.role),
      };
      
      setUser(userData);
      setTokens(response.tokens);
      
      localStorage.setItem('saludvital_user', JSON.stringify(userData));
      localStorage.setItem('saludvital_tokens', JSON.stringify(response.tokens));
      
      toast.success('Registro exitoso');
      navigate('/dashboard/citas');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar usuario';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (tokens?.access_token) {
        await edgeFunctions.logout(tokens.access_token);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('saludvital_user');
      localStorage.removeItem('saludvital_tokens');
      navigate('/auth');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token: tokens?.access_token || null, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
