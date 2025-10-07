import React, { useState, useEffect } from 'react';
import { Save, X, User, Shield, Phone, ArrowLeft, Plus, Minus, CheckCircle, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

function EmailConfirmationModal({ isOpen, email, onClose }: EmailConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Usuário Cadastrado com Sucesso!
          </h3>
          
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-sm text-gray-600">
              Um e-mail de confirmação foi enviado para:
            </p>
          </div>
          
          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded mb-4">
            {email}
          </p>
          
          <p className="text-xs text-gray-500 mb-6">
            O usuário deve verificar o e-mail e confirmar a conta antes de fazer login.
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

interface Agency {
  id: string;
  corporate_name: string;
  trade_name: string;
}

interface State {
  id: string;
  name: string;
  code: string;
}

interface City {
  id: string;
  name: string;
  state_id: string;
}

interface UserRole {
  id: string;
  name: string;
}

interface Carrier {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  phone: string;
  carrier: string;
  type: string;
  description: string;
  is_primary: boolean;
}

interface FormData {
  nome: string;
  dataNascimento: string;
  cpf: string;
  sexo: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  estado: string;
  cidade: string;
  perfilUsuario: string;
  agencia: string;
  observacoes: string;
  contatos: Contact[];
}

interface FormErrors {
  [key: string]: string;
}

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos 1 letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos 1 letra maiúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Pelo menos 1 número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Pelo menos 1 caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const estadosBrasil = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
];

const userRoles = [
  { id: 'client', name: 'Cliente' },
  { id: 'agent', name: 'Agente' },
  { id: 'manager', name: 'Gerente' }
];

const phoneTypes = [
  'Celular',
  'Comercial',
  'Residencial',
  'Outro'
];

export default function CadastrarUsuarioClientePage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [createdUserEmail, setCreatedUserEmail] = useState('');

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    dataNascimento: '',
    cpf: '',
    sexo: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    estado: '',
    cidade: '',
    perfilUsuario: '',
    agencia: '',
    observacoes: '',
    contatos: [
      {
        id: '1',
        phone: '',
        carrier: '',
        type: '',
        description: '',
        is_primary: true
      }
    ]
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: false,
    errors: []
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.estado) {
      loadCities(formData.estado);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, cidade: '' }));
    }
  }, [formData.estado]);

  useEffect(() => {
    if (formData.senha) {
      setPasswordValidation(validatePassword(formData.senha));
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
    }
  }, [formData.senha]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar agências
      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select('id, corporate_name, trade_name')
        .order('corporate_name');

      if (agenciesError) throw agenciesError;
      setAgencies(agenciesData || []);

      // Carregar operadoras
      const { data: carriersData, error: carriersError } = await supabase
        .from('operators')
        .select('id, name')
        .order('name');

      if (carriersError) throw carriersError;
      setCarriers(carriersData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (stateCode: string) => {
    try {
      // API de cidades será implementada futuramente
      setCities([]);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
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
    if (!formData.nome.trim()) newErrors.nome = 'Nome completo é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    if (!formData.confirmarSenha) newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
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
    
    if (formData.senha && !passwordValidation.isValid) {
      newErrors.senha = 'Senha não atende aos critérios de segurança';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | Contact[]) => {
    let processedValue = value;

    // Aplicar máscaras
    if (field === 'cpf' && typeof value === 'string') {
      processedValue = formatCPF(value);
    } else if (field === 'cep' && typeof value === 'string') {
      processedValue = formatCEP(value);
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

  const handleCEPBlur = async () => {
    if (formData.cep.length === 9) {
      try {
        const cep = formData.cep.replace(/\D/g, '');
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      phone: '',
      carrier: '',
      type: '',
      description: '',
      is_primary: false
    };
    
    setFormData(prev => ({
      ...prev,
      contatos: [...prev.contatos, newContact]
    }));
  };

  const removeContact = (contactId: string) => {
    if (formData.contatos.length > 1) {
      setFormData(prev => ({
        ...prev,
        contatos: prev.contatos.filter(c => c.id !== contactId)
      }));
    }
  };

  const updateContact = (contactId: string, field: keyof Contact, value: string | boolean) => {
    let processedValue = value;
    
    if (field === 'phone' && typeof value === 'string') {
      processedValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos.map(contact => 
        contact.id === contactId 
          ? { ...contact, [field]: processedValue }
          : contact
      )
    }));
  };

  const setPrimaryContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos.map(contact => ({
        ...contact,
        is_primary: contact.id === contactId
      }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        full_name: formData.nome,
        email: formData.email,
        password: formData.senha,
        birth_date: formData.dataNascimento || null,
        cpf: formData.cpf.replace(/\D/g, '') || null,
        gender: formData.sexo || null,
        address: {
          cep: formData.cep.replace(/\D/g, '') || null,
          street: formData.endereco || null,
          number: formData.numero || null,
          complement: formData.complemento || null,
          district: formData.bairro || null,
          city: formData.cidade || null,
          state: formData.estado || null
        },
        profile: formData.perfilUsuario,
        agency_id: formData.agencia,
        notes: formData.observacoes || null,
        contacts: formData.contatos.filter(c => c.phone.trim()).map(contact => ({
          phone: contact.phone.replace(/\D/g, ''),
          carrier: contact.carrier || null,
          type: contact.type || null,
          description: contact.description || null,
          is_primary: contact.is_primary
        }))
      };

      // Criar usuário no auth.users primeiro
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
          full_name: formData.nome,
          role: 'emissor', // Usuários de agência são emissores por padrão
          agency_id: formData.agencia
        }]);

      if (userError) throw userError;

      // Buscar o usuário criado para obter o ID
      const { data: createdUser, error: fetchUserError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.user?.id)
        .single();

      if (fetchUserError) throw fetchUserError;

      // Criar perfil estendido na tabela user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: createdUser.id,
          birth_date: formData.dataNascimento || null,
          cpf: formData.cpf.replace(/\D/g, '') || null,
          gender: formData.sexo || null,
          address: {
            cep: formData.cep.replace(/\D/g, '') || null,
            street: formData.endereco || null,
            number: formData.numero || null,
            complement: formData.complemento || null,
            district: formData.bairro || null,
            city: formData.cidade || null,
            state: formData.estado || null
          },
          contacts: formData.contatos
            .filter(c => c.phone.trim())
            .map(contact => ({
              phone: contact.phone.replace(/\D/g, ''),
              carrier: contact.carrier || null,
              type: contact.type || null,
              description: contact.description || null,
              is_primary: contact.is_primary
            }))
        }]);

      if (profileError) throw profileError;

      // Mostrar modal de confirmação de email
      setCreatedUserEmail(formData.email);
      setShowEmailModal(true);
      
      // Reset form
      setFormData({
        nome: '',
        dataNascimento: '',
        cpf: '',
        sexo: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        cidade: '',
        perfilUsuario: '',
        agencia: '',
        observacoes: '',
        contatos: [
          {
            id: '1',
            phone: '',
            carrier: '',
            type: '',
            description: '',
            is_primary: true
          }
        ]
      });

      // Navegar de volta para lista (seria implementado com router)
      // navigate('/usuarios/listar');

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
    // navigate('/usuarios/listar');
    console.log('Cancelar - navegar para lista de usuários');
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setCreatedUserEmail('');
  };

  const isFormValid = () => {
    // Verificar campos obrigatórios individualmente
    const hasNome = formData.nome.trim().length > 0;
    const hasEmail = formData.email.trim().length > 0 && validateEmail(formData.email);
    const hasValidPassword = passwordValidation.isValid;
    const hasMatchingPasswords = formData.senha === formData.confirmarSenha;
    const hasAgency = formData.agencia.length > 0;
    
    console.log('Validação do formulário:', {
      hasNome,
      hasEmail,
      hasValidPassword,
      hasMatchingPasswords,
      hasAgency,
      email: formData.email,
      senha: formData.senha,
      agencia: formData.agencia
    });
    
    return hasNome && hasEmail && hasValidPassword && hasMatchingPasswords && hasAgency;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Usuário</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastrar</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastro de Usuário</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Dados do Usuário */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-teal-700 px-6 py-4">
            <div className="flex items-center text-white">
              <User className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Dados do Usuário</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Linha 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-required="true"
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="CPF"
                  maxLength={14}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.cpf ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexo
                </label>
                <select
                  value={formData.sexo}
                  onChange={(e) => handleInputChange('sexo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Linha 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-required="true"
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
                  placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.senha ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-required="true"
                />
                {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                
                {/* Indicadores de validação da senha */}
                {formData.senha && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600 mb-1">Critérios da senha:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center ${formData.senha.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="mr-1">{formData.senha.length >= 8 ? '✓' : '✗'}</span>
                        Mínimo 8 caracteres
                      </div>
                      <div className={`flex items-center ${/[a-z]/.test(formData.senha) ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="mr-1">{/[a-z]/.test(formData.senha) ? '✓' : '✗'}</span>
                        Letra minúscula
                      </div>
                      <div className={`flex items-center ${/[A-Z]/.test(formData.senha) ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="mr-1">{/[A-Z]/.test(formData.senha) ? '✓' : '✗'}</span>
                        Letra maiúscula
                      </div>
                      <div className={`flex items-center ${/\d/.test(formData.senha) ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="mr-1">{/\d/.test(formData.senha) ? '✓' : '✗'}</span>
                        Número
                      </div>
                      <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.senha) ? 'text-green-600' : 'text-red-500'}`}>
                        <span className="mr-1">{/[!@#$%^&*(),.?":{}|<>]/.test(formData.senha) ? '✓' : '✗'}</span>
                        Caractere especial
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Linha 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  placeholder="Confirmar Senha"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-required="true"
                />
                {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  onBlur={handleCEPBlur}
                  placeholder="CEP"
                  maxLength={9}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Linha 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Endereço"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="Número"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Linha 6 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Complemento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Bairro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Linha 7 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione o estado</option>
                  {estadosBrasil.map(estado => (
                    <option key={estado.code} value={estado.code}>
                      {estado.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Nome da cidade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Perfil & Afiliação */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-teal-700 px-6 py-4">
            <div className="flex items-center text-white">
              <Shield className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Perfil & Afiliação</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perfil Usuário *
                </label>
                <select
                  value={formData.perfilUsuario}
                  onChange={(e) => handleInputChange('perfilUsuario', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.perfilUsuario ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-required="true"
                >
                  <option value="">Selecione o perfil</option>
                  {userRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.agencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  aria-required="true"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                rows={4}
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Seção Contatos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-teal-700 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">Contatos</h2>
              </div>
              <button
                type="button"
                onClick={addContact}
                className="bg-teal-600 hover:bg-teal-500 px-3 py-1 rounded text-sm transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Adicionar
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {formData.contatos.map((contato, index) => (
                <div key={contato.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Contato {index + 1}</h4>
                    {formData.contatos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(contato.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={contato.phone}
                        onChange={(e) => updateContact(contato.id, 'phone', e.target.value)}
                        placeholder="Telefone"
                        maxLength={15}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Operadora
                      </label>
                      <select
                        value={contato.carrier}
                        onChange={(e) => updateContact(contato.id, 'carrier', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        {carriers.map(carrier => (
                          <option key={carrier.id} value={carrier.name}>
                            {carrier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={contato.type}
                        onChange={(e) => updateContact(contato.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        {phoneTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={contato.description}
                        onChange={(e) => updateContact(contato.id, 'description', e.target.value)}
                        placeholder="Descrição"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                            name={`principal-${contato.id}`}
                            checked={contato.is_primary}
                            onChange={() => setPrimaryContact(contato.id)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Sim</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`principal-${contato.id}`}
                            checked={!contato.is_primary}
                            onChange={() => {}}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Não</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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