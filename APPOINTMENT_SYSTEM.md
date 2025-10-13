# Sistema de Agendamiento de Citas Médicas

## 📋 Descripción General

Este sistema permite a los pacientes agendar sus propias citas médicas de manera autónoma a través de una interfaz web intuitiva. Los pacientes pueden seleccionar de **41 especialidades médicas**, doctores calificados, fechas y horarios disponibles.

## 🚀 Funcionalidades Implementadas

### Edge Functions de Supabase

#### 1. `create-appointment`
- **URL**: `https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/create-appointment`
- **Método**: POST
- **Autenticación**: Requerida (Bearer token)
- **Propósito**: Crear nuevas citas médicas

**Validaciones incluidas**:
- ✅ Solo pacientes pueden agendar citas
- ✅ Validación de fechas (no permite fechas pasadas)
- ✅ Validación de horarios comerciales (7:00 AM - 6:00 PM)
- ✅ Verificación de disponibilidad del doctor
- ✅ Prevención de conflictos de horario
- ✅ Límite de 5 citas pendientes por paciente
- ✅ Validación de duración (15, 30, 45, 60 minutos)

#### 2. `get-doctors`
- **URL**: `https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/get-doctors`
- **Método**: GET
- **Autenticación**: Opcional
- **Propósito**: Obtener lista completa de doctores con información detallada

**Parámetros de consulta disponibles**:
- `specialization` - Filtrar por especialidad
- `available_only=true` - Solo doctores disponibles
- `include_schedule=true` - Incluir horarios de trabajo
- `include_next_slot=true` - Calcular próximo slot disponible
- `min_rating` - Rating mínimo
- `sort_by` - Ordenar por: rating, experience, name, fee
- `limit` - Número máximo de resultados

**Respuesta incluye**:
- �‍⚕️ Información personal del doctor
- 🎓 Datos profesionales (especialidad, experiencia, tarifas)
- ⭐ Ratings y reseñas
- 📅 Horarios de trabajo (si se solicita)
- ⏰ Próximo slot disponible (si se solicita)
- 📊 Estadísticas generales

### Especialidades Médicas Disponibles (41 especialidades)

El sistema incluye una lista completa de especialidades médicas con iconos representativos:

#### 🏥 **Medicina General y Familiar**
- Medicina General
- Medicina Familiar  
- Medicina Interna

#### ❤️ **Especialidades Cardiovasculares**
- Cardiología
- Cardiología Pediátrica
- Cirugía Cardiovascular

#### 🔬 **Especialidades Quirúrgicas**
- Cirugía General
- Cirugía Plástica y Reconstructiva
- Cirugía Pediátrica
- Neurocirugía

#### � **Especialidades Pediátricas**
- Pediatría
- Oncología Pediátrica

#### 🧠 **Especialidades Neurológicas y Mentales**
- Neurología
- Psiquiatría
- Psicología Clínica

#### �️ **Especialidades de Órganos Específicos**
- Oftalmología
- Otorrinolaringología
- Dermatología
- Urología

#### 🦴 **Especialidades Musculoesqueléticas**
- Ortopedia y Traumatología
- Reumatología
- Fisiatría (Rehabilitación)

#### 🔬 **Especialidades de Diagnóstico**
- Radiología
- Patología
- Medicina Nuclear

#### �️ **Especialidades Preventivas y de Emergencias**
- Medicina de Emergencias
- Medicina Preventiva
- Medicina del Trabajo
- Inmunología y Alergología

#### ⚗️ **Especialidades Metabólicas y Sistémicas**
- Endocrinología
- Gastroenterología
- Nefrología
- Neumología
- Hematología
- Infectología
- Oncología

#### 👥 **Especialidades de Poblaciones Específicas**
- Ginecología y Obstetricia
- Geriatría
- Medicina del Deporte

#### 💊 **Especialidades de Soporte**
- Anestesiología
- Nutrición y Dietética

