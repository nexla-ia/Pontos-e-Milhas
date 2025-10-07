import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, RefreshCw, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AgencyProfile {
  id: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  profile: AgencyProfile | null;
  onClose: () => void;
  onSave: (profileData: Partial<AgencyProfile>) => void;
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

function ProfileModal({ isOpen, profile, onClose, onSave, loading }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        description: profile.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setErrors({});
  }, [profile, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
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
            {profile ? 'Editar Perfil de Agência' : 'Cadastrar Novo Perfil de Agência'}
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
              placeholder="Nome do perfil"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descrição do perfil"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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

export default function ListarPerfisAgenciaPage() {
  const [profiles, setProfiles] = useState<AgencyProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<AgencyProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AgencyProfile | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    profileId: string;
    profileName: string;
    type: 'delete' | 'activate';
  }>({ isOpen: false, profileId: '', profileName: '', type: 'delete' });

  const itemsPerPage = 10;

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm]);

  const loadProfiles = async () => {
    try {
      setLoading(true);

      const { data: profilesData, error } = await supabase
        .from('agency_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(profilesData || []);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
    setRefreshing(false);
  };

  const filterProfiles = () => {
    if (!searchTerm) {
      setFilteredProfiles(profiles);
      return;
    }

    const filtered = profiles.filter(profile => {
      const searchLower = searchTerm.toLowerCase();
      return (
        profile.name.toLowerCase().includes(searchLower) ||
        profile.description.toLowerCase().includes(searchLower)
      );
    });

    setFilteredProfiles(filtered);
    setCurrentPage(1);
  };

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: AgencyProfile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleDeleteProfile = (profileId: string, profileName: string) => {
    setConfirmModal({ isOpen: true, profileId, profileName, type: 'delete' });
  };

  const handleActivateProfile = (profileId: string, profileName: string) => {
    setConfirmModal({ isOpen: true, profileId, profileName, type: 'activate' });
  };

  const handleSaveProfile = async (profileData: Partial<AgencyProfile>) => {
    try {
      setModalLoading(true);

      if (editingProfile) {
        // Editar perfil existente (seria PUT /agency-profiles/{id})
        console.log('Editando perfil:', editingProfile.id, profileData);
        
        setProfiles(prev => prev.map(profile => 
          profile.id === editingProfile.id 
            ? { ...profile, ...profileData, updated_at: new Date().toISOString() }
            : profile
        ));
      } else {
        // Criar novo perfil (seria POST /agency-profiles)
        console.log('Criando perfil:', profileData);
        
        const newProfile: AgencyProfile = {
          id: Date.now().toString(),
          name: profileData.name || '',
          description: profileData.description || '',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setProfiles(prev => [newProfile, ...prev]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmAction = async () => {
    const { profileId, type } = confirmModal;
    
    try {
      if (type === 'delete') {
        // DELETE /agency-profiles/{id}
        console.log('Excluindo perfil:', profileId);
        setProfiles(prev => prev.filter(profile => profile.id !== profileId));
      } else {
        // POST /agency-profiles/{id}/activate
        console.log('Ativando perfil:', profileId);
        setProfiles(prev => prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, active: true, updated_at: new Date().toISOString() }
            : profile
        ));
      }
    } catch (error) {
      console.error(`Erro ao ${type === 'delete' ? 'excluir' : 'ativar'} perfil:`, error);
      alert(`Erro ao ${type === 'delete' ? 'excluir' : 'ativar'} perfil. Tente novamente.`);
    } finally {
      setConfirmModal({ isOpen: false, profileId: '', profileName: '', type: 'delete' });
    }
  };

  const handleNavigateToCadastrar = () => {
    // Navegar para "Funções › Cadastrar" (seria implementado com router)
    // console.log('Navegar para Funções › Cadastrar');
    // Para demonstração, vamos simular a navegação
    window.location.hash = '#cadastrar-perfil-agencia';
  };

  // Paginação
  const totalItems = filteredProfiles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredProfiles.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando perfis...</div>
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
          <span>Funções</span>
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
            onClick={handleNavigateToCadastrar}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Novo Perfil Agência
          </button>
        </div>
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Listagem de Perfis Agência</h1>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Nenhum perfil encontrado
                </td>
              </tr>
            ) : (
              currentItems.map((profile, index) => (
                <tr key={profile.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {profile.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={profile.description}>
                      {profile.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditProfile(profile)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </button>
                      
                      {profile.active ? (
                        <button
                          onClick={() => handleDeleteProfile(profile.id, profile.name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateProfile(profile.id, profile.name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Ativar Perfil de Cliente
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
        Total de perfis: {totalItems}
      </div>

      {/* Modal de perfil */}
      <ProfileModal
        isOpen={isModalOpen}
        profile={editingProfile}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        loading={modalLoading}
      />

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'delete' ? 'Excluir Perfil' : 'Ativar Perfil'}
        message={confirmModal.type === 'delete' 
          ? `Tem certeza que deseja excluir o perfil "${confirmModal.profileName}"? Esta ação não pode ser desfeita.`
          : `Tem certeza que deseja ativar o perfil "${confirmModal.profileName}"?`
        }
        confirmText={confirmModal.type === 'delete' ? 'Excluir' : 'Ativar'}
        cancelText="Cancelar"
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, profileId: '', profileName: '', type: 'delete' })}
        type={confirmModal.type}
      />
    </div>
  );
}