import { useState, useEffect } from 'react';
import { Plane, AlertCircle } from 'lucide-react';
import FlightSearchForm, { SearchParams } from './FlightSearchForm';
import { supabase } from '../lib/supabase';

export default function FlightSearchPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);

  useEffect(() => {
    if (!searchId) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data: search, error: searchError } = await supabase
          .from('flight_searches')
          .select('status')
          .eq('search_id', searchId)
          .single();

        if (searchError) throw searchError;

        if (search.status === 'completed') {
          const { data: flights, error: flightsError } = await supabase
            .from('flight_results')
            .select('*')
            .eq('search_id', searchId)
            .order('price_total', { ascending: true });

          if (flightsError) throw flightsError;

          setResults(flights || []);
          setLoading(false);
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error('Erro ao verificar status:', err);
      }
    }, 2000);

    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (loading) {
        setError('Tempo limite de busca excedido. Tente novamente.');
        setLoading(false);
      }
    }, 60000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [searchId, loading]);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSearchId(null);

    try {
      const { data: searchRecord, error: insertError } = await supabase
        .from('flight_searches')
        .insert({
          origin: params.originLocationCode,
          destination: params.destinationLocationCode,
          departure_date: params.departureDate,
          return_date: params.returnDate || null,
          adults: params.adults,
          currency: params.currencyCode || 'BRL',
          status: 'pending'
        })
        .select('search_id')
        .single();

      if (insertError) throw insertError;

      const newSearchId = searchRecord.search_id;
      setSearchId(newSearchId);

      const payload = {
        search_id: newSearchId,
        source: "amadeus",
        search: {
          origin: params.originLocationCode,
          destination: params.destinationLocationCode,
          date: params.departureDate,
          returnDate: params.returnDate || null,
          adults: params.adults,
          currency: params.currencyCode || 'BRL'
        }
      };

      console.log('Enviando para n8n:', payload);

      fetch('https://n8n.nexladesenvolvimento.com.br/webhook/pesquisaVoo', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(() => {
          console.log('Webhook enviado');
        })
        .catch(err => {
          console.error('Erro ao enviar para n8n:', err);
        });

    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar busca. Tente novamente.');
      console.error('Erro na busca:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Busca de Voos</h1>
          </div>
          <p className="text-gray-600">Encontre as melhores opções de voos com a API Amadeus</p>
        </div>

        <FlightSearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Buscando voos disponíveis...</p>
            <p className="text-gray-500 text-sm mt-2">Aguardando resposta do sistema de busca</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {results.length} voos encontrados
            </h2>
            {results.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Plane className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">
                        {flight.airline}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {flight.flight_number}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Origem</p>
                        <p className="font-semibold text-gray-800">{flight.origin}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(flight.departure).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Destino</p>
                        <p className="font-semibold text-gray-800">{flight.destination}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(flight.arrival).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duração</p>
                        <p className="font-semibold text-gray-800">{flight.duration}</p>
                        <p className="text-sm text-gray-600">
                          {flight.stops === 0 ? 'Direto' : `${flight.stops} parada(s)`}
                        </p>
                      </div>
                    </div>

                    {flight.aircraft && (
                      <p className="text-sm text-gray-500">
                        Aeronave: {flight.aircraft}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-sm text-gray-500 mb-1">Preço total</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {flight.price_currency} {parseFloat(flight.price_total).toFixed(2)}
                    </p>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                      Selecionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && searchId && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Nenhum voo encontrado para sua busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
