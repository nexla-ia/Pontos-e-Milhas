import React, { useState, useEffect } from 'react';
import { Search, Plus, X, ArrowLeft, ArrowRight, Save, User, Plane, Users, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  full_name: string;
  role: string;
}

interface Airport {
  ident: string;
  name: string;
  iata_code: string;
  municipality: string;
}

interface Trecho {
  id: string;
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
}

interface Passageiro {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  documento: string;
  tipo: 'adulto' | 'crianca' | 'bebe';
}

interface FormData {
  usuario: string;
  adultos: number;
  criancas: number;
  bebes: number;
  classe: 'economica' | 'executiva';
  trechos: Trecho[];
  passageiros: Passageiro[];
  formaPagamento: string;
  valorTotal: number;
  observacoes: string;
}

type TabType = 'inicio' | 'trechos' | 'passageiros' | 'pagamentos';

export default function CadastroManualPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [users, setUsers] = useState<User[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    usuario: '',
    adultos: 1,
    criancas: 0,
    bebes: 0,
    classe: 'economica',
    trechos: [{ id: '1', origem: '', destino: '', dataIda: '', dataVolta: '' }],
    passageiros: [],
    formaPagamento: '',
    valorTotal: 0,
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
    loadAirports();
  }, []);

  useEffect(() => {
    // Atualizar lista de passageiros quando mudar quantidade
    const totalPassageiros = formData.adultos + formData.criancas + formData.bebes;
    const passageiros: Passageiro[] = [];
    
    // Adultos
    for (let i = 0; i < formData.adultos; i++) {
      passageiros.push({
        id: `adulto-${i + 1}`,
        nomeCompleto: '',
        dataNascimento: '',
        documento: '',
        tipo: 'adulto'
      });
    }
    
    // Crianças
    for (let i = 0; i < formData.criancas; i++) {
      passageiros.push({
        id: `crianca-${i + 1}`,
        nomeCompleto: '',
        dataNascimento: '',
        documento: '',
        tipo: 'crianca'
      });
    }
    
    // Bebês
    for (let i = 0; i < formData.bebes; i++) {
      passageiros.push({
        id: `bebe-${i + 1}`,
        nomeCompleto: '',
        dataNascimento: '',
        documento: '',
        tipo: 'bebe'
      });
    }

    setFormData(prev => ({ ...prev, passageiros }));
  }, [formData.adultos, formData.criancas, formData.bebes]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('role', 'emissor')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadAirports = async () => {
    try {
      const { data, error } = await supabase
        .from('airports')
        .select('ident, name, iata_code, municipality')
        .not('iata_code', 'is', null)
        .order('name')
        .limit(100);

      if (error) throw error;
      setAirports(data || []);
    } catch (error) {
      console.error('Erro ao carregar aeroportos:', error);
    }
  };

  const validateTab = (tab: TabType): boolean => {
    const newErrors: Record<string, string> = {};

    switch (tab) {
      case 'inicio':
        if (!formData.usuario) newErrors.usuario = 'Usuário é obrigatório';
        if (formData.adultos < 1) newErrors.adultos = 'Deve ter pelo menos 1 adulto';
        break;

      case 'trechos':
        formData.trechos.forEach((trecho, index) => {
          if (!trecho.origem) newErrors[`trecho-${index}-origem`] = 'Origem é obrigatória';
          if (!trecho.destino) newErrors[`trecho-${index}-destino`] = 'Destino é obrigatório';
          if (!trecho.dataIda) newErrors[`trecho-${index}-dataIda`] = 'Data de ida é obrigatória';
        });
        break;

      case 'passageiros':
        formData.passageiros.forEach((passageiro, index) => {
          if (!passageiro.nomeCompleto) newErrors[`passageiro-${index}-nome`] = 'Nome é obrigatório';
          if (!passageiro.dataNascimento) newErrors[`passageiro-${index}-nascimento`] = 'Data de nascimento é obrigatória';
          if (!passageiro.documento) newErrors[`passageiro-${index}-documento`] = 'Documento é obrigatório';
        });
        break;

      case 'pagamentos':
        if (!formData.formaPagamento) newErrors.formaPagamento = 'Forma de pagamento é obrigatória';
        if (formData.valorTotal <= 0) newErrors.valorTotal = 'Valor total deve ser maior que zero';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (nextTab: TabType) => {
    if (validateTab(activeTab)) {
      setActiveTab(nextTab);
    }
  };

  const handlePrevious = (prevTab: TabType) => {
    setActiveTab(prevTab);
  };

  const addTrecho = () => {
    const newTrecho: Trecho = {
      id: Date.now().toString(),
      origem: '',
      destino: '',
      dataIda: '',
      dataVolta: ''
    };
    setFormData(prev => ({
      ...prev,
      trechos: [...prev.trechos, newTrecho]
    }));
  };

  const removeTrecho = (id: string) => {
    setFormData(prev => ({
      ...prev,
      trechos: prev.trechos.filter(t => t.id !== id)
    }));
  };

  const updateTrecho = (id: string, field: keyof Trecho, value: string) => {
    setFormData(prev => ({
      ...prev,
      trechos: prev.trechos.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const updatePassageiro = (id: string, field: keyof Passageiro, value: string) => {
    setFormData(prev => ({
      ...prev,
      passageiros: prev.passageiros.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleSave = async () => {
    if (!validateTab('pagamentos')) return;

    try {
      setSaving(true);

      // Preparar payload para a API
      const payload = {
        user_id: formData.usuario,
        agency_id: null,
        total_amount: formData.valorTotal,
        payment_method: formData.formaPagamento,
        notes: formData.observacoes,
        status: 'open'
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          order_number: `OP-${Date.now()}`,
          user_id: formData.usuario,
          agency_id: null,
          total_amount: formData.valorTotal,
          payment_method: formData.formaPagamento,
          notes: formData.observacoes,
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Pedido criado com sucesso!');
      
      // Reset form
      setFormData({
        usuario: '',
        adultos: 1,
        criancas: 0,
        bebes: 0,
        classe: 'economica',
        trechos: [{ id: '1', origem: '', destino: '', dataIda: '', dataVolta: '' }],
        passageiros: [],
        formaPagamento: '',
        valorTotal: 0,
        observacoes: ''
      });
      setActiveTab('inicio');

    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      alert('Erro ao salvar pedido. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'inicio', label: 'Início', icon: User },
    { id: 'trechos', label: 'Trechos', icon: Plane },
    { id: 'passageiros', label: 'Passageiros', icon: Users },
    { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard }
  ];

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>OPs Geradas</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastro Manual</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastro Manual de Pedidos</h1>

      {/* Abas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6">
          {/* Aba Início */}
          {activeTab === 'inicio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuário *
                  </label>
                  <select
                    value={formData.usuario}
                    onChange={(e) => setFormData(prev => ({ ...prev, usuario: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.usuario ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um usuário</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                  {errors.usuario && <p className="text-red-500 text-sm mt-1">{errors.usuario}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adultos *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.adultos}
                    onChange={(e) => setFormData(prev => ({ ...prev, adultos: parseInt(e.target.value) || 1 }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.adultos ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.adultos && <p className="text-red-500 text-sm mt-1">{errors.adultos}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crianças
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.criancas}
                    onChange={(e) => setFormData(prev => ({ ...prev, criancas: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bebês
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bebes}
                    onChange={(e) => setFormData(prev => ({ ...prev, bebes: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Classe *
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="classe"
                      value="economica"
                      checked={formData.classe === 'economica'}
                      onChange={(e) => setFormData(prev => ({ ...prev, classe: e.target.value as 'economica' | 'executiva' }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Econômica</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="classe"
                      value="executiva"
                      checked={formData.classe === 'executiva'}
                      onChange={(e) => setFormData(prev => ({ ...prev, classe: e.target.value as 'economica' | 'executiva' }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Executiva</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleNext('trechos')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  PROSSEGUIR
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>
              </div>
            </div>
          )}

          {/* Aba Trechos */}
          {activeTab === 'trechos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Trechos da Viagem</h3>
                <button
                  onClick={addTrecho}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Adicionar Trecho
                </button>
              </div>

              <div className="space-y-4">
                {formData.trechos.map((trecho, index) => (
                  <div key={trecho.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Trecho {index + 1}</h4>
                      {formData.trechos.length > 1 && (
                        <button
                          onClick={() => removeTrecho(trecho.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Origem *
                        </label>
                        <select
                          value={trecho.origem}
                          onChange={(e) => updateTrecho(trecho.id, 'origem', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`trecho-${index}-origem`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione origem</option>
                          {airports.map(airport => (
                            <option key={airport.ident} value={airport.iata_code}>
                              {airport.iata_code} - {airport.name}
                            </option>
                          ))}
                        </select>
                        {errors[`trecho-${index}-origem`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`trecho-${index}-origem`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Destino *
                        </label>
                        <select
                          value={trecho.destino}
                          onChange={(e) => updateTrecho(trecho.id, 'destino', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`trecho-${index}-destino`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione destino</option>
                          {airports.map(airport => (
                            <option key={airport.ident} value={airport.iata_code}>
                              {airport.iata_code} - {airport.name}
                            </option>
                          ))}
                        </select>
                        {errors[`trecho-${index}-destino`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`trecho-${index}-destino`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Ida *
                        </label>
                        <input
                          type="date"
                          value={trecho.dataIda}
                          onChange={(e) => updateTrecho(trecho.id, 'dataIda', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`trecho-${index}-dataIda`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`trecho-${index}-dataIda`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`trecho-${index}-dataIda`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Volta
                        </label>
                        <input
                          type="date"
                          value={trecho.dataVolta}
                          onChange={(e) => updateTrecho(trecho.id, 'dataVolta', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => handlePrevious('inicio')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 inline" />
                  Voltar
                </button>
                <button
                  onClick={() => handleNext('passageiros')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>
              </div>
            </div>
          )}

          {/* Aba Passageiros */}
          {activeTab === 'passageiros' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Dados dos Passageiros</h3>

              <div className="space-y-6">
                {formData.passageiros.map((passageiro, index) => (
                  <div key={passageiro.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4 capitalize">
                      {passageiro.tipo} {index + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={passageiro.nomeCompleto}
                          onChange={(e) => updatePassageiro(passageiro.id, 'nomeCompleto', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`passageiro-${index}-nome`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Nome completo do passageiro"
                        />
                        {errors[`passageiro-${index}-nome`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`passageiro-${index}-nome`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Nascimento *
                        </label>
                        <input
                          type="date"
                          value={passageiro.dataNascimento}
                          onChange={(e) => updatePassageiro(passageiro.id, 'dataNascimento', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`passageiro-${index}-nascimento`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`passageiro-${index}-nascimento`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`passageiro-${index}-nascimento`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Documento (CPF/RG) *
                        </label>
                        <input
                          type="text"
                          value={passageiro.documento}
                          onChange={(e) => updatePassageiro(passageiro.id, 'documento', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`passageiro-${index}-documento`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="CPF ou RG"
                        />
                        {errors[`passageiro-${index}-documento`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`passageiro-${index}-documento`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => handlePrevious('trechos')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 inline" />
                  Voltar
                </button>
                <button
                  onClick={() => handleNext('pagamentos')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>
              </div>
            </div>
          )}

          {/* Aba Pagamentos */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Informações de Pagamento</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento *
                  </label>
                  <select
                    value={formData.formaPagamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, formaPagamento: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.formaPagamento ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione forma de pagamento</option>
                    <option value="pix">PIX</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="boleto">Boleto Bancário</option>
                  </select>
                  {errors.formaPagamento && (
                    <p className="text-red-500 text-sm mt-1">{errors.formaPagamento}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Total *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorTotal}
                    onChange={(e) => setFormData(prev => ({ ...prev, valorTotal: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.valorTotal ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0,00"
                  />
                  {errors.valorTotal && (
                    <p className="text-red-500 text-sm mt-1">{errors.valorTotal}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  rows={4}
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações adicionais sobre o pedido..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => handlePrevious('passageiros')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 inline" />
                  Voltar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  {saving ? 'Salvando...' : 'Salvar Pedido'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}