import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Settings, Plus, Trash2, X, Mail, Globe, Palette, Clock, BarChart3, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GeneralSettings {
  emailDisparo: string;
  emailBcc: string;
  corEmail: string;
  corBordaEmail: string;
  idioma: string;
  tempoLoginExpirar: string;
  codigoAnalytics: string;
  tagsHotjar: string;
  seloSeguranca: string;
  emailsCopia: string[];
}

interface CompraSettings {
  moedaSistema: string;
  exibirTaxaServico: boolean;
  exibirCompanhiasPrincipais: boolean;
  coletarEndereco: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
}

interface FormData {
  geral: GeneralSettings;
  compra: CompraSettings;
  contatos: Contact[];
  newContact: {
    name: string;
    email: string;
  };
  newEmailCopia: string;
}

interface FormErrors {
  [key: string]: string;
}

type TabType = 'geral' | 'compra' | 'contatos';

const idiomas = [
  { code: 'auto', name: 'Auto' },
  { code: 'pt-BR', name: 'PT-BR' },
  { code: 'en', name: 'EN' },
  { code: 'es', name: 'ES' },
  { code: 'fr', name: 'FR' }
];

const moedas = [
  { code: 'BRL', name: 'Real Brasileiro (BRL)' },
  { code: 'USD', name: 'Dólar Americano (USD)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'ARS', name: 'Peso Argentino (ARS)' },
  { code: 'CLP', name: 'Peso Chileno (CLP)' },
  { code: 'COP', name: 'Peso Colombiano (COP)' },
  { code: 'PEN', name: 'Sol Peruano (PEN)' }
];

export default function ConfiguracoesGeraisPage() {
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    geral: {
      emailDisparo: '',
      emailBcc: '',
      corEmail: '#ffffff',
      corBordaEmail: '#cccccc',
      idioma: 'auto',
      tempoLoginExpirar: '08:00',
      codigoAnalytics: '',
      tagsHotjar: '',
      seloSeguranca: '',
      emailsCopia: []
    },
    compra: {
      moedaSistema: 'BRL',
      exibirTaxaServico: false,
      exibirCompanhiasPrincipais: false,
      coletarEndereco: false
    },
    contatos: [],
    newContact: {
      name: '',
      email: ''
    },
    newEmailCopia: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Carregar configurações gerais
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('key, value');

      if (settingsError) throw settingsError;

      // Organizar dados por categoria
      const settings = (settingsData || []).reduce((acc: any, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      // TODO: Implementar quando tabela contacts estiver criada
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('active', true)
        .order('name');

      if (contactsError) throw contactsError;

      setFormData(prev => ({
        ...prev,
        geral: {
          emailDisparo: settings.email_disparo || '',
          emailBcc: settings.email_bcc || '',
          corEmail: settings.cor_email || '#ffffff',
          corBordaEmail: settings.cor_borda_email || '#cccccc',
          idioma: settings.idioma || 'auto',
          tempoLoginExpirar: settings.tempo_login_expirar || '08:00',
          codigoAnalytics: settings.codigo_analytics || '',
          tagsHotjar: settings.tags_hotjar || '',
          seloSeguranca: settings.selo_seguranca || '',
          emailsCopia: settings.emails_copia ? JSON.parse(settings.emails_copia) : []
        },
        compra: {
          moedaSistema: settings.moeda_sistema || 'BRL',
          exibirTaxaServico: settings.exibir_taxa_servico === 'true',
          exibirCompanhiasPrincipais: settings.exibir_companhias_principais === 'true',
          coletarEndereco: settings.coletar_endereco === 'true'
        },
        contatos: contactsData || []
      }));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (activeTab === 'geral') {
      if (formData.geral.emailDisparo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.geral.emailDisparo)) {
        newErrors.emailDisparo = 'E-mail de disparo deve ter um formato válido';
      }

      if (formData.geral.emailBcc && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.geral.emailBcc)) {
        newErrors.emailBcc = 'E-mail BCC deve ter um formato válido';
      }

      if (formData.geral.codigoAnalytics && !/^UA-\d+-\d+$/.test(formData.geral.codigoAnalytics)) {
        newErrors.codigoAnalytics = 'Código Analytics deve ter formato UA-XXXXXXXX-X';
      }
    }

    if (activeTab === 'contatos') {
      if (formData.newContact.name && !formData.newContact.email) {
        newErrors.newContactEmail = 'E-mail é obrigatório quando nome é preenchido';
      }

      if (formData.newContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newContact.email)) {
        newErrors.newContactEmail = 'E-mail deve ter um formato válido';
      }

      if (formData.newEmailCopia && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newEmailCopia)) {
        newErrors.newEmailCopia = 'E-mail deve ter um formato válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section: 'geral' | 'compra', field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Limpar erro do campo
    const errorKey = section === 'geral' ? field : `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const handleNewContactChange = (field: 'name' | 'email', value: string) => {
    setFormData(prev => ({
      ...prev,
      newContact: {
        ...prev.newContact,
        [field]: value
      }
    }));

    // Limpar erro
    if (errors[`newContact${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({
        ...prev,
        [`newContact${field.charAt(0).toUpperCase() + field.slice(1)}`]: ''
      }));
    }
  };

  const addEmailCopia = () => {
    if (!formData.newEmailCopia.trim()) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newEmailCopia)) {
      setErrors(prev => ({ ...prev, newEmailCopia: 'E-mail deve ter um formato válido' }));
      return;
    }

    if (formData.geral.emailsCopia.includes(formData.newEmailCopia)) {
      setErrors(prev => ({ ...prev, newEmailCopia: 'Este e-mail já está na lista' }));
      return;
    }

    handleInputChange('geral', 'emailsCopia', [...formData.geral.emailsCopia, formData.newEmailCopia]);
    setFormData(prev => ({ ...prev, newEmailCopia: '' }));
  };

  const removeEmailCopia = (email: string) => {
    const updatedEmails = formData.geral.emailsCopia.filter(e => e !== email);
    handleInputChange('geral', 'emailsCopia', updatedEmails);
  };

  const addContact = async () => {
    if (!formData.newContact.name.trim() || !formData.newContact.email.trim()) {
      setErrors(prev => ({ 
        ...prev, 
        newContactName: !formData.newContact.name.trim() ? 'Nome é obrigatório' : '',
        newContactEmail: !formData.newContact.email.trim() ? 'E-mail é obrigatório' : ''
      }));
      return;
    }

    if (!validateForm()) return;

    try {
      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert([{
        name: formData.newContact.name,
        email: formData.newContact.email
        }])
        .select()
        .single();

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        contatos: [...prev.contatos, newContact!],
        newContact: { name: '', email: '' }
      }));
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      alert('Erro ao adicionar contato. Tente novamente.');
    }
  };

  const removeContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        contatos: prev.contatos.filter(c => c.id !== contactId)
      }));
    } catch (error) {
      console.error('Erro ao remover contato:', error);
      alert('Erro ao remover contato. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        geral: {
          email_disparo: formData.geral.emailDisparo,
          email_bcc: formData.geral.emailBcc,
          cor_email: formData.geral.corEmail,
          cor_borda_email: formData.geral.corBordaEmail,
          idioma: formData.geral.idioma,
          tempo_login_expirar: formData.geral.tempoLoginExpirar,
          codigo_analytics: formData.geral.codigoAnalytics,
          tags_hotjar: formData.geral.tagsHotjar,
          selo_seguranca: formData.geral.seloSeguranca,
          emails_copia: JSON.stringify(formData.geral.emailsCopia)
        },
        compra: {
          moeda_sistema: formData.compra.moedaSistema,
          exibir_taxa_servico: formData.compra.exibirTaxaServico.toString(),
          exibir_companhias_principais: formData.compra.exibirCompanhiasPrincipais.toString(),
          coletar_endereco: formData.compra.coletarEndereco.toString()
        }
      };

      // Salvar configurações no Supabase
      for (const [section, settings] of Object.entries(payload)) {
        for (const [key, value] of Object.entries(settings)) {
          const { error } = await supabase
            .from('settings')
            .upsert({ key, value }, { onConflict: 'key' });

          if (error) throw error;
        }
      }

      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Falha ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para configurações (seria implementado com router)
    console.log('Cancelar - navegar para configurações');
  };

  const openTutorial = () => {
    window.open('#tutorial-analytics', '_blank');
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'compra', label: 'Compra', icon: BarChart3 },
    { id: 'contatos', label: 'Contatos', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Configurações</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Configurações Gerais</span>
      </nav>

      {/* Título */}
      <h1 className="text-gray-800 text-base font-semibold mb-6">Configurações</h1>

      {/* Card Principal com Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
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
                      ? 'border-teal-700 text-white bg-teal-700'
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

        {/* Conteúdo das Tabs */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Aba Geral */}
            {activeTab === 'geral' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* E-mail de disparo */}
                  <div>
                    <label htmlFor="emailDisparo" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail de disparo
                    </label>
                    <input
                      id="emailDisparo"
                      type="email"
                      value={formData.geral.emailDisparo}
                      onChange={(e) => handleInputChange('geral', 'emailDisparo', e.target.value)}
                      placeholder="E-mail de disparo"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.emailDisparo ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.emailDisparo && <p className="text-red-500 text-sm mt-1">{errors.emailDisparo}</p>}
                  </div>

                  {/* E-mail BCC */}
                  <div>
                    <label htmlFor="emailBcc" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail para acompanhamento (cópia oculta)
                    </label>
                    <input
                      id="emailBcc"
                      type="email"
                      value={formData.geral.emailBcc}
                      onChange={(e) => handleInputChange('geral', 'emailBcc', e.target.value)}
                      placeholder="E-mail para acompanhamento (BCC)"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.emailBcc ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.emailBcc && <p className="text-red-500 text-sm mt-1">{errors.emailBcc}</p>}
                  </div>

                  {/* Cor E-mail */}
                  <div>
                    <label htmlFor="corEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Cor E-mail
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        id="corEmail"
                        type="color"
                        value={formData.geral.corEmail}
                        onChange={(e) => handleInputChange('geral', 'corEmail', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.geral.corEmail}
                        onChange={(e) => handleInputChange('geral', 'corEmail', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  {/* Cor Borda E-mail */}
                  <div>
                    <label htmlFor="corBordaEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Borda E-mail
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        id="corBordaEmail"
                        type="color"
                        value={formData.geral.corBordaEmail}
                        onChange={(e) => handleInputChange('geral', 'corBordaEmail', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.geral.corBordaEmail}
                        onChange={(e) => handleInputChange('geral', 'corBordaEmail', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="#cccccc"
                      />
                    </div>
                  </div>

                  {/* Idioma */}
                  <div>
                    <label htmlFor="idioma" className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      id="idioma"
                      value={formData.geral.idioma}
                      onChange={(e) => handleInputChange('geral', 'idioma', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {idiomas.map(idioma => (
                        <option key={idioma.code} value={idioma.code}>
                          {idioma.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tempo Login Expirar */}
                  <div>
                    <label htmlFor="tempoLoginExpirar" className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo p/ Login Expirar
                    </label>
                    <input
                      id="tempoLoginExpirar"
                      type="time"
                      value={formData.geral.tempoLoginExpirar}
                      onChange={(e) => handleInputChange('geral', 'tempoLoginExpirar', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Código Analytics */}
                  <div className="md:col-span-2">
                    <label htmlFor="codigoAnalytics" className="block text-sm font-medium text-gray-700 mb-2">
                      Código do analytics
                    </label>
                    <input
                      id="codigoAnalytics"
                      type="text"
                      value={formData.geral.codigoAnalytics}
                      onChange={(e) => handleInputChange('geral', 'codigoAnalytics', e.target.value)}
                      placeholder="UA-XXXXXXXX-X"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.codigoAnalytics ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.codigoAnalytics && <p className="text-red-500 text-sm mt-1">{errors.codigoAnalytics}</p>}
                  </div>
                </div>

                {/* Tags Hotjar */}
                <div>
                  <label htmlFor="tagsHotjar" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Hotjar)
                  </label>
                  <textarea
                    id="tagsHotjar"
                    rows={4}
                    value={formData.geral.tagsHotjar}
                    onChange={(e) => handleInputChange('geral', 'tagsHotjar', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="text-gray-500 text-xs mt-1">Todo código colado aqui será executado</p>
                </div>

                {/* Selo de Segurança */}
                <div>
                  <label htmlFor="seloSeguranca" className="block text-sm font-medium text-gray-700 mb-2">
                    Selo de Segurança Virtual
                  </label>
                  <textarea
                    id="seloSeguranca"
                    rows={4}
                    value={formData.geral.seloSeguranca}
                    onChange={(e) => handleInputChange('geral', 'seloSeguranca', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="text-gray-500 text-xs mt-1">Todo código colado aqui será executado</p>
                </div>

                {/* Lista de e-mails para cópia oculta */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Lista de e-mails para cópia oculta da cotação
                  </h3>
                  <div className="flex space-x-3 mb-4">
                    <input
                      type="email"
                      value={formData.newEmailCopia}
                      onChange={(e) => setFormData(prev => ({ ...prev, newEmailCopia: e.target.value }))}
                      placeholder="novo@email.com"
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.newEmailCopia ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={addEmailCopia}
                      className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                    >
                      Cadastrar
                    </button>
                  </div>
                  {errors.newEmailCopia && <p className="text-red-500 text-sm mb-4">{errors.newEmailCopia}</p>}
                  
                  {formData.geral.emailsCopia.length > 0 && (
                    <div className="space-y-2">
                      {formData.geral.emailsCopia.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                          <span className="text-sm text-gray-900">{email}</span>
                          <button
                            type="button"
                            onClick={() => removeEmailCopia(email)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Aba Compra */}
            {activeTab === 'compra' && (
              <div className="space-y-8">
                {/* Configuração Monetária */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-teal-700 px-4 py-3">
                    <h3 className="text-white font-semibold">Configuração Monetária</h3>
                  </div>
                  <div className="p-4">
                    <div>
                      <label htmlFor="moedaSistema" className="block text-sm font-medium text-gray-700 mb-2">
                        Moeda do sistema
                      </label>
                      <select
                        id="moedaSistema"
                        value={formData.compra.moedaSistema}
                        onChange={(e) => handleInputChange('compra', 'moedaSistema', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        {moedas.map(moeda => (
                          <option key={moeda.code} value={moeda.code}>
                            {moeda.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Configuração de Busca */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-teal-700 px-4 py-3">
                    <h3 className="text-white font-semibold">Configuração de Busca</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.compra.exibirTaxaServico}
                        onChange={(e) => handleInputChange('compra', 'exibirTaxaServico', e.target.checked)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Exibir taxa de serviço separada</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.compra.exibirCompanhiasPrincipais}
                        onChange={(e) => handleInputChange('compra', 'exibirCompanhiasPrincipais', e.target.checked)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Exibir companhias operantes como principal</span>
                    </label>
                  </div>
                </div>

                {/* Configuração de Coleta de Dados */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-teal-700 px-4 py-3">
                    <h3 className="text-white font-semibold">Configuração de Coleta de Dados</h3>
                  </div>
                  <div className="p-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.compra.coletarEndereco}
                        onChange={(e) => handleInputChange('compra', 'coletarEndereco', e.target.checked)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Coletar endereço no cadastro de usuário</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Contatos */}
            {activeTab === 'contatos' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Contatos de Suporte</h3>
                
                {/* Adicionar novo contato */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label htmlFor="newContactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Contato
                    </label>
                    <input
                      id="newContactName"
                      type="text"
                      value={formData.newContact.name}
                      onChange={(e) => handleNewContactChange('name', e.target.value)}
                      placeholder="Nome do contato"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.newContactName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.newContactName && <p className="text-red-500 text-sm mt-1">{errors.newContactName}</p>}
                  </div>

                  <div>
                    <label htmlFor="newContactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail do Contato
                    </label>
                    <input
                      id="newContactEmail"
                      type="email"
                      value={formData.newContact.email}
                      onChange={(e) => handleNewContactChange('email', e.target.value)}
                      placeholder="contato@email.com"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.newContactEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.newContactEmail && <p className="text-red-500 text-sm mt-1">{errors.newContactEmail}</p>}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={addContact}
                      className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Lista de contatos */}
                {formData.contatos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">Contatos Cadastrados</h4>
                    {formData.contatos.map((contato) => (
                      <div key={contato.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md">
                        <div>
                          <div className="font-medium text-gray-900">{contato.name}</div>
                          <div className="text-sm text-gray-600">{contato.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeContact(contato.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
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
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}