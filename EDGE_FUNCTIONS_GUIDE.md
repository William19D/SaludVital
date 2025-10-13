# Guía de Uso: Edge Functions de Supabase

## Configuración Completada ✅

Se ha creado un módulo centralizado para manejar todas las Edge Functions de Supabase de manera sencilla y consistente.

## Archivos Creados

### 1. Variables de Entorno (`.env` y `.env.example`)
```env
VITE_SUPABASE_URL=https://fbstreidlkukbaqtlpon.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=fbstreidlkukbaqtlpon
```

### 2. Módulo de Edge Functions (`src/lib/edgeFunctions.ts`)
Centraliza todas las llamadas a las Edge Functions.

### 3. Cliente de Supabase (`src/lib/supabase.ts`)
Cliente básico para operaciones directas con Supabase.

## Edge Functions Disponibles

### 🔐 Autenticación

#### 1. **register** - Registrar nuevo usuario
```typescript
import * as edgeFunctions from '@/lib/edgeFunctions';

await edgeFunctions.register({
  email: 'usuario@ejemplo.com',
  password: 'password123',
  name: 'Juan Pérez',
  role: 'paciente' // 'admin' | 'medico' | 'paciente'
});
```

#### 2. **login** - Iniciar sesión
```typescript
await edgeFunctions.login({
  email: 'usuario@ejemplo.com',
  password: 'password123'
});
```

#### 3. **logout** - Cerrar sesión
```typescript
const token = 'access_token_del_usuario';
await edgeFunctions.logout(token);
```

#### 4. **refreshToken** - Refrescar token
```typescript
const refreshToken = 'refresh_token_del_usuario';
await edgeFunctions.refreshToken(refreshToken);
```

### 👥 Gestión de Roles

#### 5. **getUserRole** - Obtener rol de usuario
```typescript
const userId = 'uuid-del-usuario';
const token = 'access_token';

await edgeFunctions.getUserRole(userId, token);
```

#### 6. **assignRole** - Asignar rol (Solo Admin)
```typescript
const adminToken = 'admin_access_token';

await edgeFunctions.assignRole({
  userId: 'uuid-del-usuario',
  role: 'medico'
}, adminToken);
```

#### 7. **createUserWithRole** - Crear usuario con rol (Solo Admin)
```typescript
const adminToken = 'admin_access_token';

await edgeFunctions.createUserWithRole({
  email: 'nuevo@ejemplo.com',
  password: 'password123',
  name: 'Dr. García',
  role: 'medico'
}, adminToken);
```

## Uso en el Proyecto

### El AuthContext ya está integrado ✅

El contexto de autenticación (`src/contexts/AuthContext.tsx`) ya está completamente integrado con las Edge Functions:

```typescript
import { useAuth } from '@/contexts/AuthContext';

// En tu componente
const { login, register, logout, user } = useAuth();

// Iniciar sesión
await login('usuario@ejemplo.com', 'password123');

// Registrar usuario
await register('nuevo@ejemplo.com', 'password123', 'Juan Pérez', 'paciente');

// Cerrar sesión
logout();
```

## Ejemplo de Uso Directo

Si necesitas llamar a las Edge Functions directamente (fuera del AuthContext):

```typescript
import * as edgeFunctions from '@/lib/edgeFunctions';

// Ejemplo: Crear componente de administración
const AdminPanel = () => {
  const handleCreateDoctor = async () => {
    try {
      const adminToken = 'tu_admin_token';
      
      const result = await edgeFunctions.createUserWithRole({
        email: 'doctor@ejemplo.com',
        password: 'securePassword',
        name: 'Dr. García',
        role: 'medico'
      }, adminToken);
      
      console.log('Doctor creado:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleCreateDoctor}>
      Crear Médico
    </button>
  );
};
```

## Manejo de Errores

Todas las funciones lanzan errores que puedes capturar:

```typescript
try {
  await edgeFunctions.login({ email, password });
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // Mostrar mensaje al usuario
  }
}
```

## Utilidades Disponibles

### Verificar Configuración
```typescript
import edgeFunctions from '@/lib/edgeFunctions';

if (edgeFunctions.isConfigured()) {
  console.log('Edge Functions configuradas correctamente');
}
```

### Obtener Configuración
```typescript
const config = edgeFunctions.getConfig();
console.log(config);
// {
//   projectId: 'fbstreidlkukbaqtlpon',
//   baseUrl: 'https://fbstreidlkukbaqtlpon.supabase.co',
//   functionsUrl: 'https://fbstreidlkukbaqtlpon.supabase.co/functions/v1',
//   isConfigured: true
// }
```

## Endpoints de las Edge Functions

Todas las Edge Functions están disponibles en:
- **Base URL**: `https://fbstreidlkukbaqtlpon.supabase.co/functions/v1`

| Función | Endpoint |
|---------|----------|
| register | `/register` |
| login | `/login` |
| logout | `/logout` |
| refresh-token | `/refresh-token` |
| assign-role | `/assign-role` |
| get-user-role | `/get-user-role` |
| create-user-with-role | `/create-user-with-role` |

## Próximos Pasos

1. ✅ Variables de entorno configuradas
2. ✅ Módulo de Edge Functions creado
3. ✅ AuthContext integrado
4. ⏳ Probar autenticación en la UI
5. ⏳ Implementar gestión de roles para admin
6. ⏳ Agregar manejo de refresh tokens automático

## Notas Importantes

- 🔑 El token de acceso se almacena en localStorage como `saludvital_session`
- 👤 Los datos del usuario se almacenan en localStorage como `saludvital_user`
- 🔄 El refresh token permite renovar la sesión sin volver a iniciar sesión
- 🛡️ Las funciones de admin requieren un token con permisos de administrador

## Instalación de Dependencias Pendiente

No olvides instalar el cliente de Supabase:

```bash
bun add @supabase/supabase-js
```
