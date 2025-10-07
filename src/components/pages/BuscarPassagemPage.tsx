import { AlertCircle, Plane } from 'lucide-react';
import { useMemo, useState } from 'react';
import FlightSearchForm, { DEFAULT_SEARCH_PARAMS } from '../FlightSearchForm';
import FlightResults from '../FlightResults';
import type { NormalizedFlight, SearchParams } from '../../types/flights';
import { searchFlights } from '../../services/search';
import { buildN8nPayload, sendToN8n } from '../../services/n8n';
import { sortFlights } from '../../utils/sorting';

const N8N_AVAILABLE = Boolean(import.meta.env.VITE_N8N_WEBHOOK_URL);

export default function BuscarPassagemPage() {
  const [flights, setFlights] = useState<NormalizedFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS);
  const [sendingToN8n, setSendingToN8n] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const canSendToN8n = useMemo(() => N8N_AVAILABLE && flights.length > 0, [flights.length]);

  const handleSearch = async (params: SearchParams) => {
    console.log('[BuscarPassagemPage] Iniciando busca com parâmetros', params);
    setLoading(true);
    setError(null);
    setSyncMessage(null);
    setLastParams(params);

    try {
      const results = await searchFlights(params);
      setFlights(results);
    } catch (err) {
      console.error('[BuscarPassagemPage] Erro ao buscar voos', err);
      setError('Não foi possível buscar voos. Tente novamente mais tarde.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToN8n = async () => {
    if (!canSendToN8n) {
      return;
    }

    try {
      setSendingToN8n(true);
      const payload = buildN8nPayload(lastParams, flights);
      const response = await sendToN8n(payload);

      if (response.ok) {
        setSyncMessage('Resultados enviados com sucesso.');
      } else {
        setSyncMessage(response.error ?? 'Falha ao enviar resultados.');
      }
    } finally {
      setSendingToN8n(false);
    }
  };

  const sortedFlights = useMemo(
    () => sortFlights(flights, lastParams.ordenacao),
    [flights, lastParams.ordenacao],
  );

  return (
    <section className="space-y-8">
      <header className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Plane className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Busca de voos</h1>
        </div>
        <p className="text-gray-600">Informe os detalhes da viagem para encontrar as melhores opções disponíveis.</p>
      </header>

      <FlightSearchForm onSubmit={handleSearch} loading={loading} initialValues={lastParams} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao buscar voos</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <FlightResults
        flights={sortedFlights}
        loading={loading}
        onSendToN8n={canSendToN8n ? handleSendToN8n : undefined}
        n8nEnabled={N8N_AVAILABLE}
        sending={sendingToN8n}
        lastSyncMessage={syncMessage}
      />
    </section>
  );
}
