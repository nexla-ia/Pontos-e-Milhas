import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, RefreshCw, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Operator {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

interface OperatorModalProps {
  isOpen: boolean;
  operator: Operator | null;
  onClose: () => void;
  onSave: (operatorData: Partial<Operator>) => void;
  loading: boolean;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'delete' | 'activate';
}

function OperatorModal({ isOpen, operator, onClose, onSave, loading }: OperatorModalProps) {
  const [formData, setFormData] = useState({
    name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (operator) {
      setFormData({
        name: operator.name || ''
      });
    } else {
      setFormData({
        name: ''
      });
    }
    setErrors({});
  }, [operator, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {operator ? 'Editar Operadora' : 'Cadastrar Nova Operadora'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome da operadora"
              maxLength={100}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            <p className="text-gray-500 text-xs mt-1">
              {formData.name.length}/100 caracteres
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
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
              type === 'delete' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListarOperadorasPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    operatorId: string;
    operatorName: string;
    type: 'delete' | 'activate';
  }>({ isOpen: false, operatorId: '', operatorName: '', type: 'delete' });

  const itemsPerPage = 10;

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    filterOperators();
  }, [operators, searchTerm]);

  const loadOperators = async () => {
    try {
      setLoading(true);

      const { data: operatorsData, error } = await supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados para incluir campo active simulado
      setOperators(operatorsData || []);
    } catch (error) {
      console.error('Erro ao carregar operadoras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOperators();
    setRefreshing(false);
  };

  const filterOperators = () => {
    if (!searchTerm) {
      setFilteredOperators(operators);
      return;
    }

    const filtered = operators.filter(operator => {
      const searchLower = searchTerm.toLowerCase();
      return operator.name.toLowerCase().includes(searchLower);
    });

    setFilteredOperators(filtered);
    setCurrentPage(1);
  };

  const handleCreateOperator = () => {
    setEditingOperator(null);
    setIsModalOpen(true);
  };

  const handleEditOperator = (operator: Operator) => {
    setEditingOperator(operator);
    setIsModalOpen(true);
  };

  const handleDeleteOperator = (operatorId: string, operatorName: string) => {
    setConfirmModal({ isOpen: true, operatorId, operatorName, type: 'delete' });
  };

  const handleActivateOperator = (operatorId: string, operatorName: string) => {
    setConfirmModal({ isOpen: true, operatorId, operatorName, type: 'activate' });
  };

  const handleSaveOperator = async (operatorData: Partial<Operator>) => {
    try {
      setModalLoading(true);

      if (editingOperator) {
        // Editar operadora existente
        const { error } = await supabase
          .from('operators')
          .update({
            name: operatorData.name
          })
          .eq('id', editingOperator.id);

        if (error) throw error;
      } else {
        // Criar nova operadora
        const { error } = await supabase
          .from('operators')
          .insert([{
            name: operatorData.name
          }]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      await loadOperators();
    } catch (error) {
      console.error('Erro ao salvar operadora:', error);
      alert('Erro ao salvar operadora. Tente novamente.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmAction = async () => {
    const { operatorId, type } = confirmModal;
    
    try {
      if (type === 'delete') {
        const { error } = await supabase
          .from('operators')
          .delete()
          .eq('id', operatorId);

        if (error) throw error;
      } else {
        // Ativar operadora - implementar lógica de ativação
        console.log(`Ativando operadora ${operatorId}`);
        // const { error } = await supabase.rpc('activate_operator', { operator_id: operatorId });
      }
      
      await loadOperators();
    } catch (error) {
      console.error(`Erro ao ${type === 'delete' ? 'excluir' : 'ativar'} operadora:`, error);
      alert(`Erro ao ${type === 'delete' ? 'excluir' : 'ativar'} operadora. Tente novamente.`);
    } finally {
      setConfirmModal({ isOpen: false, operatorId: '', operatorName: '', type: 'delete' });
    }
  };

  // Paginação
  const totalItems = filteredOperators.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredOperators.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando operadoras...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb e botão cadastrar */}
      <div className="flex justify-between items-center mb-6">
        <nav className="text-sm text-gray-600">
          <span>Dashboard</span>
          <span className="mx-2">›</span>
          <span>Operadora</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Listar</span>
        </nav>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          
          <button
            onClick={handleCreateOperator}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar nova operadora
          </button>
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
                Nome
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma operadora encontrada
                </td>
              </tr>
            ) : (
              currentItems.map((operator, index) => (
                <tr key={operator.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {operator.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex justify-center space-x-2">
                      {operator.active ? (
                        <>
                          <button
                            onClick={() => handleEditOperator(operator)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </button>
                          
                          <button
                            onClick={() => handleDeleteOperator(operator.id, operator.name)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleActivateOperator(operator.id, operator.name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Ativar operadora
                        </button>
                      )}
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
                    &laquo;
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lsaquo;
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage}
                  </span>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total de itens */}
      <div className="mt-4 text-sm text-gray-600">
        Total de operadoras: {totalItems}
      </div>

      {/* Modal de operadora */}
      <OperatorModal
        isOpen={isModalOpen}
        operator={editingOperator}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOperator}
        loading={modalLoading}
      />

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'delete' ? 'Excluir Operadora' : 'Ativar Operadora'}
        message={confirmModal.type === 'delete' 
          ? `Tem certeza que deseja excluir a operadora "${confirmModal.operatorName}"? Esta ação não pode ser desfeita.`
          : `Tem certeza que deseja ativar a operadora "${confirmModal.operatorName}"?`
        }
        confirmText={confirmModal.type === 'delete' ? 'Excluir' : 'Ativar'}
        cancelText="Cancelar"
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, operatorId: '', operatorName: '', type: 'delete' })}
        type={confirmModal.type}
      />
    </div>
  );
}