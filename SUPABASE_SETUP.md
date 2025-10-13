# Configuración de Supabase para Bright Health Nexus

## Cambios Realizados

Se han eliminado todos los datos hardcoded del proyecto para prepararlo para la integración con Supabase. Los cambios incluyen:

### 1. AuthContext.tsx
- ✅ Eliminado array `mockUsers` con usuarios de prueba
- ✅ Actualizado método `login()` para integración con Supabase
- ✅ Actualizado método `register()` para integración con Supabase
- 📝 Listo para implementar autenticación con Supabase Auth

### 2. Dashboard.tsx
- ✅ Eliminadas estadísticas hardcoded (stats)
- ✅ Eliminadas citas de ejemplo para pacientes
- 📝 Listo para consumir datos reales desde Supabase

### 3. Citas.tsx
- ✅ Eliminado array de citas de ejemplo
- ✅ Eliminada lista hardcoded de médicos
- ✅ Eliminada lista hardcoded de especialidades
- 📝 Listo para cargar citas, médicos y especialidades desde Supabase

### 4. Resultados.tsx
- ✅ Eliminado array de resultados médicos de ejemplo
- 📝 Listo para cargar resultados desde Supabase

### 5. Alertas.tsx
- ✅ Eliminado array de alertas de ejemplo
- 📝 Listo para cargar alertas desde Supabase

### 6. Auth.tsx
- ✅ Eliminado panel de usuarios de prueba
- 📝 Formulario listo para autenticación real

## Próximos Pasos para Integración con Supabase

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 2. Instalar Dependencias de Supabase

```bash
bun add @supabase/supabase-js
```

### 3. Crear Cliente de Supabase

Crear archivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4. Estructura de Base de Datos Sugerida

#### Tabla: users (extender auth.users)
- id (uuid, PK)
- email (text)
- name (text)
- role (enum: 'admin', 'medico', 'paciente')
- created_at (timestamp)

#### Tabla: citas
- id (uuid, PK)
- paciente_id (uuid, FK -> users)
- medico_id (uuid, FK -> users)
- fecha (date)
- hora (time)
- especialidad_id (uuid, FK -> especialidades)
- estado (enum: 'programada', 'completada', 'cancelada')
- created_at (timestamp)

#### Tabla: especialidades
- id (uuid, PK)
- nombre (text)
- descripcion (text)
- activa (boolean)

#### Tabla: resultados
- id (uuid, PK)
- paciente_id (uuid, FK -> users)
- medico_id (uuid, FK -> users)
- tipo (text)
- descripcion (text)
- fecha (date)
- estado (enum: 'nuevo', 'visto')
- archivo_url (text)
- created_at (timestamp)

#### Tabla: alertas
- id (uuid, PK)
- usuario_id (uuid, FK -> users)
- tipo (enum: 'cita', 'resultado', 'medicamento', 'general')
- titulo (text)
- mensaje (text)
- prioridad (enum: 'alta', 'media', 'baja')
- leida (boolean)
- fecha (timestamp)
- created_at (timestamp)

### 5. Políticas de Seguridad (RLS)

Asegúrate de habilitar Row Level Security (RLS) en todas las tablas y configurar políticas apropiadas:

```sql
-- Ejemplo para tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propia información
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Los admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 6. Implementar Funciones en AuthContext

```typescript
const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Obtener datos adicionales del usuario
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    setUser(userData);
    navigate('/dashboard');
  } catch (error) {
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

### 7. Cargar Datos en los Componentes

Ejemplo para cargar citas:

```typescript
useEffect(() => {
  const loadCitas = async () => {
    const { data, error } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:users!paciente_id(name),
        medico:users!medico_id(name),
        especialidad:especialidades(nombre)
      `)
      .order('fecha', { ascending: true });
    
    if (!error && data) {
      setCitas(data);
    }
  };
  
  loadCitas();
}, []);
```

## Notas Importantes

- Todos los archivos tienen comentarios `// TODO:` indicando dónde implementar la integración con Supabase
- El proyecto está completamente limpio de datos de prueba
- La estructura de tipos TypeScript ya está definida en cada archivo
- Se recomienda implementar manejo de errores robusto
- Considerar implementar loading states para mejor UX

## Archivo .env.example

Se ha creado un archivo `.env.example` con las variables necesarias. Copia este archivo a `.env` y completa con tus credenciales de Supabase.
