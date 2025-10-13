/**
 * Exportaciones centralizadas de Supabase
 * Importa todo desde aquí para facilitar el uso
 */

// Cliente de Supabase
export { supabase } from './supabase';

// Edge Functions
export * from './edgeFunctions';

// Re-exportación por defecto
import edgeFunctions from './edgeFunctions';
export default edgeFunctions;
