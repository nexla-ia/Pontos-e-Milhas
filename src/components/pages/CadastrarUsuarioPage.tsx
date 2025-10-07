import React, { useState, useEffect } from 'react';
import { Save, X, User, Shield, Phone, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Agency {
  id: string;
  corporate_name: string;
  trade_name: string;
}

interface FormData {
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  cpf: string;
  rg: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cargo: string;
  perfilUsuario: string;
  agencia: string;
  telefone: string;
  operadora: string;
  tipoTelefone: string;
  descricaoTelefone: string;
  telefonePrincipal: boolean;
}

interface EmailConfirmationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

function EmailConfirmationModal({ isOpen, email, onClose }: EmailConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Usuário Cadastrado com Sucesso!
          </h3>
          <p className="text-gray-600 mb-4">
            Um email de confirmação foi enviado para:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">{email}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            O usuário deve verificar o email e confirmar a conta antes de fazer login.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

interface FormErrors {
  [key: string]: string;
}

export default function CadastrarUsuarioPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [createdUserEmail, setCreatedUserEmail] = useState('');

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    sobrenome: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: '',
    perfilUsuario: '',
    agencia: '',
    telefone: '',
    operadora: '',
    tipoTelefone: '',
    descricaoTelefone: '',
    telefonePrincipal: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agencies')
        .select('id, corporate_name, trade_name')
        .order('corporate_name');

      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      console.error('Erro ao carregar agências:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Campos obrigatórios
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.sobrenome.trim()) newErrors.sobrenome = 'Sobrenome é obrigatório';
    if (!formData.dataNascimento) newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    if (!formData.confirmarSenha) newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    if (!formData.cargo.trim()) newErrors.cargo = 'Cargo é obrigatório';
    if (!formData.perfilUsuario) newErrors.perfilUsuario = 'Perfil do usuário é obrigatório';
    if (!formData.agencia) newErrors.agencia = 'Agência é obrigatória';

    // Validações de formato
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'E-mail deve ter um formato válido';
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    if (formData.senha && formData.senha.length < 8) {
      newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    let processedValue = value;

    // Aplicar máscaras
    if (field === 'cpf' && typeof value === 'string') {
      processedValue = formatCPF(value);
    } else if (field === 'telefone' && typeof value === 'string') {
      processedValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Mapear perfil para role
      const roleMap: Record<string, string> = {
        'Administrador': 'admin',
        'Emissor': 'emissor',
        'Proprietário': 'proprietario'
      };

      const payload = {
        full_name: `${formData.nome} ${formData.sobrenome}`,
        email: formData.email,
        password: formData.senha,
        role: roleMap[formData.perfilUsuario] || 'emissor',
        agency_id: formData.agencia
      };

      // Criar usuário no auth.users primeiro (simulado)
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha
      });

      if (authError) throw authError;

      // Criar registro na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          auth_id: authUser.user?.id,
          full_name: `${formData.nome} ${formData.sobrenome}`,
          role: roleMap[formData.perfilUsuario] || 'emissor',
          agency_id: formData.agencia || null
        }]);

      if (userError) throw userError;

      // Buscar o usuário criado para obter o ID
      const { data: createdUser, error: fetchUserError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.user?.id)
        .single();

      if (fetchUserError) throw fetchUserError;

      // Criar perfil estendido na tabela user_profiles se houver dados adicionais
      if (formData.dataNascimento || formData.cpf || formData.telefone) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: createdUser.id,
            birth_date: formData.dataNascimento || null,
            cpf: formData.cpf.replace(/\D/g, '') || null,
            position: formData.cargo || null,
            contacts: formData.telefone ? [{
              phone: formData.telefone.replace(/\D/g, ''),
              carrier: formData.operadora || null,
              type: formData.tipoTelefone || null,
              description: formData.descricaoTelefone || null,
              is_primary: formData.telefonePrincipal
            }] : []
          }]);

        if (profileError) {
          console.error('Erro ao criar perfil do usuário:', profileError);
          // Não falha o cadastro se o perfil não for criado
        }
      }

      // Mostrar modal de confirmação de email
      setCreatedUserEmail(formData.email);
      setShowEmailModal(true);
      
      // Reset form
      setFormData({
        nome: '',
        sobrenome: '',
        dataNascimento: '',
        cpf: '',
        rg: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        cargo: '',
        perfilUsuario: '',
        agencia: '',
        telefone: '',
        operadora: '',
        tipoTelefone: '',
        descricaoTelefone: '',
        telefonePrincipal: true
      });

      // Navegar de volta para lista (seria implementado com router)
      // navigate('/usuarios-internos/listar');

    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error);
      
      if (error.message?.includes('already registered')) {
        setErrors({ email: 'Este e-mail já está cadastrado' });
      } else {
        alert(`Erro ao cadastrar usuário: ${error.message || 'Tente novamente.'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para lista (seria implementado com router)
    // navigate('/usuarios-internos/listar');
    console.log('Cancelar - navegar para lista');
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setCreatedUserEmail('');
  };

  const isFormValid = () => {
    const requiredFields = [
      'nome', 'sobrenome', 'dataNascimento', 'cpf', 'email', 
      'senha', 'confirmarSenha', 'cargo', 'perfilUsuario', 'agencia'
    ];
    
    return requiredFields.every(field => {
      const value = formData[field as keyof FormData];
      return typeof value === 'string' ? value.trim() : value;
    }) && formData.senha === formData.confirmarSenha && formData.senha.length >= 8;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Usuários Internos</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastrar</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastro de Usuários Internos</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Dados do Usuário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <User className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">DADOS DO USUÁRIO</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Campos Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome *
                </label>
                <input
                  type="text"
                  value={formData.sobrenome}
                  onChange={(e) => handleInputChange('sobrenome', e.target.value)}
                  placeholder="Sobrenome"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sobrenome ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.sobrenome && <p className="text-red-500 text-sm mt-1">{errors.sobrenome}</p>}
              </div>
            </div>

            {/* Campos de Identificação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dataNascimento ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dataNascimento && <p className="text-red-500 text-sm mt-1">{errors.dataNascimento}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cpf ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RG
                </label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  placeholder="RG"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.senha ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  placeholder="Confirme a senha"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Seção Perfil & Credenciais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <Shield className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">PERFIL & CREDENCIAIS</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  placeholder="Cargo"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cargo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cargo && <p className="text-red-500 text-sm mt-1">{errors.cargo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perfil do Usuário *
                </label>
                <select
                  value={formData.perfilUsuario}
                  onChange={(e) => handleInputChange('perfilUsuario', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.perfilUsuario ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione o perfil</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Emissor">Emissor</option>
                  <option value="Emissor SÓ Milhas">Emissor SÓ Milhas</option>
                  <option value="Proprietário">Proprietário</option>
                </select>
                {errors.perfilUsuario && <p className="text-red-500 text-sm mt-1">{errors.perfilUsuario}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agência *
                </label>
                <select
                  value={formData.agencia}
                  onChange={(e) => handleInputChange('agencia', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.agencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Selecione a agência</option>
                  {agencies.map(agency => (
                    <option key={agency.id} value={agency.id}>
                      {agency.corporate_name}
                    </option>
                  ))}
                </select>
                {errors.agencia && <p className="text-red-500 text-sm mt-1">{errors.agencia}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Seção Contato Alternativo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <Phone className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">CONTATO ALTERNATIVO</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operadora
                </label>
                <select
                  value={formData.operadora}
                  onChange={(e) => handleInputChange('operadora', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="TIM">TIM</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Oi">Oi</option>
                  <option value="Claro">Claro</option>
                  <option value="Outras">Outras</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipoTelefone}
                  onChange={(e) => handleInputChange('tipoTelefone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="Celular">Celular</option>
                  <option value="Fixo">Fixo</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricaoTelefone}
                  onChange={(e) => handleInputChange('descricaoTelefone', e.target.value)}
                  placeholder="Descrição"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principal
                </label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="telefonePrincipal"
                      checked={formData.telefonePrincipal === true}
                      onChange={() => handleInputChange('telefonePrincipal', true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="telefonePrincipal"
                      checked={formData.telefonePrincipal === false}
                      onChange={() => handleInputChange('telefonePrincipal', false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Não</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações do Formulário */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={!isFormValid() || saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>

      {/* Modal de confirmação de email */}
      <EmailConfirmationModal
        isOpen={showEmailModal}
        email={createdUserEmail}
        onClose={handleCloseEmailModal}
      />
    </div>
  );
}
