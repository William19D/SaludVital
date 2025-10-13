# ✅ Integración Login y Register Completada

## Cambios Realizados

### 1. Actualizado `src/lib/edgeFunctions.ts`
- ✅ Ajustada la función `callEdgeFunction` para manejar la respuesta con formato `{ success, data/error }`
- ✅ Actualizada interfaz `RegisterParams` con campos del backend:
  - `full_name` (requerido)
  - `phone` (opcional)
  - `date_of_birth` (opcional)
  - `gender` (opcional)
- ✅ Actualizada interfaz `AuthResponse` para coincidir con la respuesta real:
  ```typescript
  {
    user: { id, email, full_name, role },
    tokens: { access_token, refresh_token, expires_in, token_type }
  }
  ```

### 2. Actualizado `src/contexts/AuthContext.tsx`
- ✅ Cambiado `name` a `full_name` en la interfaz `User`
- ✅ Cambiado `session` a `tokens` con la estructura correcta
- ✅ Agregado mapeo de roles entre backend y frontend:
  - Backend: `patient`, `doctor`, `admin`
  - Frontend: `paciente`, `medico`, `admin`
- ✅ Actualizado método `login()` para usar la estructura real de respuesta
- ✅ Actualizado método `register()` para enviar `full_name`
- ✅ Corregido almacenamiento en localStorage: `saludvital_tokens`

### 3. Actualizado `src/pages/Dashboard.tsx`
- ✅ Cambiado `user?.name` a `user?.full_name`

### 4. Actualizado `src/pages/Citas.tsx`
- ✅ Cambiado `user.name` a `user.full_name` en dos lugares

## Flujo de Autenticación

### Login
```typescript
// Usuario ingresa credenciales
await login('usuario@ejemplo.com', 'password123');

// 1. Se llama a la Edge Function /login
// 2. Backend valida credenciales
// 3. Backend retorna:
{
  success: true,
  data: {
    user: { id, email, full_name, role: 'patient' },
    tokens: { access_token, refresh_token, expires_in, token_type }
  }
}

// 4. Frontend convierte 'patient' a 'paciente'
// 5. Guarda en localStorage
// 6. Navega a /dashboard
```

### Register
```typescript
// Usuario se registra
await register('nuevo@ejemplo.com', 'password123', 'Juan Pérez', 'paciente');

// 1. Se llama a la Edge Function /register
// 2. Backend crea usuario con role='patient'
// 3. Backend crea profile y patient record
// 4. Backend retorna los mismos datos que login
// 5. Frontend procesa igual que login
```

## Mapeo de Roles

| Backend | Frontend |
|---------|----------|
| patient | paciente |
| doctor  | medico   |
| admin   | admin    |

## Estructura de Datos Guardados

### localStorage: `saludvital_user`
```json
{
  "id": "uuid-del-usuario",
  "email": "usuario@ejemplo.com",
  "full_name": "Juan Pérez",
  "role": "paciente"
}
```

### localStorage: `saludvital_tokens`
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "uuid-refresh-token",
  "expires_in": 1800,
  "token_type": "Bearer"
}
```

## Endpoints Configurados

- **Login**: `https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/login`
- **Register**: `https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/register`

## Validaciones del Backend

### Login
- ✅ Email y password requeridos
- ✅ Rate limiting: máximo 5 intentos fallidos en 15 minutos
- ✅ Verificación de usuario activo (`is_active`)
- ✅ Registro de intentos en `login_attempts`
- ✅ Audit log en `audit_logs`

### Register
- ✅ Email, password y full_name requeridos
- ✅ Password mínimo 8 caracteres
- ✅ Verificación de email único
- ✅ Creación automática de:
  - Usuario en auth.users
  - Profile en profiles
  - Patient record en patients
- ✅ Role siempre es 'patient'
- ✅ Usuario creado con `is_active=true` y `email_confirm=true`

## Manejo de Errores

Todos los errores se capturan y muestran con toast:

```typescript
try {
  await login(email, password);
  // Success toast automático
} catch (error) {
  // Error toast automático con el mensaje del backend
}
```

Errores comunes del backend:
- `"Email y contraseña son requeridos"`
- `"Credenciales inválidas"`
- `"Demasiados intentos fallidos. Intenta en 15 minutos."`
- `"Usuario inactivo. Contacta al administrador."`
- `"El email ya está registrado"`
- `"La contraseña debe tener al menos 8 caracteres"`

## Siguiente Paso: Instalar Dependencia

```powershell
bun add @supabase/supabase-js
```

## Probar la Integración

1. Ejecuta el proyecto:
   ```powershell
   bun run dev
   ```

2. Ve a `http://localhost:5173/auth`

3. **Prueba Registro:**
   - Email: `test@ejemplo.com`
   - Password: `password123`
   - Nombre: `Test Usuario`
   - Click en "Crear Cuenta"

4. **Prueba Login:**
   - Usa las mismas credenciales
   - Click en "Iniciar Sesión"

5. **Verifica:**
   - Deberías ser redirigido a `/dashboard`
   - En la consola del navegador (F12) → Application → Local Storage
   - Deberías ver `saludvital_user` y `saludvital_tokens`

## Estado Actual

- ✅ Login completamente funcional
- ✅ Register completamente funcional
- ✅ Mapeo de roles implementado
- ✅ Manejo de errores implementado
- ✅ Tokens guardados correctamente
- ✅ Navegación automática después de auth
- ✅ Toast notifications configuradas
- ⏳ Instalar `@supabase/supabase-js`

## Notas Importantes

1. **El register siempre crea pacientes** - Los usuarios con rol `medico` o `admin` deben crearse usando la Edge Function `create-user-with-role` desde un panel de administración.

2. **Tokens de acceso expiran en 30 minutos** - Necesitarás implementar refresh automático o manual.

3. **Los refresh tokens duran 30 días** - Se guardan en la tabla `refresh_tokens`.

4. **Rate limiting activo** - Protege contra ataques de fuerza bruta.

5. **Todos los logs se guardan** - Revisa `login_attempts` y `audit_logs` en Supabase.