### Tipos de Cita

- 🆕 **Primera consulta** (`first_visit`)
- 🔄 **Consulta de seguimiento** (`follow_up`)
- 📅 **Consulta de rutina** (`routine`)
- 🚨 **Urgencia** (`emergency`)
- 💻 **Telemedicina** (`telemedicine`)

### Duraciones Disponibles

- ⏱️ **15 minutos**
- ⏱️ **30 minutos** (por defecto)
- ⏱️ **45 minutos**
- ⏱️ **60 minutos**

## 🎯 Interfaz de Usuario Mejorada

### Características del Formulario de Agendamiento

1. **Selección de Especialidad**: 
   - 📋 Lista desplegable con 41 especialidades médicas
   - 🎨 Iconos únicos para cada especialidad
   - 🔍 Búsqueda y filtrado fácil

2. **Selección de Doctor**: 
   - 🔍 Filtrada automáticamente por especialidad seleccionada
   - ⭐ Información detallada: rating, experiencia, tarifa
   - 📅 Próximo slot disponible visible
   - 🏆 Años de experiencia y número de reseñas

3. **Configuración de Cita**:
   - 📋 Tipo de cita con descripciones claras
   - ⏱️ Duración flexible según necesidades
   - 📅 Calendario con restricción de fechas pasadas
   - 🕐 Horarios cada 15 minutos en horario comercial

4. **Información Adicional**:
   - ✍️ Campo de motivo con validación (mínimo 10 caracteres)
   - 📊 Contador de caracteres en tiempo real
   - ✅ Validaciones inmediatas

### Información del Doctor Mostrada

Para cada doctor, el sistema muestra:
- 👨‍⚕️ **Nombre completo**
- 🏥 **Especialidad**
- ⭐ **Rating** (X.X estrellas)
- 👥 **Número de reseñas**
- 🎓 **Años de experiencia**
- 💰 **Tarifa de consulta**
- 📅 **Próximo slot disponible**
- 🗣️ **Idiomas** (si está disponible)

### Validaciones en Tiempo Real

- ✅ Campos obligatorios marcados con asterisco
- ✅ Contador de caracteres para el motivo
- ✅ Habilitación/deshabilitación dinámica de campos
- ✅ Mensajes de error descriptivos y específicos
- ✅ Estados de carga durante peticiones

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
JWT_SECRET=your_jwt_secret
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Edge Function URL
```
https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/get-doctors
```

### Estructura de Respuesta de get-doctors

```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "doctor-uuid",
        "personal_info": {
          "full_name": "Dr. Juan Pérez",
          "email": "juan.perez@hospital.com",
          "phone": "+1234567890",
          "avatar_url": "url-to-avatar",
          "is_active": true
        },
        "professional_info": {
          "specialization": "Cardiología",
          "license_number": "LIC123456",
          "years_of_experience": 15,
          "consultation_fee": 150.00,
          "bio": "Especialista en cardiología...",
          "education": ["Universidad ABC", "Residencia XYZ"],
          "languages": ["Español", "Inglés"]
        },
        "availability": {
          "is_available": true,
          "rating": 4.8,
          "total_reviews": 156,
          "next_available_slot": "2025-10-15 09:00",
          "schedule": {
            "Lunes": {
              "day_of_week": 1,
              "start_time": "08:00",
              "end_time": "17:00",
              "is_active": true
            }
          }
        }
      }
    ],
    "statistics": {
      "total_doctors": 25,
      "available_doctors": 23,
      "specializations": ["Cardiología", "Neurología", ...],
      "average_experience": 12,
      "average_rating": 4.6
    }
  }
}
```

## 🚀 Cómo Usar el Sistema

### Para Pacientes

