import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, X, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  full_name: string;
  role: string;
  auth_id: string;
  agency_id: string;
  created_at: string;
  updated_at: string;
  email?: string;
  active?: boolean;
}

interface UserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
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

function UserModal({ isOpen, user, onClose, onSave, loading }: UserModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'emissor',
    profile: 'Emissor'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'emissor',
        profile: user.role === 'admin' ? 'Administrador' : 
                user.role === 'emissor' ? 'Emissor' : 
                user.role === 'proprietario' ? 'Proprietário' : 'Emissor'
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        role: 'emissor',
        profile: 'Emissor'
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail deve ter um formato válido';
    }

    if (!formData.role) {
      newErrors.role = 'Cargo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const roleMap: Record<string, string> = {
      'Administrador': 'admin',
      'Emissor': 'emissor',
      'Emissor SÓ Milhas': 'emissor',
      'Proprietário': 'proprietario'
    };

    onSave({
      full_name: formData.full_name,
      email: formData.email,
      role: roleMap[formData.profile] || 'emissor'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {user ? 'Editar Usuário' : 'Cadastrar Novo Usuário Administrativo'}
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
              Cargo *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="emissor">Emissor</option>
              <option value="admin">Administrador</option>
              <option value="proprietario">Proprietário</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perfil do Usuário *
            </label>
            <select
              value={formData.profile}
              onChange={(e) => setFormData(prev => ({ ...prev, profile: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Administrador">Administrador</option>
              <option value="Emissor">Emissor</option>
              <option value="Emissor SÓ Milhas">Emissor SÓ Milhas</option>
              <option value="Proprietário">Proprietário</option>
            </select>
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
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListarUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    type: 'delete' | 'activate';
  }>({ isOpen: false, userId: '', userName: '', type: 'delete' });

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

      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          role,
          auth_id,
          agency_id,
          active,
          created_at,
          updated_at
        `)
        .in('role', ['admin', 'emissor', 'proprietario'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar emails dos usuários autenticados
      const usersWithEmail = [];
      
      for (const user of usersData || []) {
        let email = 'N/A';
        
        if (user.auth_id) {
          try {
            // Buscar email do usuário autenticado
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.auth_id);
            if (!authError && authUser.user) {
              email = authUser.user.email || 'N/A';
            }
          } catch (error) {
            console.log('Não foi possível buscar email do usuário:', user.auth_id);
          }
        }
        
        usersWithEmail.push({
          ...user,
          email,
          active: user.active ?? true
        });
      }

      setUsers(usersWithEmail);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      // Em caso de erro, ainda mostrar os usuários sem email
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'emissor', 'proprietario'])
        .order('created_at', { ascending: false });
        
      const usersWithoutEmail = (usersData || []).map(user => ({
        ...user,
        email: 'N/A',
        active: user.active ?? true
      }));
      
      setUsers(usersWithoutEmail);
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
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmModal({ isOpen: true, userId, userName, type: 'delete' });
  };

  const handleActivateUser = (userId: string, userName: string) => {
    setConfirmModal({ isOpen: true, userId, userName, type: 'activate' });
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      setModalLoading(true);

      if (editingUser) {
        // Editar usuário existente
        const { error } = await supabase
          .from('users')
          .update({
            full_name: userData.full_name,
            role: userData.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        // Criar novo usuário
        // Nota: Em produção, isso criaria primeiro o usuário no auth.users
        // e depois na tabela users com o auth_id correspondente
        const { error } = await supabase
          .from('users')
          .insert([{
            full_name: userData.full_name,
            role: userData.role,
            auth_id: null, // Seria preenchido após criar no auth
            agency_id: null
          }]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Tente novamente.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmAction = async () => {
    const { userId, type } = confirmModal;
    
    try {
      if (type === 'delete') {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Ativar usuário (implementar lógica de ativação)
        const { error } = await supabase
          .from('users')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;
      }
      
      await loadUsers();
    } catch (error) {
      console.error(`Erro ao ${type === 'delete' ? 'excluir' : 'ativar'} usuário:`, error);
      alert(`Erro ao ${type === 'delete' ? 'excluir' : 'ativar'} usuário. Tente novamente.`);
    } finally {
      setConfirmModal({ isOpen: false, userId: '', userName: '', type: 'delete' });
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'emissor': 'Emissor',
      'proprietario': 'Proprietário'
    };
    return roleMap[role] || role;
  };

  const getProfileLabel = (role: string) => {
    const profileMap: Record<string, string> = {
      'admin': 'Administrador',
      'emissor': 'Emissor',
      'proprietario': 'Proprietário'
    };
    return profileMap[role] || 'Emissor';
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
      {/* Breadcrumb e botão cadastrar */}
      <div className="flex justify-between items-center mb-6">
        <nav className="text-sm text-gray-600">
          <span>Dashboard</span>
          <span className="mx-2">›</span>
          <span>Usuários Internos</span>
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
            onClick={handleCreateUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Novo Usuário Administrativo
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perfil do Usuário
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="truncate max-w-xs" title={user.email}>
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRoleLabel(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getProfileLabel(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </button>
                      
                      {user.active ? (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.full_name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id, user.full_name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Ativar Usuário
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
        title={confirmModal.type === 'delete' ? 'Excluir Usuário' : 'Ativar Usuário'}
        message={confirmModal.type === 'delete' 
          ? `Tem certeza que deseja excluir o usuário "${confirmModal.userName}"? Esta ação não pode ser desfeita.`
          : `Tem certeza que deseja ativar o usuário "${confirmModal.userName}"?`
        }
        confirmText={confirmModal.type === 'delete' ? 'Excluir' : 'Ativar'}
        cancelText="Cancelar"
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, userId: '', userName: '', type: 'delete' })}
        type={confirmModal.type}
      />
    </div>
  );
}