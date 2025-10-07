import React, { useState, useEffect } from 'react';
import { Save, X, Building2, MapPin, Phone, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Activity {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  name: string;
}

interface FormData {
  razaoSocial: string;
  nomeFantasia: string;
  cnpjCpf: string;
  inicioAtividade: string;
  cep: string;
  codigoW: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  emailPrincipal: string;
  emailFinanceiro: string;
  telefone: string;
  site: string;
  numeroFuncionarios: number;
  limiteConsultas: number;
  perfilAgencia: string;
  atividades: string[];
  observacoes: string;
}

interface FormErrors {
  [key: string]: string;
}

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function CadastrarAgenciaPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpjCpf: '',
    inicioAtividade: '',
    cep: '',
    codigoW: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    emailPrincipal: '',
    emailFinanceiro: '',
    telefone: '',
    site: '',
    numeroFuncionarios: 0,
    limiteConsultas: 0,
    perfilAgencia: '',
    atividades: [],
    observacoes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar atividades
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, name')
        .order('name');

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Carregar perfis de agência
      const { data: profilesData, error: profilesError } = await supabase
        .from('agency_profiles')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // CNPJ
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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

  const validateCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.length === 11 || numbers.length === 14;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Campos obrigatórios
    if (!formData.razaoSocial.trim()) newErrors.razaoSocial = 'Razão Social é obrigatória';
    if (!formData.cnpjCpf.trim()) newErrors.cnpjCpf = 'CNPJ/CPF é obrigatório';
    if (!formData.emailPrincipal.trim()) newErrors.emailPrincipal = 'E-mail Principal é obrigatório';
    if (!formData.emailFinanceiro.trim()) newErrors.emailFinanceiro = 'E-mail Financeiro é obrigatório';
    if (!formData.perfilAgencia) newErrors.perfilAgencia = 'Perfil da Agência é obrigatório';

    // Validações de formato
    if (formData.emailPrincipal && !validateEmail(formData.emailPrincipal)) {
      newErrors.emailPrincipal = 'E-mail deve ter um formato válido';
    }

    if (formData.emailFinanceiro && !validateEmail(formData.emailFinanceiro)) {
      newErrors.emailFinanceiro = 'E-mail deve ter um formato válido';
    }

    if (formData.cnpjCpf && !validateCNPJ(formData.cnpjCpf)) {
      newErrors.cnpjCpf = 'CNPJ deve ter 14 dígitos ou CPF 11 dígitos';
    }

    if (formData.site && formData.site.trim() && !formData.site.startsWith('http')) {
      newErrors.site = 'Site deve começar com http:// ou https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number | string[]) => {
    let processedValue = value;

    // Aplicar máscaras
    if (field === 'cnpjCpf' && typeof value === 'string') {
      processedValue = formatCNPJ(value);
    } else if (field === 'cep' && typeof value === 'string') {
      processedValue = formatCEP(value);
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

  const handleActivityToggle = (activityId: string) => {
    const currentActivities = formData.atividades;
    const newActivities = currentActivities.includes(activityId)
      ? currentActivities.filter(id => id !== activityId)
      : [...currentActivities, activityId];
    
    handleInputChange('atividades', newActivities);
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
            logradouro: data.logradouro || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        corporate_name: formData.razaoSocial,
        trade_name: formData.nomeFantasia || null,
        cnpj: formData.cnpjCpf.replace(/\D/g, '') || null,
        email_primary: formData.emailPrincipal,
        email_financial: formData.emailFinanceiro,
        phone: formData.telefone.replace(/\D/g, '') || null,
        website: formData.site || null,
        num_employees: formData.numeroFuncionarios || null,
        consultation_limit: formData.limiteConsultas || 0,
        profile: profiles.find(p => p.id === formData.perfilAgencia)?.name || 'B2B',
        address_cep: formData.cep.replace(/\D/g, '') || null,
        address_street: formData.logradouro || null,
        address_number: formData.numero || null,
        address_complement: formData.complemento || null,
        district: formData.bairro || null,
        city: formData.cidade || null,
        state: formData.estado || null,
        activities: formData.atividades,
        notes: formData.observacoes || null
      };

      const { error } = await supabase
        .from('agencies')
        .insert([payload]);

      if (error) throw error;

      alert('Agência cadastrada com sucesso!');
      
      // Reset form
      setFormData({
        razaoSocial: '',
        nomeFantasia: '',
        cnpjCpf: '',
        inicioAtividade: '',
        cep: '',
        codigoW: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        emailPrincipal: '',
        emailFinanceiro: '',
        telefone: '',
        site: '',
        numeroFuncionarios: 0,
        limiteConsultas: 0,
        perfilAgencia: '',
        atividades: [],
        observacoes: ''
      });

      // Navegar de volta para lista (seria implementado com router)
      // navigate('/clientes/listar-agencias');

    } catch (error: any) {
      console.error('Erro ao cadastrar agência:', error);
      
      if (error.message?.includes('duplicate key')) {
        setErrors({ cnpjCpf: 'Este CNPJ/CPF já está cadastrado' });
      } else {
        alert(`Erro ao cadastrar agência: ${error.message || 'Tente novamente.'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para lista (seria implementado com router)
    // navigate('/clientes/listar-agencias');
    console.log('Cancelar - navegar para lista de agências');
  };

  const isFormValid = () => {
    const requiredFields = [
      'razaoSocial', 'cnpjCpf', 'emailPrincipal', 'emailFinanceiro', 'perfilAgencia'
    ];
    
    return requiredFields.every(field => {
      const value = formData[field as keyof FormData];
      return typeof value === 'string' ? value.trim() : value;
    });
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Agências</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastrar</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastro de Agências</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Dados da Agência */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <Building2 className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">DADOS DA AGÊNCIA</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Linha 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                  placeholder="Razão Social"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.razaoSocial ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.razaoSocial && <p className="text-red-500 text-sm mt-1">{errors.razaoSocial}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={formData.nomeFantasia}
                  onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                  placeholder="Nome Fantasia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ/CPF *
                </label>
                <input
                  type="text"
                  value={formData.cnpjCpf}
                  onChange={(e) => handleInputChange('cnpjCpf', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cnpjCpf ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cnpjCpf && <p className="text-red-500 text-sm mt-1">{errors.cnpjCpf}</p>}
              </div>
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Início de Atividade
                </label>
                <input
                  type="date"
                  value={formData.inicioAtividade}
                  onChange={(e) => handleInputChange('inicioAtividade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código W
                </label>
                <input
                  type="text"
                  value={formData.codigoW}
                  onChange={(e) => handleInputChange('codigoW', e.target.value)}
                  placeholder="Código W"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Endereço */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <MapPin className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">ENDEREÇO</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logradouro
                </label>
                <input
                  type="text"
                  value={formData.logradouro}
                  onChange={(e) => handleInputChange('logradouro', e.target.value)}
                  placeholder="Logradouro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Complemento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Cidade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione o estado</option>
                  {estadosBrasil.map(estado => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Contato & Limites */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <Phone className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">CONTATO & LIMITES</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Linha 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Principal *
                </label>
                <input
                  type="email"
                  value={formData.emailPrincipal}
                  onChange={(e) => handleInputChange('emailPrincipal', e.target.value)}
                  placeholder="contato@empresa.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.emailPrincipal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.emailPrincipal && <p className="text-red-500 text-sm mt-1">{errors.emailPrincipal}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Financeiro *
                </label>
                <input
                  type="email"
                  value={formData.emailFinanceiro}
                  onChange={(e) => handleInputChange('emailFinanceiro', e.target.value)}
                  placeholder="financeiro@empresa.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.emailFinanceiro ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.emailFinanceiro && <p className="text-red-500 text-sm mt-1">{errors.emailFinanceiro}</p>}
              </div>
            </div>

            {/* Linha 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  Site
                </label>
                <input
                  type="url"
                  value={formData.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                  placeholder="https://www.empresa.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.site ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.site && <p className="text-red-500 text-sm mt-1">{errors.site}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Funcionários
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numeroFuncionarios}
                  onChange={(e) => handleInputChange('numeroFuncionarios', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite de Consultas Sem Pedido
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.limiteConsultas}
                  onChange={(e) => handleInputChange('limiteConsultas', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Perfil & Atividades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <User className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">PERFIL & ATIVIDADES</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perfil Agência *
                </label>
                <select
                  value={formData.perfilAgencia}
                  onChange={(e) => handleInputChange('perfilAgencia', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.perfilAgencia ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Selecione o perfil</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
                {errors.perfilAgencia && <p className="text-red-500 text-sm mt-1">{errors.perfilAgencia}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Atividades
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
                  {loading ? (
                    <p className="text-gray-500 text-sm">Carregando atividades...</p>
                  ) : activities.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma atividade disponível</p>
                  ) : (
                    <div className="space-y-2">
                      {activities.map(activity => (
                        <label key={activity.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.atividades.includes(activity.id)}
                            onChange={() => handleActivityToggle(activity.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{activity.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
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
                placeholder="Observações adicionais sobre a agência..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
    </div>
  );
}