import React, { useState, useEffect } from 'react';
import { Search, Download, BarChart3, RefreshCw, X, Calendar, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SearchSummary {
  today: number | null;
  week: number | null;
  month: number | null;
}

interface Agency {
  id: string;
  corporate_name: string;
  trade_name: string;
}

interface CustomSearchSummary {
  daily: number | null;
  weekly: number | null;
  monthly: number | null;
}

export default function ConsultasSistemaPage() {
  const [currentSummary, setCurrentSummary] = useState<SearchSummary>({
    today: null,
    week: null,
    month: null
  });
  
  const [customSummary, setCustomSummary] = useState<CustomSearchSummary>({
    daily: null,
    weekly: null,
    monthly: null
  });

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [customLoading, setCustomLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar agências
      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select('id, corporate_name, trade_name')
        .order('corporate_name');

      if (agenciesError) throw agenciesError;
      setAgencies(agenciesData || []);

      // Simular dados de busca do mês atual
      // Em produção seria: GET /searches/summary?period=today|week|month
      await loadCurrentSummary();

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentSummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Buscar dados de hoje
      const { count: todayCount } = await supabase
        .from('search_logs')
        .select('*', { count: 'exact', head: true })
        .eq('search_date', today);

      // Buscar dados da semana
      const { count: weekCount } = await supabase
        .from('search_logs')
        .select('*', { count: 'exact', head: true })
        .gte('search_date', weekAgo);

      // Buscar dados do mês
      const { count: monthCount } = await supabase
        .from('search_logs')
        .select('*', { count: 'exact', head: true })
        .gte('search_date', monthAgo);

      setCurrentSummary({
        today: todayCount || 0,
        week: weekCount || 0,
        month: monthCount || 0
      });
    } catch (error) {
      console.error('Erro ao carregar resumo atual:', error);
      setCurrentSummary({ today: null, week: null, month: null });
    }
  };

  const handleCustomSearch = async () => {
    try {
      setCustomLoading(true);
      setError(null);

      let query = supabase
        .from('search_logs')
        .select('*', { count: 'exact', head: true });

      // Aplicar filtros
      if (selectedAgency) {
        query = query.eq('agency_id', selectedAgency);
      }

      if (selectedDate) {
        query = query.eq('search_date', selectedDate);
      }

      const { count } = await query;

      setCustomSummary({
        daily: count || 0,
        weekly: count || 0,
        monthly: count || 0
      });
    } catch (err) {
      console.error('Erro ao buscar dados personalizados:', err);
    } finally {
      setCustomLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedAgency('');
    setSelectedDate('');
    setCustomSummary({ daily: null, weekly: null, monthly: null });
  };

  const handleExcelDownload = async (period: string, isCustom: boolean = false) => {
    try {
      let query = supabase
        .from('search_logs')
        .select(`
          *,
          agencies(corporate_name),
          users(full_name)
        `);

      // Aplicar filtros baseados no período e customização
      if (isCustom) {
        if (selectedAgency) query = query.eq('agency_id', selectedAgency);
        if (selectedDate) query = query.eq('search_date', selectedDate);
      } else {
        const today = new Date().toISOString().split('T')[0];
        if (period === 'daily') query = query.eq('search_date', today);
        if (period === 'weekly') {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          query = query.gte('search_date', weekAgo);
        }
        if (period === 'monthly') {
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          query = query.gte('search_date', monthAgo);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Gerar CSV
      const csvContent = [
        'Data,Agência,Usuário,Parâmetros,Resultados',
        ...(data || []).map(log => 
          `"${log.search_date}","${log.agencies?.corporate_name || 'N/A'}","${log.users?.full_name || 'N/A'}","${JSON.stringify(log.search_params)}","${log.results_count}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `consultas-${period}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar Excel:', error);
      setError('Erro ao gerar relatório. Tente novamente.');
    }
  };

  const handleTotalizador = async (period: string, isCustom: boolean = false) => {
    try {
      alert(`Totalizador ${period} - Funcionalidade em desenvolvimento`);
    } catch (error) {
      console.error('Erro ao carregar totalizador:', error);
      setError('Erro ao carregar totalizador. Tente novamente.');
    }
  };

  const formatNumber = (num: number | null): string => {
    if (num === null) return '–';
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const MetricCard = ({ 
    title, 
    value, 
    onExcel, 
    onTotalizador, 
    loading = false 
  }: {
    title: string;
    value: number | null;
    onExcel: () => void;
    onTotalizador: () => void;
    loading?: boolean;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
        {title}
      </h3>
      <div className="text-center mb-6">
        {loading ? (
          <div className="text-gray-500">Carregando...</div>
        ) : (
          <div className="text-3xl font-bold text-gray-900">
            {formatNumber(value)}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <button
          onClick={onExcel}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium uppercase disabled:opacity-50"
        >
          <Download className="w-4 h-4 inline mr-2" />
          Excel {title.split(' ')[0]}
        </button>
        <button
          onClick={onTotalizador}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm font-medium uppercase disabled:opacity-50"
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Totalizador {title.split(' ')[0]}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Consultas do Sistema</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Consultas do Sistema</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Seção Buscas Mês Atual */}
      <div className="mb-8">
        <div className="bg-gray-700 rounded-t-lg p-6">
          <h2 className="text-xl font-semibold text-white text-center">
            Buscas Mês Atual
          </h2>
        </div>
        
        <div className="bg-gray-100 rounded-b-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Hoje"
              value={currentSummary.today}
              onExcel={() => handleExcelDownload('daily')}
              onTotalizador={() => handleTotalizador('daily')}
              loading={loading}
            />
            
            <MetricCard
              title="Esta Semana"
              value={currentSummary.week}
              onExcel={() => handleExcelDownload('weekly')}
              onTotalizador={() => handleTotalizador('weekly')}
              loading={loading}
            />
            
            <MetricCard
              title="Este Mês"
              value={currentSummary.month}
              onExcel={() => handleExcelDownload('monthly')}
              onTotalizador={() => handleTotalizador('monthly')}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Seção Busca Personalizada */}
      <div>
        <div className="bg-gray-700 rounded-t-lg p-6">
          <h2 className="text-xl font-semibold text-white text-center">
            Busca Personalizada
          </h2>
        </div>
        
        <div className="bg-gray-100 rounded-b-lg p-6">
          {/* Filtros */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Agência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agência
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={selectedAgency}
                    onChange={(e) => setSelectedAgency(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Selecionar agência"
                  >
                    <option value="">Todas as agências</option>
                    {agencies.map(agency => (
                      <option key={agency.id} value={agency.id}>
                        {agency.trade_name || agency.corporate_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Selecionar data"
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-end space-x-3">
                <button
                  onClick={handleCustomSearch}
                  disabled={customLoading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors text-sm font-medium uppercase disabled:opacity-50"
                  aria-label="Atualizar resultados da busca"
                >
                  <RefreshCw className={`w-4 h-4 inline mr-2 ${customLoading ? 'animate-spin' : ''}`} />
                  {customLoading ? 'Atualizando...' : 'Atualizar'}
                </button>
                
                <button
                  onClick={handleClearFilters}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  aria-label="Limpar filtros"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Resultados Personalizados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Diária"
              value={customSummary.daily}
              onExcel={() => handleExcelDownload('daily', true)}
              onTotalizador={() => handleTotalizador('daily', true)}
              loading={customLoading}
            />
            
            <MetricCard
              title="Semanal"
              value={customSummary.weekly}
              onExcel={() => handleExcelDownload('weekly', true)}
              onTotalizador={() => handleTotalizador('weekly', true)}
              loading={customLoading}
            />
            
            <MetricCard
              title="Mensal"
              value={customSummary.monthly}
              onExcel={() => handleExcelDownload('monthly', true)}
              onTotalizador={() => handleTotalizador('monthly', true)}
              loading={customLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}