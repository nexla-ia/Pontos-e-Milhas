import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Plane, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Flight {
  id: string;
  type: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate?: string;
  numberOfBookableSeats: number;
  itineraries: any[];
  price: {
    currency: string;
    total: string;
    base: string;
    fees?: any[];
    grandTotal: string;
  };
  pricingOptions: any;
  validatingAirlineCodes: string[];
  travelerPricings: any[];
}

export default function ResultadosVoosPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      if (event.detail.page === 'Resultados dos Voos') {
        console.log('📥 Recebendo dados da navegação:', event.detail);

        try {
          if (!event.detail.data) {
            setError('Nenhum dado foi retornado do servidor.');
            setFlights([]);
            return;
          }

          // Dados vieram diretamente do n8n
          const responseData = event.detail.data;

          // Verificar se é array direto ou está dentro de uma propriedade
          let offers: Flight[] = [];

          if (Array.isArray(responseData)) {
            offers = responseData;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            offers = responseData.data;
          } else if (responseData.offers && Array.isArray(responseData.offers)) {
            offers = responseData.offers;
          } else {
            console.error('❌ Formato não reconhecido:', responseData);
            setError('Formato de resposta não reconhecido.');
            setFlights([]);
            return;
          }

          console.log('✅ Ofertas processadas:', offers.length, 'voo(s)');

          // Aceitar array vazio (não é erro)
          setFlights(offers);
          setError(offers.length === 0 ? 'Nenhum voo encontrado para os parâmetros informados.' : null);

        } catch (err: any) {
          console.error('❌ Erro ao processar dados:', err);
          setError(err?.message || 'Erro ao processar dados recebidos.');
          setFlights([]);
        } finally {
          setLoading(false); // SEMPRE desliga o loading
        }
      }
    };

    window.addEventListener('navigate', handleNavigate as EventListener);

    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para busca
          </button>

          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Buscando voos disponíveis...</h2>
            <p className="text-gray-600">Aguardando resposta do sistema de busca</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para busca
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Erro na busca</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para busca
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {flights.length} voos encontrados
        </h1>

        {flights.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhum voo encontrado</h2>
            <p className="text-gray-600">Tente ajustar os parâmetros de busca</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flights.map((flight, index) => {
              // Extrair dados do primeiro itinerário
              const firstItinerary = flight.itineraries?.[0];
              const firstSegment = firstItinerary?.segments?.[0];
              const lastSegment = firstItinerary?.segments?.[firstItinerary.segments.length - 1];

              const origin = firstSegment?.departure?.iataCode || 'N/A';
              const destination = lastSegment?.arrival?.iataCode || 'N/A';
              const departure = firstSegment?.departure?.at || '';
              const arrival = lastSegment?.arrival?.at || '';
              const duration = firstItinerary?.duration || 'N/A';
              const stops = (firstItinerary?.segments?.length || 1) - 1;
              const airline = firstSegment?.carrierCode || 'N/A';
              const flightNumber = `${firstSegment?.carrierCode || ''}${firstSegment?.number || ''}`;
              const aircraft = firstSegment?.aircraft?.code || '';

              return (
                <div
                  key={flight.id || index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <Plane className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-800 text-lg">
                          {airline}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {flightNumber}
                        </span>
                        {flight.numberOfBookableSeats <= 5 && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {flight.numberOfBookableSeats} assentos restantes
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-500">Origem</p>
                          </div>
                          <p className="font-bold text-gray-800 text-xl">{origin}</p>
                          {departure && (
                            <>
                              <p className="text-sm text-gray-600">
                                {new Date(departure).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(departure).toLocaleDateString('pt-BR')}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-500">Duração</p>
                          </div>
                          <p className="font-semibold text-gray-800">
                            {duration.replace('PT', '').replace('H', 'h ').replace('M', 'min')}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {stops === 0 ? '✓ Direto' : `${stops} parada(s)`}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-500">Destino</p>
                          </div>
                          <p className="font-bold text-gray-800 text-xl">{destination}</p>
                          {arrival && (
                            <>
                              <p className="text-sm text-gray-600">
                                {new Date(arrival).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(arrival).toLocaleDateString('pt-BR')}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {aircraft && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Plane className="w-4 h-4" />
                          <span>Aeronave: {aircraft}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-8">
                      <p className="text-sm text-gray-500 mb-1">Preço total</p>
                      <p className="text-4xl font-bold text-blue-600 mb-4">
                        {flight.price.currency} {parseFloat(flight.price.grandTotal).toFixed(2)}
                      </p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg">
                        Selecionar Voo
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
