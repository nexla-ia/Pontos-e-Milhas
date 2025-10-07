import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Eye, EyeOff, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  user_name: string;
  user_email: string;
  agency_name: string;
  company: string;
  emission_type: string;
  class_type: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  origin: string;
}

interface ColumnVisibility {
  usuario: boolean;
  agencia: boolean;
  companhia: boolean;
  tipoEmissao: boolean;
  classe: boolean;
  data: boolean;
  total: boolean;
  metodo: boolean;
  pagamento: boolean;
  origem: boolean;
}

type PaymentStatusFilter = 'all' | 'aguardando' | 'recusado' | 'processando' | 'erro';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'approve' | 'cancel';
}

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, type }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              type === 'approve' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoPendentePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('all');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string;
    type: 'approve' | 'cancel';
  }>({ isOpen: false, orderId: '', type: 'approve' });

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    usuario: true,
    agencia: true,
    companhia: true,
    tipoEmissao: true,
    classe: true,
    data: true,
    total: true,
    metodo: true,
    pagamento: true,
    origem: true,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      // Buscar pedidos com status "pending_payment" e fazer join com users e agencies
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          payment_method,
          created_at,
          notes,
          users!inner (
            full_name
          ),
          agencies!inner (
            corporate_name
          )
        `)
        .eq('status', 'pending_payment')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados para o formato esperado
      const transformedOrders: Order[] = (ordersData || []).map(order => {
        return {
          id: order.id,
          order_number: order.order_number,
          user_name: order.users?.full_name || 'N/A',
          user_email: 'N/A',
          agency_name: order.agencies?.corporate_name || 'N/A',
          company: 'N/A',
          emission_type: 'N/A',
          class_type: 'N/A',
          created_at: order.created_at,
          total_amount: parseFloat(order.total_amount || '0'),
          payment_method: order.payment_method || 'N/A',
          payment_status: 'Aguardando Pagamento',
          origin: 'Pontos & Milhas',
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
    let filtered = orders;

    // Filtrar por status
    if (statusFilter !== 'all') {
      const statusMap = {
        aguardando: 'Aguardando Pagamento',
        recusado: 'Recusado',
        processando: 'Processando Pagamento',
        erro: 'Erro no Processamento'
      };
      filtered = filtered.filter(order => order.payment_status === statusMap[statusFilter]);
    }

    // Filtrar por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        return (
          order.order_number.toLowerCase().includes(searchLower) ||
          (columnVisibility.usuario && (order.user_name.toLowerCase().includes(searchLower) || order.user_email.toLowerCase().includes(searchLower))) ||
          (columnVisibility.agencia && order.agency_name.toLowerCase().includes(searchLower)) ||
          (columnVisibility.companhia && order.company.toLowerCase().includes(searchLower)) ||
          (columnVisibility.tipoEmissao && order.emission_type.toLowerCase().includes(searchLower)) ||
          (columnVisibility.classe && order.class_type.toLowerCase().includes(searchLower)) ||
          (columnVisibility.metodo && order.payment_method.toLowerCase().includes(searchLower)) ||
          (columnVisibility.pagamento && order.payment_status.toLowerCase().includes(searchLower)) ||
          (columnVisibility.origem && order.origin.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleApprove = (orderId: string) => {
    setConfirmModal({ isOpen: true, orderId, type: 'approve' });
  };

  const handleCancel = (orderId: string) => {
    setConfirmModal({ isOpen: true, orderId, type: 'cancel' });
  };

  const confirmAction = async () => {
    const { orderId, type } = confirmModal;
    
    try {
      if (type === 'approve') {
        // Implementar POST /orders/{id}/approve_payment
        console.log(`Aprovando pagamento para ordem ${orderId}`);
        // const { error } = await supabase.rpc('approve_payment', { order_id: orderId });
      } else {
        // Implementar POST /orders/{id}/cancel
        console.log(`Cancelando ordem ${orderId}`);
        // const { error } = await supabase.rpc('cancel_order', { order_id: orderId });
      }
      
      // Recarregar dados após ação
      await loadOrders();
    } catch (error) {
      console.error(`Erro ao ${type === 'approve' ? 'aprovar' : 'cancelar'} ordem:`, error);
    } finally {
      setConfirmModal({ isOpen: false, orderId: '', type: 'approve' });
    }
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

  const statusTags = [
    { key: 'all', label: 'Todos', count: orders.length },
    { key: 'aguardando', label: 'Aguardando Pagamento', count: orders.filter(o => o.payment_status === 'Aguardando Pagamento').length },
    { key: 'recusado', label: 'Recusado', count: orders.filter(o => o.payment_status === 'Recusado').length },
    { key: 'processando', label: 'Processando Pagamento', count: orders.filter(o => o.payment_status === 'Processando Pagamento').length },
    { key: 'erro', label: 'Erro no Processamento', count: orders.filter(o => o.payment_status === 'Erro no Processamento').length },
  ];

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
          <span className="text-gray-900 font-medium">Pagamento Pendente</span>
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

      {/* Filtros de Status */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrar por status:</h3>
        <div className="flex flex-wrap gap-2">
          {statusTags.map((tag) => (
            <button
              key={tag.key}
              onClick={() => setStatusFilter(tag.key as PaymentStatusFilter)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === tag.key
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.label}
              <span className="ml-1 bg-white rounded-full px-1.5 py-0.5 text-xs">
                {tag.count}
              </span>
            </button>
          ))}
        </div>
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
              metodo: 'Método',
              pagamento: 'Pagamento',
              origem: 'Origem'
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
                Op.
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
              {columnVisibility.metodo && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
              )}
              {columnVisibility.pagamento && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
              )}
              {columnVisibility.origem && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origem
                </th>
              )}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma OP com pagamento pendente encontrada
                </td>
              </tr>
            ) : (
              currentItems.map((order, index) => (
                <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                    <a href="#" className="hover:underline">
                      {order.order_number}
                    </a>
                  </td>
                  {columnVisibility.usuario && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.user_name}</div>
                        <div className="text-gray-500 text-xs">{order.user_email}</div>
                      </div>
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
                  {columnVisibility.metodo && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.payment_method}
                    </td>
                  )}
                  {columnVisibility.pagamento && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.payment_status === 'Aguardando Pagamento' ? 'bg-yellow-100 text-yellow-800' :
                        order.payment_status === 'Recusado' ? 'bg-red-100 text-red-800' :
                        order.payment_status === 'Processando Pagamento' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                  )}
                  {columnVisibility.origem && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.origin}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(order.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancelar
                      </button>
                    </div>
                  </td>
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
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> até{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
                  <span className="font-medium">{totalItems}</span> resultados
                </p>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded text-sm px-2 py-1"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
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
        Total de OPs com pagamento pendente: {totalItems}
      </div>

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'approve' ? 'Aprovar Pagamento' : 'Cancelar Ordem'}
        message={confirmModal.type === 'approve' 
          ? 'Tem certeza que deseja aprovar este pagamento? Esta ação não pode ser desfeita.'
          : 'Tem certeza que deseja cancelar esta ordem? Esta ação não pode ser desfeita.'
        }
        confirmText={confirmModal.type === 'approve' ? 'Aprovar' : 'Cancelar Ordem'}
        cancelText="Voltar"
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, orderId: '', type: 'approve' })}
        type={confirmModal.type}
      />
    </div>
  );
}