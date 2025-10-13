# 🚀 Comandos de Instalación y Configuración

## 1. Instalar Dependencia de Supabase

```powershell
bun add @supabase/supabase-js
```

## 2. Verificar que el archivo .env existe

El archivo `.env` ya está creado con tus credenciales. Verifica que contenga:

```env
VITE_SUPABASE_URL=https://fbstreidlkukbaqtlpon.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3RyZWlkbGt1a2JhcXRscG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMDAyOTEsImV4cCI6MjA3NTg3NjI5MX0.QCxSziC5WuClVY58uoggWJPHJDGg42PlwdMbfr9GxwA
VITE_SUPABASE_PROJECT_ID=fbstreidlkukbaqtlpon
```

## 3. Ejecutar el Proyecto

```powershell
bun run dev
```

## 4. Probar la Autenticación

1. Abre el navegador en `http://localhost:5173/auth`
2. Intenta registrar un nuevo usuario
3. Verifica que la autenticación funcione correctamente

## 🧪 Testing de Edge Functions

Puedes probar cada Edge Function individualmente:

### Registrar Usuario
```bash
curl -X POST https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/register \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3RyZWlkbGt1a2JhcXRscG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMDAyOTEsImV4cCI6MjA3NTg3NjI5MX0.QCxSziC5WuClVY58uoggWJPHJDGg42PlwdMbfr9GxwA" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123",
    "name": "Usuario Test",
    "role": "paciente"
  }'
```

### Iniciar Sesión
```bash
curl -X POST https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/login \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3RyZWlkbGt1a2JhcXRscG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMDAyOTEsImV4cCI6MjA3NTg3NjI5MX0.QCxSziC5WuClVY58uoggWJPHJDGg42PlwdMbfr9GxwA" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123"
  }'
```

## 📋 Checklist de Verificación

- [ ] Dependencia `@supabase/supabase-js` instalada
- [ ] Archivo `.env` existe y tiene las credenciales correctas
- [ ] Proyecto compila sin errores
- [ ] Registro de usuario funciona
- [ ] Login de usuario funciona
- [ ] Logout de usuario funciona
- [ ] Los tokens se guardan en localStorage

## 🐛 Solución de Problemas

### Error: Cannot find module '@supabase/supabase-js'
**Solución**: Ejecuta `bun add @supabase/supabase-js`

### Error: Missing Supabase environment variables
**Solución**: Verifica que el archivo `.env` existe y tiene las variables correctas

### Error de CORS
**Solución**: Verifica que las Edge Functions tengan configurados los headers CORS correctamente

### Error 401 Unauthorized
**Solución**: Verifica que la `apikey` en las peticiones sea correcta

## 📞 Soporte

Si encuentras algún problema:
1. Revisa el archivo `EDGE_FUNCTIONS_GUIDE.md`
2. Revisa el archivo `INTEGRATION_SUMMARY.md`
3. Verifica los logs en la consola del navegador
4. Verifica los logs de las Edge Functions en Supabase Dashboard

## ✅ Todo Listo

Una vez instalada la dependencia de Supabase, tu proyecto estará completamente funcional y conectado con el backend.
