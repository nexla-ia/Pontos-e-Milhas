import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, MapPin, Plane, Users } from 'lucide-react';
import type { FormErrors, SearchParams } from '../types/flights';
import { sanitizeSearchParams, validateSearchParams } from '../utils/validation';

interface FlightSearchFormProps {
  onSubmit: (params: SearchParams) => void;
  loading?: boolean;
  initialValues?: Partial<SearchParams>;
}

const COMPANIES = [
  { id: 'G3', label: 'GOL' },
  { id: 'AZ', label: 'Azul' },
  { id: 'LA', label: 'LATAM' },
  { id: 'JJ', label: 'LATAM Brasil' },
  { id: 'AV', label: 'Avianca' },
  { id: 'CM', label: 'Copa Airlines' },
];

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  origem: '',
  destino: '',
  dataIda: '',
  dataVolta: '',
  somenteIda: false,
  adultos: 1,
  criancas: 0,
  bebes: 0,
  classe: 'economica',
  companhias: COMPANIES.map((company) => company.id),
  ordenacao: 'BEST',
};

export default function FlightSearchForm({ onSubmit, loading = false, initialValues }: FlightSearchFormProps) {
  const [formState, setFormState] = useState<SearchParams>({
    ...DEFAULT_SEARCH_PARAMS,
    ...initialValues,
    companhias: initialValues?.companhias ?? DEFAULT_SEARCH_PARAMS.companhias,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassengers, setShowPassengers] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);

  const totalPassengers = useMemo(
    () => formState.adultos + formState.criancas + formState.bebes,
    [formState.adultos, formState.criancas, formState.bebes],
  );

  useEffect(() => {
    if (initialValues) {
      setFormState((prev) => ({
        ...prev,
        ...initialValues,
        companhias: initialValues.companhias ?? prev.companhias,
      }));
    }
  }, [initialValues]);

  const handleChange = (field: keyof SearchParams, value: string | number | boolean | string[]) => {
    setFormState((prev) => {
      const next: SearchParams = {
        ...prev,
        [field]: value,
      } as SearchParams;

      if (field === 'somenteIda' && value === true) {
        next.dataVolta = '';
      }

      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handlePassengerChange = (field: 'adultos' | 'criancas' | 'bebes', increment: boolean) => {
    setFormState((prev) => {
      const current = prev[field];
      const delta = increment ? 1 : -1;
      let nextValue = current + delta;

      if (field === 'adultos') {
        nextValue = Math.max(1, Math.min(9, nextValue));
      } else {
        nextValue = Math.max(0, Math.min(9, nextValue));
      }

      return {
        ...prev,
        [field]: nextValue,
      };
    });
  };

  const toggleCompany = (companyId: string) => {
    setFormState((prev) => {
      const exists = prev.companhias.includes(companyId);
      const nextCompanies = exists
        ? prev.companhias.filter((id) => id !== companyId)
        : [...prev.companhias, companyId];

      return {
        ...prev,
        companhias: nextCompanies,
      };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitized = sanitizeSearchParams(formState);
    const validationErrors = validateSearchParams(sanitized);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit(sanitized);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4" /> Origem (IATA)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
            maxLength={3}
            value={formState.origem}
            onChange={(event) => handleChange('origem', event.target.value.toUpperCase())}
            placeholder="GRU"
          />
          {errors.origem && <p className="text-sm text-red-600 mt-1">{errors.origem}</p>}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4" /> Destino (IATA)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
            maxLength={3}
            value={formState.destino}
            onChange={(event) => handleChange('destino', event.target.value.toUpperCase())}
            placeholder="CGB"
          />
          {errors.destino && <p className="text-sm text-red-600 mt-1">{errors.destino}</p>}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" /> Data de ida
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min={today}
            value={formState.dataIda}
            onChange={(event) => handleChange('dataIda', event.target.value)}
          />
          {errors.dataIda && <p className="text-sm text-red-600 mt-1">{errors.dataIda}</p>}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" /> Data de volta
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            min={formState.dataIda || today}
            value={formState.dataVolta}
            onChange={(event) => handleChange('dataVolta', event.target.value)}
            disabled={formState.somenteIda}
          />
          {errors.dataVolta && <p className="text-sm text-red-600 mt-1">{errors.dataVolta}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4" /> Passageiros
          </label>
          <div className="relative">
            <button
              type="button"
              className="w-full flex justify-between items-center px-4 py-3 border border-gray-300 rounded-lg"
              onClick={() => setShowPassengers((prev) => !prev)}
            >
              <span>{totalPassengers} passageiro(s)</span>
              {showPassengers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showPassengers && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
                {(['adultos', 'criancas', 'bebes'] as const).map((field) => (
                  <div key={field} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{field}</p>
                      <p className="text-sm text-gray-500">
                        {field === 'adultos'
                          ? '12+ anos'
                          : field === 'criancas'
                            ? '2-11 anos'
                            : '0-1 anos'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center"
                        onClick={() => handlePassengerChange(field, false)}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-semibold">{formState[field]}</span>
                      <button
                        type="button"
                        className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center"
                        onClick={() => handlePassengerChange(field, true)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.passageiros && <p className="text-sm text-red-600 mt-1">{errors.passageiros}</p>}
        </div>

        <div className="grid gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Plane className="w-4 h-4" /> Classe de voo
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formState.classe}
            onChange={(event) => handleChange('classe', event.target.value as SearchParams['classe'])}
          >
            <option value="economica">Econômica</option>
            <option value="executiva">Executiva</option>
          </select>
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formState.somenteIda}
              onChange={(event) => handleChange('somenteIda', event.target.checked)}
              className="h-4 w-4"
            />
            Somente ida
          </label>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="flex w-full justify-between items-center px-4 py-3 border border-gray-300 rounded-lg"
          onClick={() => setShowCompanies((prev) => !prev)}
        >
          <span>Companhias ({formState.companhias.length})</span>
          {showCompanies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showCompanies && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {COMPANIES.map((company) => {
              const checked = formState.companhias.includes(company.id);
              return (
                <label key={company.id} className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:border-blue-400">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCompany(company.id)}
                  />
                  {company.label}
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Ordenar por</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formState.ordenacao}
            onChange={(event) => handleChange('ordenacao', event.target.value as SearchParams['ordenacao'])}
          >
            <option value="BEST">Melhor Resultado</option>
            <option value="CHEAPEST">Mais Barato</option>
            <option value="FASTEST">Mais Rápido</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {formState.companhias.length === 0
            ? 'Selecione ao menos uma companhia para resultados mais relevantes.'
            : `${formState.companhias.length} companhia(s) selecionada(s)`}
        </p>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Buscando voos...' : 'Buscar voos'}
        </button>
      </div>
    </form>
  );
}
