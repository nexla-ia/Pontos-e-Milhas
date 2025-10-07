import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Plane, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Airport {
  ident: string;
  name: string;
  iata_code: string;
  municipality: string;
}

interface SearchParams {
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  somenteIda: boolean;
  adultos: number;
  criancas: number;
  bebes: number;
  classe: 'economica' | 'executiva';
  companhias: string[];
  ordenacao: 'BEST' | 'CHEAPEST' | 'FASTEST';
}

interface FormErrors {
  [key: string]: string;
}

const companhiasDisponiveis = [
  { id: 'azul', name: 'Azul', checked: true },
  { id: 'gol', name: 'GOL', checked: true },
  { id: 'latam', name: 'LATAM', checked: true },
  { id: 'tam', name: 'TAM', checked: true },
  { id: 'avianca', name: 'Avianca', checked: false },
  { id: 'copa', name: 'Copa Airlines', checked: false }
];

export default function BuscarPassagemPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origem: '',
    destino: '',
    dataIda: '',
    dataVolta: '',
    somenteIda: false,
    adultos: 1,
    criancas: 0,
    bebes: 0,
    classe: 'economica',
    companhias: companhiasDisponiveis.filter(c => c.checked).map(c => c.id),
    ordenacao: 'BEST'
  });

  const [airports, setAirports] = useState<Airport[]>([]);
  const [origemSuggestions, setOrigemSuggestions] = useState<Airport[]>([]);
  const [destinoSuggestions, setDestinoSuggestions] = useState<Airport[]>([]);
  const [showOrigemSuggestions, setShowOrigemSuggestions] = useState(false);
  const [showDestinoSuggestions, setShowDestinoSuggestions] = useState(false);
  const [passageirosOpen, setPassageirosOpen] = useState(false);
  const [companhiasOpen, setCompanhiasOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      const { data, error } = await supabase
        .from('airports')
        .select('ident, name, iata_code, municipality')
        .not('iata_code', 'is', null)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setAirports(data);
      }
    } catch (error) {
      console.error('Erro ao carregar aeroportos:', error);
      // Dados mock para demonstração
      setAirports([
        { ident: 'SBGR', name: 'Aeroporto Internacional de São Paulo/Guarulhos', iata_code: 'GRU', municipality: 'São Paulo' },
        { ident: 'SBSP', name: 'Aeroporto de Congonhas', iata_code: 'CGH', municipality: 'São Paulo' },
        { ident: 'SBRJ', name: 'Aeroporto Santos Dumont', iata_code: 'SDU', municipality: 'Rio de Janeiro' },
        { ident: 'SBGL', name: 'Aeroporto Internacional do Galeão', iata_code: 'GIG', municipality: 'Rio de Janeiro' },
        { ident: 'SBBR', name: 'Aeroporto Internacional de Brasília', iata_code: 'BSB', municipality: 'Brasília' },
        { ident: 'SBSV', name: 'Aeroporto Internacional de Salvador', iata_code: 'SSA', municipality: 'Salvador' }
      ]);
    }
  };

  const searchAirports = (query: string, type: 'origem' | 'destino') => {
    if (query.length < 2) {
      if (type === 'origem') {
        setOrigemSuggestions([]);
        setShowOrigemSuggestions(false);
      } else {
        setDestinoSuggestions([]);
        setShowDestinoSuggestions(false);
      }
      return;
    }

    const filtered = airports.filter(airport => 
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.iata_code.toLowerCase().includes(query.toLowerCase()) ||
      airport.municipality.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    if (type === 'origem') {
      setOrigemSuggestions(filtered);
      setShowOrigemSuggestions(true);
    } else {
      setDestinoSuggestions(filtered);
      setShowDestinoSuggestions(true);
    }
  };

  const handleInputChange = (field: keyof SearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Buscar aeroportos
    if (field === 'origem' && typeof value === 'string') {
      searchAirports(value, 'origem');
    } else if (field === 'destino' && typeof value === 'string') {
      searchAirports(value, 'destino');
    }
  };

  const selectAirport = (airport: Airport, type: 'origem' | 'destino') => {
    const displayText = `${airport.iata_code} - ${airport.name}`;
    handleInputChange(type, displayText);
    
    if (type === 'origem') {
      setShowOrigemSuggestions(false);
    } else {
      setShowDestinoSuggestions(false);
    }
  };

  const updatePassengerCount = (type: 'adultos' | 'criancas' | 'bebes', increment: boolean) => {
    const currentValue = searchParams[type];
    let newValue = increment ? currentValue + 1 : currentValue - 1;
    
    // Validações
    if (type === 'adultos') {
      newValue = Math.max(1, Math.min(9, newValue)); // Mínimo 1, máximo 9
    } else {
      newValue = Math.max(0, Math.min(9, newValue)); // Mínimo 0, máximo 9
    }
    
    handleInputChange(type, newValue);
  };

  const toggleCompanhia = (companhiaId: string) => {
    const currentCompanhias = searchParams.companhias;
    const newCompanhias = currentCompanhias.includes(companhiaId)
      ? currentCompanhias.filter(id => id !== companhiaId)
      : [...currentCompanhias, companhiaId];
    
    handleInputChange('companhias', newCompanhias);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!searchParams.origem.trim()) {
      newErrors.origem = 'Origem é obrigatória';
    }

    if (!searchParams.destino.trim()) {
      newErrors.destino = 'Destino é obrigatório';
    }

    if (!searchParams.dataIda) {
      newErrors.dataIda = 'Data de ida é obrigatória';
    }

    if (searchParams.origem === searchParams.destino && searchParams.origem.trim()) {
      newErrors.destino = 'Destino deve ser diferente da origem';
    }

    const totalPassageiros = searchParams.adultos + searchParams.criancas + searchParams.bebes;
    if (totalPassageiros === 0) {
      newErrors.passageiros = 'Deve ter pelo menos 1 passageiro';
    }

    if (searchParams.companhias.length === 0) {
      newErrors.companhias = 'Selecione pelo menos uma companhia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault?.();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // Limpar erros anteriores

    try {
      // Extrair códigos IATA das strings de origem e destino
      const origemCode = searchParams.origem.split(' - ')[0]?.trim().toUpperCase() || searchParams.origem.substring(0, 3).toUpperCase();
      const destinoCode = searchParams.destino.split(' - ')[0]?.trim().toUpperCase() || searchParams.destino.substring(0, 3).toUpperCase();

      // Extrair labels completos (cidade + aeroporto)
      const origemLabel = searchParams.origem.includes(' - ') ? searchParams.origem : `${origemCode}`;
      const destinoLabel = searchParams.destino.includes(' - ') ? searchParams.destino : `${destinoCode}`;

      // Mapear IDs das companhias para códigos IATA
      const airlineCodes: { [key: string]: string } = {
        'azul': 'AD',
        'gol': 'G3',
        'latam': 'LA',
        'tam': 'JJ',
        'avianca': 'AV',
        'copa': 'CM'
      };

      const airlines = searchParams.companhias.map(id => airlineCodes[id] || id.toUpperCase());

      // Montar payload no formato esperado pelo n8n
      const payload = {
        source: "amadeus",
        search: {
          origin: origemCode,
          destination: destinoCode,
          date: searchParams.dataIda,
          returnDate: searchParams.somenteIda ? null : (searchParams.dataVolta || null),
          adults: searchParams.adultos,
          currency: 'BRL',
          nonStop: false,
          airlines: airlines.length > 0 ? airlines : undefined,
          sort: searchParams.ordenacao.toLowerCase()
        },
        ui: {
          originLabel: origemLabel,
          destinationLabel: destinoLabel
        }
      };

      console.log('📤 Enviando para n8n:', payload);

      // Enviar DIRETAMENTE para o webhook do n8n (produção)
      const res = await fetch(
        'https://n8n.nexladesenvolvimento.com.br/webhook/pesquisaVoo',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('❌ Webhook retornou erro:', res.status, txt);
        throw new Error(`Webhook ${res.status}: ${txt || 'sem corpo'}`);
      }

      // n8n pode devolver array direto ou { success, data } ou { data }
      const json = await res.json();
      console.log('✅ Webhook n8n respondeu:', json);

      // Extrair array de ofertas (suporta múltiplos formatos)
      const offers = Array.isArray(json)
        ? json
        : (json?.data ?? json?.offers ?? []);

      if (!Array.isArray(offers)) {
        console.error('❌ Formato inesperado do servidor:', json);
        throw new Error('Formato inesperado do servidor');
      }

      console.log('📦 Ofertas extraídas:', offers.length, 'voo(s)');

      // NOTA: Log no Supabase comentado temporariamente
      // A tabela flight_searches retorna 404 (não existe ou está em schema diferente)
      // Isso NÃO deve bloquear a exibição dos voos do n8n
      //
      // Para reabilitar:
      // 1. Aplique a migration: supabase/migrations/20251003200000_create_flight_searches.sql
      // 2. Confirme no Dashboard que a tabela existe
      // 3. Descomente o código abaixo
      /*
      try {
        await supabase
          .from('flight_searches')
          .insert({
            origin: origemCode,
            destination: destinoCode,
            departure_date: searchParams.dataIda,
            return_date: searchParams.somenteIda ? null : searchParams.dataVolta,
            adults: searchParams.adultos,
            currency: 'BRL',
            status: 'completed'
          });
        console.log('✅ Busca salva no histórico');
      } catch (dbError) {
        console.warn('⚠️ Falha ao salvar histórico (ignorado):', dbError);
      }
      */

      // Navegar para página de resultados COM OS DADOS
      const event = new CustomEvent('navigate', {
        detail: {
          page: 'Resultados dos Voos',
          data: offers
        }
      });
      window.dispatchEvent(event);

    } catch (error: any) {
      console.error('❌ Erro na busca:', error);
      setErrors({
        geral: error?.message || 'Falha ao consultar voos'
      });
    } finally {
      setLoading(false); // SEMPRE desliga o spinner
    }
  };

  const getTotalPassageiros = () => {
    return searchParams.adultos + searchParams.criancas + searchParams.bebes;
  };

  const isFormValid = () => {
    return searchParams.origem.trim() && 
           searchParams.destino.trim() && 
           searchParams.dataIda &&
           searchParams.origem !== searchParams.destino &&
           getTotalPassageiros() > 0 &&
           searchParams.companhias.length > 0;
  };

  // Fechar sugestões quando clicar fora
  const handleClickOutside = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest('.suggestions-container')) {
      setShowOrigemSuggestions(false);
      setShowDestinoSuggestions(false);
    }
  };

  return (
    <div className="p-6" onClick={handleClickOutside}>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Encontrar Passagem</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Encontrar Passagem</h1>

      {/* Container Principal */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="space-y-8">
          {/* Primeira Linha - Campos Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Origem */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origem *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchParams.origem}
                  onChange={(e) => handleInputChange('origem', e.target.value)}
                  placeholder="Onde você está?"
                  className={`w-full pl-4 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.origem ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.origem && <p className="text-red-500 text-sm mt-1">{errors.origem}</p>}
              
              {/* Sugestões Origem */}
              {showOrigemSuggestions && origemSuggestions.length > 0 && (
                <div className="suggestions-container absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {origemSuggestions.map((airport) => (
                    <button
                      key={airport.ident}
                      onClick={() => selectAirport(airport, 'origem')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{airport.iata_code} - {airport.name}</div>
                      <div className="text-sm text-gray-600">{airport.municipality}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destino */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destino *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchParams.destino}
                  onChange={(e) => handleInputChange('destino', e.target.value)}
                  placeholder="Para onde você quer ir?"
                  className={`w-full pl-4 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.destino ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.destino && <p className="text-red-500 text-sm mt-1">{errors.destino}</p>}
              
              {/* Sugestões Destino */}
              {showDestinoSuggestions && destinoSuggestions.length > 0 && (
                <div className="suggestions-container absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {destinoSuggestions.map((airport) => (
                    <button
                      key={airport.ident}
                      onClick={() => selectAirport(airport, 'destino')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{airport.iata_code} - {airport.name}</div>
                      <div className="text-sm text-gray-600">{airport.municipality}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Data Ida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Ida *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={searchParams.dataIda}
                  onChange={(e) => handleInputChange('dataIda', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-4 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.dataIda ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.dataIda && <p className="text-red-500 text-sm mt-1">{errors.dataIda}</p>}
            </div>

            {/* Data Volta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Volta
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={searchParams.dataVolta}
                  onChange={(e) => handleInputChange('dataVolta', e.target.value)}
                  min={searchParams.dataIda || new Date().toISOString().split('T')[0]}
                  disabled={searchParams.somenteIda}
                  className={`w-full pl-4 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    searchParams.somenteIda ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Checkbox Somente Ida */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="somenteIda"
              checked={searchParams.somenteIda}
              onChange={(e) => {
                handleInputChange('somenteIda', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('dataVolta', '');
                }
              }}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="somenteIda" className="ml-2 text-sm font-medium text-gray-700">
              SOMENTE IDA
            </label>
          </div>

          {/* Segunda Linha - Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Accordion Passageiros */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPassageirosOpen(!passageirosOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {getTotalPassageiros()} Passageiro{getTotalPassageiros() !== 1 ? 's' : ''}, {searchParams.classe === 'economica' ? 'Econômica' : 'Executiva'}
                  </span>
                </div>
                {passageirosOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {passageirosOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 p-4 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="space-y-4">
                    {/* Contadores de Passageiros */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Adultos</span>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updatePassengerCount('adultos', false)}
                            disabled={searchParams.adultos <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{searchParams.adultos}</span>
                          <button
                            type="button"
                            onClick={() => updatePassengerCount('adultos', true)}
                            disabled={searchParams.adultos >= 9}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Crianças</span>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updatePassengerCount('criancas', false)}
                            disabled={searchParams.criancas <= 0}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{searchParams.criancas}</span>
                          <button
                            type="button"
                            onClick={() => updatePassengerCount('criancas', true)}
                            disabled={searchParams.criancas >= 9}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Bebês</span>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => updatePassengerCount('bebes', false)}
                            disabled={searchParams.bebes <= 0}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{searchParams.bebes}</span>
                          <button
                            type="button"
                            onClick={() => updatePassengerCount('bebes', true)}
                            disabled={searchParams.bebes >= 9}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Classes do Voo */}
                    <div className="pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Classes do voo
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="classe"
                            value="economica"
                            checked={searchParams.classe === 'economica'}
                            onChange={(e) => handleInputChange('classe', e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Econômica</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="classe"
                            value="executiva"
                            checked={searchParams.classe === 'executiva'}
                            onChange={(e) => handleInputChange('classe', e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Executiva</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  {errors.passageiros && <p className="text-red-500 text-sm mt-2">{errors.passageiros}</p>}
                </div>
              )}
            </div>

            {/* Accordion Companhias */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCompanhiasOpen(!companhiasOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors"
              >
                <div className="flex items-center">
                  <Plane className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {searchParams.companhias.length} Companhia{searchParams.companhias.length !== 1 ? 's' : ''} Selecionada{searchParams.companhias.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {companhiasOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {companhiasOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 p-4 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="space-y-3">
                    {companhiasDisponiveis.map((companhia) => (
                      <label key={companhia.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={searchParams.companhias.includes(companhia.id)}
                          onChange={() => toggleCompanhia(companhia.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{companhia.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.companhias && <p className="text-red-500 text-sm mt-2">{errors.companhias}</p>}
                </div>
              )}
            </div>

            {/* Botão Pesquisar */}
            <div className="lg:col-span-1 flex items-end">
              {/* Campo Ordenação */}
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={searchParams.ordenacao}
                  onChange={(e) => handleInputChange('ordenacao', e.target.value as 'BEST' | 'CHEAPEST' | 'FASTEST')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="BEST">Melhor opção</option>
                  <option value="CHEAPEST">Menor preço</option>
                  <option value="FASTEST">Mais rápido</option>
                </select>
              </div>
            </div>

            {/* Botão Pesquisar */}
            <div className="lg:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Pesquisando...
                  </div>
                ) : (
                  'PESQUISAR PASSAGEM'
                )}
              </button>
            </div>
          </div>

          {/* Resumo da Busca */}
          {(searchParams.origem || searchParams.destino || searchParams.dataIda) && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resumo da busca:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                {searchParams.origem && <div>• Origem: {searchParams.origem}</div>}
                {searchParams.destino && <div>• Destino: {searchParams.destino}</div>}
                {searchParams.dataIda && <div>• Ida: {new Date(searchParams.dataIda).toLocaleDateString('pt-BR')}</div>}
                {searchParams.dataVolta && !searchParams.somenteIda && (
                  <div>• Volta: {new Date(searchParams.dataVolta).toLocaleDateString('pt-BR')}</div>
                )}
                <div>• Passageiros: {getTotalPassageiros()} ({searchParams.adultos} adulto{searchParams.adultos !== 1 ? 's' : ''}{searchParams.criancas > 0 ? `, ${searchParams.criancas} criança${searchParams.criancas !== 1 ? 's' : ''}` : ''}{searchParams.bebes > 0 ? `, ${searchParams.bebes} bebê${searchParams.bebes !== 1 ? 's' : ''}` : ''})</div>
                <div>• Classe: {searchParams.classe === 'economica' ? 'Econômica' : 'Executiva'}</div>
                <div>• Companhias: {searchParams.companhias.map(id => companhiasDisponiveis.find(c => c.id === id)?.name).join(', ')}</div>
                <div>• Ordenação: {
                  searchParams.ordenacao === 'BEST' ? 'Melhor opção' :
                  searchParams.ordenacao === 'CHEAPEST' ? 'Menor preço' :
                  'Mais rápido'
                }</div>
              </div>
            </div>
          )}
        </div>

        {/* Erro Geral */}
        {errors.geral && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.geral}</p>
          </div>
        )}
      </form>
    </div>
  );
}