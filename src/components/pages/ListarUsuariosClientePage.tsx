import React, { useState, useEffect } from 'react';
import { Search, Download, Printer, Plus, Edit, Trash2, RefreshCw, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ClientUser {
  id: string;
  full_name: string;
  email: string;
  agency_name: string;
  agency_profile: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserModalProps {
  isOpen: boolean;
  user: ClientUser | null;
  onClose: () => void;
  onSave: (userData: Partial<ClientUser>) => void;
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
  userName: string;
}

function UserModal({ isOpen, user, onClose, onSave, loading }: UserModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    agency_name: '',
    agency_profile: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        agency_name: user.agency_name || '',
        agency_profile: user.agency_profile || ''
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        agency_name: '',
        agency_profile: ''
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail deve ter um formato válido';
    }

    if (!formData.agency_name.trim()) {
      newErrors.agency_name = 'Agência é obrigatória';
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
            {user ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
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
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome completo do usuário"
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@exemplo.com"
              disabled={!!user} // Não permite editar email de usuário existente
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agência *
            </label>
            <input
              type="text"
              value={formData.agency_name}
              onChange={(e) => setFormData(prev => ({ ...prev, agency_name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.agency_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome da agência"
            />
            {errors.agency_name && <p className="text-red-500 text-sm mt-1">{errors.agency_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perfil Agência
            </label>
            <input
              type="text"
              value={formData.agency_profile}
              onChange={(e) => setFormData(prev => ({ ...prev, agency_profile: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Perfil da agência"
            />
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

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, userName }: ConfirmModalProps) {
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
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            aria-label={`Excluir usuário ${userName}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ListarUsuariosClientePageProps {
  onItemClick: (item: string) => void;
}

export default function ListarUsuariosClientePage({ onItemClick }: ListarUsuariosClientePageProps) {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ClientUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ClientUser | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: '', userName: '' });

  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Buscar todos os usuários do banco de dados
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          role,
          auth_id,
          created_at,
          updated_at,
          agencies!inner (
            corporate_name,
            profile
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar emails dos usuários do auth.users
      const usersWithEmail = await Promise.all(
        (usersData || []).map(async (user) => {
          let email = 'N/A';
          if (user.auth_id) {
            // TODO: Implementar busca real do email via RPC ou view
            email = 'N/A';
          }
          return { ...user, email };
        })
      );

      const transformedUsers: ClientUser[] = usersWithEmail.map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        agency_name: user.agencies?.corporate_name || 'N/A',
        agency_profile: user.agencies?.profile || 'N/A',
        active: true,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.agency_name.toLowerCase().includes(searchLower) ||
        user.agency_profile.toLowerCase().includes(searchLower)
      );
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleCreateUser = () => {
    // Navegar para cadastro (seria implementado com router)
    console.log('Navegar para Usuário › Cadastrar');
  };

  const handleEditUser = (user: ClientUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmModal({ isOpen: true, userId, userName });
  };

  const handleSaveUser = async (userData: Partial<ClientUser>) => {
    try {
      setModalLoading(true);

      if (editingUser) {
        // Editar usuário existente (PUT /users/{id})
        console.log('Editando usuário:', editingUser.id, userData);
        
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...userData, updated_at: new Date().toISOString() }
            : user
        ));
      } else {
        // Criar novo usuário (POST /users)
        console.log('Criando usuário:', userData);
        
        const newUser: ClientUser = {
          id: Date.now().toString(),
          full_name: userData.full_name || '',
          email: userData.email || '',
          agency_name: userData.agency_name || '',
          agency_profile: userData.agency_profile || '',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setUsers(prev => [newUser, ...prev]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Tente novamente.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    const { userId } = confirmModal;
    
    try {
      // DELETE /users/{id}
      console.log('Excluindo usuário:', userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // Toast de sucesso
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário. Tente novamente.');
    } finally {
      setConfirmModal({ isOpen: false, userId: '', userName: '' });
    }
  };

  const handleDownloadReport = async () => {
    try {
      // GET /users/report
      console.log('Baixando relatório de usuários...');
      // Simular download
      const csvContent = [
        'Nome,E-mail,Agência,Perfil Agência,Status',
        ...filteredUsers.map(user => 
          `"${user.full_name}","${user.email}","${user.agency_name}","${user.agency_profile}","${user.active ? 'Ativo' : 'Inativo'}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'relatorio-usuarios.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Paginação
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredUsers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando usuários...</div>
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
          <span>Usuário</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Listar</span>
        </nav>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Atualizar lista de usuários"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>

          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Baixar relatório de usuários"
          >
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="Imprimir tabela de usuários"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </button>
          
          <button
            onClick={handleCreateUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            aria-label="Cadastrar novo usuário"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Novo Usuário
          </button>
        </div>
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Listagem de Usuários</h1>

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
            aria-label="Filtrar usuários"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Agência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Perfil Agência
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              currentItems.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="break-words">
                      {user.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="break-words" title={user.email}>
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="break-words">
                      {user.agency_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.agency_profile === 'B2B' ? 'bg-blue-100 text-blue-800' :
                      user.agency_profile === 'Parceiro' ? 'bg-green-100 text-green-800' :
                      user.agency_profile === 'Corporativo' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.agency_profile}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label={`Editar usuário ${user.full_name}`}
                        tabIndex={0}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        aria-label={`Excluir usuário ${user.full_name}`}
                        tabIndex={0}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
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
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Próxima página"
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
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginação">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Primeira página"
                  >
                    ‹‹
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>
                  
                  {/* Páginas */}
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage <= 2) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
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
                        aria-label={`Página ${pageNum}`}
                        aria-current={pageNum === currentPage ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Próxima página"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Última página"
                  >
                    ››
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total de itens */}
      <div className="mt-4 text-sm text-gray-600">
        Total de usuários: {totalItems}
      </div>

      {/* Modal de usuário */}
      <UserModal
        isOpen={isModalOpen}
        user={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        loading={modalLoading}
      />

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${confirmModal.userName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, userId: '', userName: '' })}
        userName={confirmModal.userName}
      />
    </div>
  );
}