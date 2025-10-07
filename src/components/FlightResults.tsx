import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock, Plane, ShieldCheck, Ticket, Timer } from 'lucide-react';
import type { NormalizedFlight, SearchParams } from '../types/flights';

interface FlightResultsProps {
  flights: NormalizedFlight[];
  loading?: boolean;
  pageSize?: number;
  onSendToN8n?: () => void;
  n8nEnabled?: boolean;
  sending?: boolean;
  lastSyncMessage?: string | null;
}

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Indisponível';
  }

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatDuration = (duration: string) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) {
    return duration;
  }

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.join(' ') || '0m';
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { dateText: 'Data inválida', timeText: '--:--' };
  }

  const dateText = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
  const timeText = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return { dateText, timeText };
};

function LoadingSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="h-5 bg-gray-200 rounded w-32" />
      <div className="h-8 bg-gray-200 rounded" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-16 bg-gray-100 rounded" />
        <div className="h-16 bg-gray-100 rounded" />
        <div className="h-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function FlightResults({
  flights,
  loading = false,
  pageSize = 5,
  onSendToN8n,
  n8nEnabled = false,
  sending = false,
  lastSyncMessage,
}: FlightResultsProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [flights]);

  const totalPages = Math.max(1, Math.ceil(flights.length / pageSize));
  const paginatedFlights = useMemo(
    () => flights.slice((page - 1) * pageSize, page * pageSize),
    [flights, page, pageSize],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
        <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Nenhum voo encontrado para os critérios informados.</p>
        <p className="text-gray-400 text-sm mt-2">Revise as datas, destinos e companhias selecionadas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800">{flights.length} voo(s) encontrado(s)</h3>
          <p className="text-sm text-gray-500">Mostrando {paginatedFlights.length} de {flights.length} resultados</p>
        </div>
        {onSendToN8n && (
          <div className="flex flex-col gap-2 sm:items-end">
            <button
              type="button"
              disabled={!n8nEnabled || sending}
              onClick={onSendToN8n}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300"
            >
              <ShieldCheck className="w-4 h-4" />
              {sending ? 'Enviando...' : 'Enviar ao n8n'}
            </button>
            {lastSyncMessage && <span className="text-xs text-gray-500">{lastSyncMessage}</span>}
          </div>
        )}
      </header>

      <div className="space-y-4">
        {paginatedFlights.map((flight) => {
          const departure = formatDateTime(flight.departure);
          const arrival = formatDateTime(flight.arrival);

          return (
            <article key={flight.signature} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{flight.airline}</h4>
                    <p className="text-sm text-gray-500">Voo {flight.flightNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">A partir de</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(flight.fareFrom)}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-500">Partida</p>
                  <p className="text-2xl font-semibold text-gray-800">{departure.timeText}</p>
                  <p className="text-sm text-gray-500">{departure.dateText}</p>
                  <p className="text-sm text-gray-600 mt-1">{flight.origin}</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-blue-500" />
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(flight.duration)}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {flight.type} {flight.stops > 0 && `(${flight.stops} parada${flight.stops > 1 ? 's' : ''})`}
                  </div>
                </div>

                <div className="border border-gray-100 rounded-lg p-4 text-right">
                  <p className="text-xs uppercase text-gray-500">Chegada</p>
                  <p className="text-2xl font-semibold text-gray-800">{arrival.timeText}</p>
                  <p className="text-sm text-gray-500">{arrival.dateText}</p>
                  <p className="text-sm text-gray-600 mt-1">{flight.destination}</p>
                </div>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Ticket className="w-4 h-4 text-blue-500" />
                  <span>Tarifa exibida: {formatCurrency(flight.fareFrom)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Timer className="w-4 h-4 text-blue-500" />
                  <span>Assinatura: {flight.signature}</span>
                </div>
                {flight.aircraft && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Plane className="w-4 h-4 text-blue-500" />
                    <span>Aeronave: {flight.aircraft}</span>
                  </div>
                )}
                {flight.operatedBy && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Operado por: {flight.operatedBy}</span>
                  </div>
                )}
                {typeof flight.miles === 'number' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Ticket className="w-4 h-4 text-blue-500" />
                    <span>Milhas estimadas: {flight.miles.toLocaleString('pt-BR')}</span>
                  </div>
                )}
              </dl>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <footer className="flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </button>
        </footer>
      )}
    </div>
  );
}

export type SortMode = SearchParams['ordenacao'];
