import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = await req.json();
    console.log('Recebido do n8n:', JSON.stringify(payload));

    const { search_id, flights } = payload;

    if (!search_id) {
      throw new Error('search_id é obrigatório');
    }

    const { error: updateError } = await supabase
      .from('flight_searches')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('search_id', search_id);

    if (updateError) {
      console.error('Erro ao atualizar search:', updateError);
      throw updateError;
    }

    if (flights && flights.length > 0) {
      const flightRecords = flights.map((flight: any) => ({
        search_id: search_id,
        airline: flight.airline,
        flight_number: flight.flightNumber,
        origin: flight.origin,
        destination: flight.destination,
        departure: flight.departure,
        arrival: flight.arrival,
        duration: flight.duration,
        stops: flight.stops,
        aircraft: flight.aircraft,
        price_currency: flight.price.currency,
        price_total: flight.price.total,
      }));

      const { error: insertError } = await supabase
        .from('flight_results')
        .insert(flightRecords);

      if (insertError) {
        console.error('Erro ao inserir voos:', insertError);
        throw insertError;
      }

      console.log(`${flights.length} voos inseridos com sucesso`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dados salvos com sucesso',
        flights_saved: flights?.length || 0
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Erro:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
