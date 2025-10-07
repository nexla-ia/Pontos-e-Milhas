import type { NormalizedFlight, SearchParams } from '../types/flights';

const N8N_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

export interface N8nResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function buildN8nPayload(params: SearchParams, flights: NormalizedFlight[]) {
  return {
    source: 'amadeus',
    search: {
      origin: params.origem,
      destination: params.destino,
      date: params.dataIda,
      returnDate: params.somenteIda ? undefined : params.dataVolta || undefined,
      adults: params.adultos,
      children: params.criancas,
      infants: params.bebes,
      class: params.classe,
      currency: 'BRL',
      companies: params.companhias,
      sort: params.ordenacao,
    },
    flights: flights.map((flight) => ({
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departure: flight.departure,
      arrival: flight.arrival,
      duration: flight.duration,
      stops: flight.stops,
      aircraft: flight.aircraft,
      operatedBy: flight.operatedBy,
      fareFrom: flight.fareFrom,
      miles: flight.miles,
      type: flight.type,
      signature: flight.signature,
    })),
  };
}

export async function sendToN8n(payload: unknown): Promise<N8nResponse> {
  if (!N8N_URL) {
    console.warn('[n8n] Webhook não configurado. Ignorando envio.');
    return { ok: false, error: 'N8N webhook URL não configurada' };
  }

  try {
    console.log('[n8n] Enviando payload', payload);
    const response = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status} - ${text}`);
    }

    const data = await response.json().catch(() => undefined);
    console.log('[n8n] Envio concluído');
    return { ok: true, data };
  } catch (error) {
    console.error('[n8n] Erro ao enviar payload', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
