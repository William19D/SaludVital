import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const specialization = url.searchParams.get('specialization');

    let query = supabase
      .from('doctors')
      .select(`
        id,
        specialization,
        is_available,
        profiles!inner(
          id,
          full_name,
          email,
          is_active
        )
      `)
      .eq('is_available', true)
      .eq('profiles.is_active', true);

    if (specialization) {
      query = query.eq('specialization', specialization);
    }

    const { data: doctors, error } = await query.order('profiles(full_name)');

    if (error) {
      throw new Error('Error obteniendo doctores: ' + error.message);
    }

    // Obtener especialidades únicas
    const { data: specializations, error: specError } = await supabase
      .from('doctors')
      .select('specialization')
      .eq('is_available', true);

    if (specError) {
      console.log('Error obteniendo especialidades:', specError);
    }

    const uniqueSpecializations = specializations 
      ? [...new Set(specializations.map(d => d.specialization))].sort()
      : [];

    return new Response(JSON.stringify({
      success: true,
      data: {
        doctors: doctors || [],
        specializations: uniqueSpecializations
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});