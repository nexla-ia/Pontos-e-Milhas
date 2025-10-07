import { Plane, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  outbound: {
    departure: {
      airport: string;
      time: string;
    };
    arrival: {
      airport: string;
      time: string;
    };
    duration: string;
    stops: number;
  };
  return: {
    departure: {
      airport: string;
      time: string;
    };
    arrival: {
      airport: string;
      time: string;
    };
    duration: string;
    stops: number;
  } | null;
  aircraft: string;
  price: {
    total: string;
    currency: string;
  };
}

interface FlightResultsProps {
  results: FlightResult[];
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  return `${hours}h ${minutes}m`;
}

function formatTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function FlightResults({ results }: FlightResultsProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Nenhum voo encontrado. Tente ajustar os critérios de busca.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        {results.length} {results.length === 1 ? 'Voo Encontrado' : 'Voos Encontrados'}
      </h3>

      {results.map((flight) => (
        <div key={flight.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Plane className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{flight.airline}</h4>
                  <p className="text-sm text-gray-500">Voo {flight.flightNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">IDA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatTime(flight.outbound.departure.time)}
                      </p>
                      <p className="text-sm text-gray-600">{flight.outbound.departure.airport}</p>
                      <p className="text-xs text-gray-500">{formatDate(flight.outbound.departure.time)}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center mx-4">
                      <ArrowRight className="w-6 h-6 text-gray-400 mb-1" />
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(flight.outbound.duration)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {flight.outbound.stops === 0
                          ? 'Direto'
                          : `${flight.outbound.stops} ${flight.outbound.stops === 1 ? 'parada' : 'paradas'}`}
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatTime(flight.outbound.arrival.time)}
                      </p>
                      <p className="text-sm text-gray-600">{flight.outbound.arrival.airport}</p>
                      <p className="text-xs text-gray-500">{formatDate(flight.outbound.arrival.time)}</p>
                    </div>
                  </div>
                </div>

                {flight.return && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-600">VOLTA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          {formatTime(flight.return.departure.time)}
                        </p>
                        <p className="text-sm text-gray-600">{flight.return.departure.airport}</p>
                        <p className="text-xs text-gray-500">{formatDate(flight.return.departure.time)}</p>
                      </div>

                      <div className="flex-1 flex flex-col items-center mx-4">
                        <ArrowRight className="w-6 h-6 text-gray-400 mb-1" />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(flight.return.duration)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {flight.return.stops === 0
                            ? 'Direto'
                            : `${flight.return.stops} ${flight.return.stops === 1 ? 'parada' : 'paradas'}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          {formatTime(flight.return.arrival.time)}
                        </p>
                        <p className="text-sm text-gray-600">{flight.return.arrival.airport}</p>
                        <p className="text-xs text-gray-500">{formatDate(flight.return.arrival.time)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Aeronave: {flight.aircraft}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:border-l lg:pl-6 flex flex-col items-center lg:items-end justify-center">
              <p className="text-sm text-gray-500 mb-2">Preço Total</p>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {parseFloat(flight.price.total).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: flight.price.currency,
                })}
              </p>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Selecionar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
