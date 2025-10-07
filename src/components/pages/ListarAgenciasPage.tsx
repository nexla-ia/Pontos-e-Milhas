import React, { useState, useEffect } from 'react';
import { Search, Download, Printer, Plus, Edit, Trash2, RotateCcw, RefreshCw, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Agency {
  id: string;
  corporate_name: string;
  trade_name: string;
  cnpj: string;
  email_primary: string;
  email_financial: string;
  phone: string;
  website: string;
  profile: string;
  consultation_limit: number;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

interface AgencyModalProps {
  isOpen: boolean;
  agency: Agency | null;
  onClose: () => void;
  onSave: (agencyData: Partial<Agency>) => void;
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
  type: 'delete' | 'reset';
}

function AgencyModal({ isOpen, agency, onClose, onSave, loading }: AgencyModalProps) {
  const [formData, setFormData] = useState({
    corporate_name: '',
    trade_name: '',
    cnpj: '',
    email_primary: '',
    email_financial: '',
    phone: '',
    website: '',
    profile: 'B2B',
    consultation_limit: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (agency) {
      setFormData({
        corporate_name: agency.corporate_name || '',
        trade_name: agency.trade_name || '',
        cnpj: agency.cnpj || '',
        email_primary: agency.email_primary || '',
        email_financial: agency.email_financial || '',
        phone: agency.phone || '',
        website: agency.website || '',
        profile: agency.profile || 'B2B',
        consultation_limit: agency.consultation_limit || 0
      });
    } else {
      setFormData({
        corporate_name: '',
        trade_name: '',
        cnpj: '',
        email_primary: '',
        email_financial: '',
        phone: '',
        website: '',
        profile: 'B2B',
        consultation_limit: 0
      });
    }
    setErrors({});
  }, [agency, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.corporate_name.trim()) {
      newErrors.corporate_name = 'Razão social é obrigatória';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    }

    if (!formData.email_primary.trim()) {
      newErrors.email_primary = 'E-mail principal é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_primary)) {
      newErrors.email_primary = 'E-mail deve ter um formato válido';
    }

    if (!formData.email_financial.trim()) {
      newErrors.email_financial = 'E-mail financeiro é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_financial)) {
      newErrors.email_financial = 'E-mail deve ter um formato válido';
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
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {agency ? 'Editar Agência' : 'Cadastrar Nova Agência'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                value={formData.corporate_name}
                onChange={(e) => setFormData(prev => ({ ...prev, corporate_name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.corporate_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Razão social da empresa"
              />
              {errors.corporate_name && <p className="text-red-500 text-sm mt-1">{errors.corporate_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={formData.trade_name}
                onChange={(e) => setFormData(prev => ({ ...prev, trade_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome fantasia"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cnpj ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="00.000.000/0000-00"
              />
              {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail Principal *
              </label>
              <input
                type="email"
                value={formData.email_primary}
                onChange={(e) => setFormData(prev => ({ ...prev, email_primary: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email_primary ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="contato@empresa.com"
              />
              {errors.email_primary && <p className="text-red-500 text-sm mt-1">{errors.email_primary}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail Financeiro *
              </label>
              <input
                type="email"
                value={formData.email_financial}
                onChange={(e) => setFormData(prev => ({ ...prev, email_financial: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email_financial ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="financeiro@empresa.com"
              />
              {errors.email_financial && <p className="text-red-500 text-sm mt-1">{errors.email_financial}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perfil
              </label>
              <select
                value={formData.profile}
                onChange={(e) => setFormData(prev => ({ ...prev, profile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="B2B">B2B</option>
                <option value="Parceiro">Parceiro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limite de Consultas
              </label>
              <input
                type="number"
                min="0"
                value={formData.consultation_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_limit: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
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
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListarAgenciasPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    agencyId: string;
    agencyName: string;
    type: 'delete' | 'reset';
  }>({ isOpen: false, agencyId: '', agencyName: '', type: 'delete' });

  useEffect(() => {
    loadAgencies();
  }, []);

  useEffect(() => {
    filterAgencies();
  }, [agencies, searchTerm]);

  const loadAgencies = async () => {
    try {
      setLoading(true);

      const { data: agenciesData, error } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAgencies(agenciesData || []);
    } catch (error) {
      console.error('Erro ao carregar agências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAgencies();
    setRefreshing(false);
  };

  const filterAgencies = () => {
    if (!searchTerm) {
      setFilteredAgencies(agencies);
      return;
    }

    const filtered = agencies.filter(agency => {
      const searchLower = searchTerm.toLowerCase();
      return (
        agency.corporate_name.toLowerCase().includes(searchLower) ||
        (agency.trade_name && agency.trade_name.toLowerCase().includes(searchLower)) ||
        agency.cnpj.toLowerCase().includes(searchLower) ||
        agency.email_primary.toLowerCase().includes(searchLower)
      );
    });

    setFilteredAgencies(filtered);
    setCurrentPage(1);
  };

  const handleCreateAgency = () => {
    setEditingAgency(null);
    setIsModalOpen(true);
  };

  const handleEditAgency = (agency: Agency) => {
    setEditingAgency(agency);
    setIsModalOpen(true);
  };

  const handleDeleteAgency = (agencyId: string, agencyName: string) => {
    setConfirmModal({ isOpen: true, agencyId, agencyName, type: 'delete' });
  };

  const handleResetCounter = (agencyId: string, agencyName: string) => {
    setConfirmModal({ isOpen: true, agencyId, agencyName, type: 'reset' });
  };

  const handleSaveAgency = async (agencyData: Partial<Agency>) => {
    try {
      setModalLoading(true);

      if (editingAgency) {
        // Editar agência existente
        const { error } = await supabase
          .from('agencies')
          .update({
            ...agencyData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAgency.id);

        if (error) throw error;
      } else {
        // Criar nova agência
        const { error } = await supabase
          .from('agencies')
          .insert([agencyData]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      await loadAgencies();
    } catch (error) {
      console.error('Erro ao salvar agência:', error);
      alert('Erro ao salvar agência. Tente novamente.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmAction = async () => {
    const { agencyId, type } = confirmModal;
    
    try {
      if (type === 'delete') {
        const { error } = await supabase
          .from('agencies')
          .delete()
          .eq('id', agencyId);

        if (error) throw error;
      } else {
        // Reset counter - implementar endpoint específico
        console.log(`Resetando contador para agência ${agencyId}`);
        // const { error } = await supabase.rpc('reset_agency_counter', { agency_id: agencyId });
      }
      
      await loadAgencies();
    } catch (error) {
      console.error(`Erro ao ${type === 'delete' ? 'excluir' : 'resetar contador da'} agência:`, error);
      alert(`Erro ao ${type === 'delete' ? 'excluir' : 'resetar contador da'} agência. Tente novamente.`);
    } finally {
      setConfirmModal({ isOpen: false, agencyId: '', agencyName: '', type: 'delete' });
    }
  };

  const handleDownloadReport = async () => {
    try {
      // Implementar download de relatório
      console.log('Baixando relatório de agências...');
      // const response = await fetch('/api/agencies/report');
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'relatorio-agencias.csv';
      // a.click();
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Paginação
  const totalItems = filteredAgencies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAgencies.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando agências...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb e ações principais */}
      <div className="flex justify-between items-center mb-6">
        <nav className="text-sm text-gray-600">
          <span>Dashboard</span>
          <span className="mx-2">›</span>
          <span>Agências</span>
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
            onClick={handleDownloadReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </button>
          
          <button
            onClick={handleCreateAgency}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Agência
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
      <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                CNPJ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Perfil
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                Consultas Restantes
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Bloqueado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[280px]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma agência encontrada
                </td>
              </tr>
            ) : (
              currentItems.map((agency, index) => (
                <tr key={agency.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div>
                      <div className="font-medium">{agency.trade_name || agency.corporate_name}</div>
                      {agency.trade_name && (
                        <div className="text-gray-500 text-xs">{agency.corporate_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {agency.cnpj}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="break-words" title={agency.email_primary}>
                      {agency.email_primary}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      agency.profile === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {agency.profile}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {agency.consultation_limit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      agency.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {agency.is_blocked ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <div className="flex justify-center space-x-1 flex-wrap gap-1">
                      <button
                        onClick={() => handleEditAgency(agency)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAgency(agency.id, agency.trade_name || agency.corporate_name)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </button>

                      <button
                        onClick={() => handleResetCounter(agency.id, agency.trade_name || agency.corporate_name)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Zerar Contador
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
        Total de agências: {totalItems}
      </div>

      {/* Modal de agência */}
      <AgencyModal
        isOpen={isModalOpen}
        agency={editingAgency}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAgency}
        loading={modalLoading}
      />

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'delete' ? 'Excluir Agência' : 'Zerar Contador'}
        message={confirmModal.type === 'delete' 
          ? `Tem certeza que deseja excluir a agência "${confirmModal.agencyName}"? Esta ação não pode ser desfeita.`
          : `Tem certeza que deseja zerar o contador de consultas da agência "${confirmModal.agencyName}"?`
        }
        confirmText={confirmModal.type === 'delete' ? 'Excluir' : 'Zerar Contador'}
        cancelText="Cancelar"
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, agencyId: '', agencyName: '', type: 'delete' })}
        type={confirmModal.type}
      />
    </div>
  );
}