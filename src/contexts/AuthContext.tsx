import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'medico' | 'paciente';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users para demostración
const mockUsers: User[] = [
  { id: '1', email: 'admin@saludvital.com', name: 'Dr. Admin', role: 'admin' },
  { id: '2', email: 'medico@saludvital.com', name: 'Dr. García', role: 'medico' },
  { id: '3', email: 'paciente@saludvital.com', name: 'Juan Pérez', role: 'paciente' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('saludvital_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (!foundUser) {
      throw new Error('Credenciales inválidas');
    }

    setUser(foundUser);
    localStorage.setItem('saludvital_user', JSON.stringify(foundUser));
    navigate('/dashboard');
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
    };

    setUser(newUser);
    localStorage.setItem('saludvital_user', JSON.stringify(newUser));
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('saludvital_user');
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
