import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  user_name: string;
  agency_name: string;
  company: string;
  emission_type: string;
  class_type: string;
  created_at: string;
  total_amount: number;
  origin_route: string;
  days_open: number;
}

interface ColumnVisibility {
  usuario: boolean;
  agencia: boolean;
  companhia: boolean;
  tipoEmissao: boolean;
  classe: boolean;
  data: boolean;
  total: boolean;
  origem: boolean;
  tempoAberto: boolean;
}

export default function OpsEmAbertoPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    usuario: true,
    agencia: true,
    companhia: true,
    tipoEmissao: true,
    classe: true,
    data: true,
    total: true,
    origem: true,
    tempoAberto: true,
  });

  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, columnVisibility]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      // Buscar pedidos com status "open" e fazer join com users e agencies
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          created_at,
          notes,
          users!inner (
            full_name
          ),
          agencies!inner (
            corporate_name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados para o formato esperado
      const transformedOrders: Order[] = (ordersData || []).map(order => {
        const createdDate = new Date(order.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: order.id,
          order_number: order.order_number,
          user_name: order.users?.full_name || 'N/A',
          agency_name: order.agencies?.corporate_name || 'N/A',
          company: 'N/A',
          emission_type: 'N/A',
          class_type: 'N/A',
          created_at: order.created_at,
          total_amount: parseFloat(order.total_amount || '0'),
          origin_route: 'N/A',
          days_open: diffDays,
        };
      });

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filterOrders = () => {
    if (!searchTerm) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(searchLower) ||
        (columnVisibility.usuario && order.user_name.toLowerCase().includes(searchLower)) ||
        (columnVisibility.agencia && order.agency_name.toLowerCase().includes(searchLower)) ||
        (columnVisibility.companhia && order.company.toLowerCase().includes(searchLower)) ||
        (columnVisibility.tipoEmissao && order.emission_type.toLowerCase().includes(searchLower)) ||
        (columnVisibility.classe && order.class_type.toLowerCase().includes(searchLower)) ||
        (columnVisibility.origem && order.origin_route.toLowerCase().includes(searchLower))
      );
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Paginação
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb e botão atualizar */}
      <div className="flex justify-between items-center mb-6">
        <nav className="text-sm text-gray-600">
          <span>Dashboard</span>
          <span className="mx-2">›</span>
          <span>OPs Geradas</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Em Aberto</span>
        </nav>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* Seleção de colunas */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Colunas visíveis:</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(columnVisibility).map(([key, visible]) => {
            const labels = {
              usuario: 'Usuário',
              agencia: 'Agência',
              companhia: 'Companhia',
              tipoEmissao: 'Tipo Emissão',
              classe: 'Classe',
              data: 'Data',
              total: 'Total',
              origem: 'Origem',
              tempoAberto: 'Tempo em Aberto'
            };

            return (
              <button
                key={key}
                onClick={() => toggleColumnVisibility(key as keyof ColumnVisibility)}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                style={{
                  backgroundColor: visible ? '#dbeafe' : '#f3f4f6',
                  borderColor: visible ? '#3b82f6' : '#d1d5db',
                  color: visible ? '#1e40af' : '#6b7280'
                }}
              >
                {visible ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                {labels[key as keyof typeof labels]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campo de busca */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search filter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operação
              </th>
              {columnVisibility.usuario && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
              )}
              {columnVisibility.agencia && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agência
                </th>
              )}
              {columnVisibility.companhia && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Companhia
                </th>
              )}
              {columnVisibility.tipoEmissao && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Emissão
                </th>
              )}
              {columnVisibility.classe && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
              )}
              {columnVisibility.data && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
              )}
              {columnVisibility.total && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              )}
              {columnVisibility.origem && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origem
                </th>
              )}
              {columnVisibility.tempoAberto && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempo em Aberto
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma OP em aberto encontrada
                </td>
              </tr>
            ) : (
              currentItems.map((order, index) => (
                <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  {columnVisibility.usuario && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user_name}
                    </td>
                  )}
                  {columnVisibility.agencia && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.agency_name}
                    </td>
                  )}
                  {columnVisibility.companhia && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.company}
                    </td>
                  )}
                  {columnVisibility.tipoEmissao && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.emission_type}
                    </td>
                  )}
                  {columnVisibility.classe && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.class_type}
                    </td>
                  )}
                  {columnVisibility.data && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.created_at)}
                    </td>
                  )}
                  {columnVisibility.total && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(order.total_amount)}
                    </td>
                  )}
                  {columnVisibility.origem && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.origin_route}
                    </td>
                  )}
                  {columnVisibility.tempoAberto && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {order.days_open} {order.days_open === 1 ? 'dia' : 'dias'}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
        Total de OPs em aberto: {totalItems}
      </div>
    </div>
  );
}