import type { NormalizedFlight, SearchParams } from '../types/flights';
import { sanitizeSearchParams } from '../utils/validation';
import { sortFlights } from '../utils/sorting';

export type SimplifiedOffer = {
  id?: string;
  airline?: string;
  flightNumber?: string;
  outbound?: {
    departure?: { airport?: string; time?: string };
    arrival?: { airport?: string; time?: string };
    duration?: string;
    stops?: number;
    operatedBy?: string;
  };
  price?: { total?: string | number; currency?: string; base?: string | number };
  aircraft?: string;
  operatedBy?: string;
  signature?: string;
  miles?: number | null;
};

const AIRLINE_LABELS: Record<string, string> = {
  AZ: 'Azul Linhas Aéreas',
  G3: 'GOL Linhas Aéreas',
  LA: 'LATAM Airlines',
  JJ: 'LATAM Airlines Brasil',
  AV: 'Avianca',
  CM: 'Copa Airlines',
};

const runtimeEnv = (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string | undefined> }).env)
  || {};
const SUPABASE_URL = runtimeEnv.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = runtimeEnv.VITE_SUPABASE_ANON_KEY;

const signatureOf = (flight: Pick<NormalizedFlight, 'airline' | 'flightNumber' | 'departure' | 'arrival'>): string =>
  [flight.airline, flight.flightNumber, flight.departure, flight.arrival].join('|');

function toAmadeusPayload(params: SearchParams) {
  return {
    originLocationCode: params.origem,
    destinationLocationCode: params.destino,
    departureDate: params.dataIda,
    returnDate: params.somenteIda ? undefined : params.dataVolta || undefined,
    adults: params.adultos,
    currencyCode: 'BRL',
    max: 20,
  };
}

export function normalizeOffer(offer: SimplifiedOffer): NormalizedFlight | null {
  const airlineCode = offer.airline ?? offer.flightNumber?.slice(0, 2) ?? '';
  const airlineName = AIRLINE_LABELS[airlineCode] ?? offer.airline ?? airlineCode ?? 'Companhia Desconhecida';

  const departure = offer.outbound?.departure?.time ?? '';
  const arrival = offer.outbound?.arrival?.time ?? '';
  if (!departure || !arrival) {
    return null;
  }

  const flightNumber = offer.flightNumber ?? '---';
  const stops = offer.outbound?.stops ?? 0;
  const duration = offer.outbound?.duration ?? 'PT0M';
  const rawFare = offer.price?.total ?? offer.price?.base;
  const fareFrom = typeof rawFare === 'string' ? Number.parseFloat(rawFare) : rawFare;

  const normalized: NormalizedFlight = {
    signature: offer.signature ?? signatureOf({
      airline: airlineName,
      flightNumber,
      departure,
      arrival,
    }),
    airline: airlineName,
    flightNumber,
    origin: offer.outbound?.departure?.airport ?? '',
    destination: offer.outbound?.arrival?.airport ?? '',
    departure,
    arrival,
    duration,
    stops,
    aircraft: offer.aircraft,
    operatedBy: offer.operatedBy ?? offer.outbound?.operatedBy,
    type: stops === 0 ? 'Direto' : 'Paradas',
    fareFrom: Number.isFinite(fareFrom ?? Number.NaN) ? fareFrom ?? undefined : undefined,
    miles: offer.miles ?? null,
  };

  normalized.signature = normalized.signature || signatureOf(normalized);
  return normalized;
}

export function deduplicateFlights(flights: NormalizedFlight[]): NormalizedFlight[] {
  const seen = new Set<string>();
  const result: NormalizedFlight[] = [];

  for (const flight of flights) {
    if (!seen.has(flight.signature)) {
      seen.add(flight.signature);
      result.push(flight);
    }
  }

  return result;
}

function buildMockFlights(params: SearchParams): NormalizedFlight[] {
  const baseDeparture = `${params.dataIda}T08:00:00`;
  const baseArrival = `${params.dataIda}T11:15:00`;
  const flights: NormalizedFlight[] = [
    {
      signature: signatureOf({
        airline: 'GOL Linhas Aéreas',
        flightNumber: 'G3 1448',
        departure: baseDeparture,
        arrival: baseArrival,
      }),
      airline: 'GOL Linhas Aéreas',
      flightNumber: 'G3 1448',
      origin: params.origem,
      destination: params.destino,
      departure: baseDeparture,
      arrival: baseArrival,
      duration: 'PT3H15M',
      stops: 0,
      aircraft: 'BOEING 737',
      operatedBy: 'GOL',
      type: 'Direto',
      fareFrom: 1280.9,
      miles: 8900,
    },
    {
      signature: signatureOf({
        airline: 'Azul Linhas Aéreas',
        flightNumber: 'AD 2508',
        departure: `${params.dataIda}T13:40:00`,
        arrival: `${params.dataIda}T18:05:00`,
      }),
      airline: 'Azul Linhas Aéreas',
      flightNumber: 'AD 2508',
      origin: params.origem,
      destination: params.destino,
      departure: `${params.dataIda}T13:40:00`,
      arrival: `${params.dataIda}T18:05:00`,
      duration: 'PT4H25M',
      stops: 1,
      aircraft: 'AIRBUS A320',
      operatedBy: 'Azul',
      type: 'Paradas',
      fareFrom: 980.5,
      miles: 7200,
    },
  ];

  return flights;
}

async function fetchOffers(params: SearchParams): Promise<SimplifiedOffer[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[searchFlights] Supabase não configurado, usando mock local');
    return [];
  }

  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/flight-search`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(toAmadeusPayload(params)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao buscar voos: ${response.status} - ${text}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data as SimplifiedOffer[];
  }

  if (Array.isArray(data?.results)) {
    return data.results as SimplifiedOffer[];
  }

  return [];
}

export async function searchFlights(input: SearchParams): Promise<NormalizedFlight[]> {
  const params = sanitizeSearchParams(input);
  console.log('[searchFlights] Iniciando busca', params);

  try {
    const offers = await fetchOffers(params);
    console.log('[searchFlights] Ofertas recebidas', offers.length);

    const normalized = offers
      .map((offer) => normalizeOffer(offer))
      .filter((flight): flight is NormalizedFlight => Boolean(flight));

    const deduped = deduplicateFlights(normalized);
    console.log('[searchFlights] Após normalização', deduped.length);

    if (deduped.length === 0) {
      const fallback = buildMockFlights(params);
      console.log('[searchFlights] Utilizando fallback mock', fallback.length);
      return sortFlights(fallback, params.ordenacao);
    }

    return sortFlights(deduped, params.ordenacao);
  } catch (error) {
    console.error('[searchFlights] Erro durante busca', error);
    const fallback = buildMockFlights(params);
    return sortFlights(fallback, params.ordenacao);
  }
}

export { signatureOf };
