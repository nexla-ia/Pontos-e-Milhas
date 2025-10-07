import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReportOrder {
  id: string;
  order_number: string;
  data_op: string;
  cliente: string;
  localizador: string;
  bilhete: string;
  nome_passageiro: string;
  data_voo: string;
  trecho: string;
  pontuacao_op: number;
  cia: string;
  reembolso: number;
  tarifa: number;
  qtd_bagagens: number;
  valor_bagagens: number;
  tx_embarque: number;
  tx_fee: number;
  markup_externo: number;
  desconto: number;
  valor_total: number;
  forma_pagamento: string;
  status_pagamento: string;
}

interface Filters {
  numero_op: string;
  companhia: string;
  fidelidade: string;
  status_op: string;
  dt_voo_inicio: string;
  dt_voo_fim: string;
  cliente: string;
  cartao: string;
  bilhete: string;
  dt_op_inicio: string;
  dt_op_fim: string;
  localizador: string;
  cpf: string;
  nome_passageiro: string;
}

export default function RelatorioPage() {
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState<string[]>([]);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState<Filters>({
    numero_op: '',
    companhia: 'TODOS',
    fidelidade: 'TODOS',
    status_op: 'TODOS',
    dt_voo_inicio: '',
    dt_voo_fim: '',
    cliente: '',
    cartao: '',
    bilhete: '',
    dt_op_inicio: '',
    dt_op_fim: '',
    localizador: '',
    cpf: '',
    nome_passageiro: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('name')
        .order('name');

      if (error) throw error;

      const companyNames = (companiesData || []).map(company => company.name);
      setCompanies(companyNames);
    } catch (error) {
      console.error('Erro ao carregar companhias:', error);
    }
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);

      // Construir query baseada nos filtros
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          total_amount,
          payment_method,
          status,
          notes,
          users!inner (
            full_name
          ),
          agencies!inner (
            corporate_name
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros se preenchidos
      if (filters.numero_op) {
        query = query.ilike('order_number', `%${filters.numero_op}%`);
      }

      if (filters.status_op !== 'TODOS') {
        query = query.eq('status', filters.status_op.toLowerCase());
      }

      if (filters.dt_op_inicio) {
        query = query.gte('created_at', filters.dt_op_inicio);
      }

      if (filters.dt_op_fim) {
        query = query.lte('created_at', filters.dt_op_fim + 'T23:59:59');
      }

      const { data: ordersData, error } = await query;

      if (error) throw error;

      // Transformar dados para o formato do relatório
      const transformedOrders: ReportOrder[] = (ordersData || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        data_op: order.created_at,
        cliente: order.agencies?.corporate_name || 'N/A',
        localizador: 'N/A',
        bilhete: 'N/A',
        nome_passageiro: 'N/A',
        data_voo: 'N/A',
        trecho: 'N/A',
        pontuacao_op: 0,
        cia: 'N/A',
        reembolso: 0,
        tarifa: 0,
        qtd_bagagens: 0,
        valor_bagagens: 0,
        tx_embarque: 0,
        tx_fee: 0,
        markup_externo: 0,
        desconto: 0,
        valor_total: parseFloat(order.total_amount || '0'),
        forma_pagamento: order.payment_method || 'N/A',
        status_pagamento: order.status || 'N/A',
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Paginação
  const totalItems = orders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = orders.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>OPs Geradas</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Relatório</span>
      </nav>

      {/* Seção de Filtros */}
      <div className="bg-gray-700 rounded-lg p-8 mb-6 max-w-none">
        <p className="text-white text-sm mb-4">
          Preencha apenas as informações relevantes à sua pesquisa
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
          {/* Linha 1 */}
          <div>
            <input
              type="text"
              placeholder="Número Op"
              value={filters.numero_op}
              onChange={(e) => handleFilterChange('numero_op', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={filters.companhia}
              onChange={(e) => handleFilterChange('companhia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODOS">TODOS</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.fidelidade}
              onChange={(e) => handleFilterChange('fidelidade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODOS">TODOS</option>
              <option value="Milhas">Milhas</option>
              <option value="Pago">Pago</option>
            </select>
          </div>

          <div>
            <select
              value={filters.status_op}
              onChange={(e) => handleFilterChange('status_op', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODOS">TODOS</option>
              <option value="open">Em Aberto</option>
              <option value="pending_payment">Pagamento Pendente</option>
              <option value="in_service">Em Atendimento</option>
              <option value="done">Finalizado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Linha 2 */}
          <div>
            <input
              type="text"
              placeholder="Cliente"
              value={filters.cliente}
              onChange={(e) => handleFilterChange('cliente', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Cartão"
              value={filters.cartao}
              onChange={(e) => handleFilterChange('cartao', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Bilhete"
              value={filters.bilhete}
              onChange={(e) => handleFilterChange('bilhete', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Localizador"
              value={filters.localizador}
              onChange={(e) => handleFilterChange('localizador', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Linha 3 */}
          <div>
            <input
              type="text"
              placeholder="CPF"
              value={filters.cpf}
              onChange={(e) => handleFilterChange('cpf', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Nome Passageiro"
              value={filters.nome_passageiro}
              onChange={(e) => handleFilterChange('nome_passageiro', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Datas */}
          <div className="col-span-full">
            <label className="block text-white text-sm mb-2">Data do Voo</label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
              <input
                type="date"
                value={filters.dt_voo_inicio}
                onChange={(e) => handleFilterChange('dt_voo_inicio', e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-white text-center sm:text-left">a</span>
              <input
                type="date"
                value={filters.dt_voo_fim}
                onChange={(e) => handleFilterChange('dt_voo_fim', e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-white text-sm mb-2">Data da OP</label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
              <input
                type="date"
                value={filters.dt_op_inicio}
                onChange={(e) => handleFilterChange('dt_op_inicio', e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-white text-center sm:text-left">a</span>
              <input
                type="date"
                value={filters.dt_op_fim}
                onChange={(e) => handleFilterChange('dt_op_fim', e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Botão Filtrar */}
        <div className="text-center mt-6">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
          >
            <Filter className="w-4 h-4 inline mr-2" />
            {loading ? 'FILTRANDO...' : 'FILTRAR A PESQUISA'}
          </button>
        </div>
      </div>

      {/* Tabela de Relatório */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Relatório de pedidos
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Data OP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Nº da OP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Localizador
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Bilhete
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Nome do Passageiro
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Data do Voo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Trecho
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Pontuação da OP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Cia
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Reembolso
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Tarifa
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Qtd Bagagens
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Valor Bagagens
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Tx Embarque
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Tx Fee
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Markup Externo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Desconto
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Valor Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Forma Pagamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status do Pagamento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={21} className="px-4 py-8 text-center text-gray-500">
                    Carregando relatório...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={21} className="px-4 py-8 text-center text-gray-500">
                    Nenhum resultado encontrado. Use os filtros acima para buscar.
                  </td>
                </tr>
              ) : (
                currentItems.map((order, index) => (
                  <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.data_op)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                      <a href="#" className="hover:underline">
                        {order.order_number}
                      </a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.cliente}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.localizador}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.bilhete}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.nome_passageiro}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.data_voo)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.trecho}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {order.pontuacao_op}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.cia}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(order.reembolso)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(order.tarifa)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {order.qtd_bagagens}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(order.valor_bagagens)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(order.tx_embarque)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(order.tx_fee)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(order.markup_externo)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(order.desconto)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(order.valor_total)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.forma_pagamento}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status_pagamento === 'done' ? 'bg-green-100 text-green-800' :
                        order.status_pagamento === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.status_pagamento === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status_pagamento}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 space-y-3 sm:space-y-0 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> até{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
                  <span className="font-medium">{totalItems}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <ChevronLeft className="w-4 h-4 -ml-1" />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Páginas */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <ChevronRight className="w-4 h-4 -ml-1" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total de itens */}
      <div className="mt-4 text-sm text-gray-600">
        Total de registros encontrados: {totalItems}
      </div>
    </div>
  );
}