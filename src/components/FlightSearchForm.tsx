import { useState } from 'react';
import { Search, Calendar, Users, MapPin } from 'lucide-react';

interface FlightSearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

export interface SearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  currencyCode: string;
  max: number;
}

export default function FlightSearchForm({ onSearch, loading }: FlightSearchFormProps) {
  const [formData, setFormData] = useState<SearchParams>({
    originLocationCode: '',
    destinationLocationCode: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    currencyCode: 'BRL',
    max: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = { ...formData };
    if (!searchParams.returnDate) {
      delete searchParams.returnDate;
    }
    onSearch(searchParams);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'adults' || name === 'max' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Buscar Voos</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Origem (Código IATA)
            </label>
            <input
              type="text"
              name="originLocationCode"
              value={formData.originLocationCode}
              onChange={handleChange}
              placeholder="Ex: GRU"
              required
              maxLength={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Destino (Código IATA)
            </label>
            <input
              type="text"
              name="destinationLocationCode"
              value={formData.destinationLocationCode}
              onChange={handleChange}
              placeholder="Ex: JFK"
              required
              maxLength={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Data de Ida
            </label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Data de Volta (Opcional)
            </label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              min={formData.departureDate || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Quantidade de Adultos
            </label>
            <select
              name="adults"
              value={formData.adults}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Adulto' : 'Adultos'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4" />
              Máximo de Resultados
            </label>
            <select
              name="max"
              value={formData.max}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5 resultados</option>
              <option value={10}>10 resultados</option>
              <option value={15}>15 resultados</option>
              <option value={20}>20 resultados</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Buscando...' : 'Buscar Voos'}
        </button>
      </form>
    </div>
  );
}