1. **Iniciar Sesión**: Acceder con credenciales de paciente
2. **Ir a Citas**: Navegar a la sección "Citas" desde el menú lateral
3. **Agendar Nueva Cita**: Hacer clic en "Agendar Cita"
4. **Seleccionar Especialidad**: Elegir una de las 41 especialidades disponibles
5. **Elegir Doctor**: Seleccionar un doctor con toda la información visible
6. **Configurar Cita**: Definir tipo, duración, fecha y hora
7. **Describir Motivo**: Explicar brevemente la razón (mínimo 10 caracteres)
8. **Confirmar**: Revisar todos los datos y confirmar agendamiento

### Estados de las Citas

- 📅 **Programada** (`scheduled`): Cita recién creada
- ✅ **Confirmada** (`confirmed`): Doctor confirmó la cita
- 🏁 **Completada** (`completed`): Cita realizada
- ❌ **Cancelada** (`cancelled`): Cita cancelada
- 🔄 **En Progreso** (`in_progress`): Cita en curso

## 🛡️ Seguridad y Validaciones

### Autenticación
- 🔐 JWT tokens para autenticación
- 👤 Verificación de rol de usuario
- 🔒 Solo pacientes pueden agendar citas

### Validaciones de Negocio
- 📅 No permite agendar en fechas pasadas
- ⏰ Respeta horarios comerciales (7:00 AM - 6:00 PM)
- 👨‍⚕️ Verifica disponibilidad del doctor
- 🚫 Previene conflictos de horario
- 📊 Limita citas pendientes por paciente (máximo 5)
- ✍️ Motivo mínimo de 10 caracteres

### Auditoría
- 📝 Registro de todas las acciones en `audit_logs`
- 🕒 Timestamps de creación y modificación
- 🌐 Registro de IP de origen
- � Identificación del usuario que realiza la acción

## 📱 Experiencia de Usuario

### Características UX/UI

- 🎨 **Interfaz Intuitiva**: Diseño limpio con shadcn/ui
- 📱 **Responsive**: Optimizado para móviles y desktop
- ⚡ **Tiempo Real**: Validaciones y feedback inmediato
- 🔄 **Estados de Carga**: Spinners y indicadores visuales
- 🎯 **Accesibilidad**: Labels, tooltips y navegación por teclado
- 🌈 **Iconografía Rica**: Iconos únicos para cada especialidad
- � **Colores Personalizados**: Sidebar con tema personalizable

### Flujo de Usuario Optimizado

1. **Entrada Rápida**: Acceso directo desde el dashboard
2. **Selección Visual**: Especialidades con iconos descriptivos
3. **Información Rica**: Detalles completos de cada doctor
4. **Validación Progresiva**: Errores detectados temprano
5. **Confirmación Clara**: Resumen completo antes de confirmar
6. **Feedback Inmediato**: Notificaciones toast de éxito/error

## 🔮 Próximas Mejoras Sugeridas

- 📧 **Notificaciones Email**: Confirmaciones automáticas
- 📱 **Recordatorios SMS**: Alertas previas a la cita
- 🗓️ **Sincronización Calendar**: Integración con Google Calendar
- 🔄 **Reprogramación**: Cambiar citas existentes
- 💬 **Chat en Vivo**: Comunicación directa con doctores
- 📊 **Analytics**: Dashboard de estadísticas para administradores
- 🌍 **Multi-idioma**: Soporte para inglés y otros idiomas
- 💳 **Pagos Online**: Integración con Stripe/PayPal
- 📋 **Historial Médico**: Vinculación con expedientes
- 🔔 **Push Notifications**: Notificaciones del navegador

---

## 🎉 ¡El sistema está completamente listo!

Los pacientes ya pueden agendar sus citas de manera completamente autónoma, con acceso a 41 especialidades médicas, información detallada de doctores, y una experiencia de usuario excepcional que mejora significativamente la gestión médica.

### 📞 Contacto de Soporte
Para dudas técnicas o funcionales, contactar al equipo de desarrollo del sistema Salud Vital.