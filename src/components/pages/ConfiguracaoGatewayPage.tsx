import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, CreditCard, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GatewayCredentials {
  [key: string]: string;
}

interface GatewayConfig {
  provider: string;
  credentials: GatewayCredentials;
  enabled: boolean;
}

interface FormData {
  credentials: GatewayCredentials;
  applyToAllSearchEngines: boolean;
}

interface FormErrors {
  [key: string]: string;
}

type GatewayProvider = 'pagarme' | 'pagseguro' | 'mercadopago' | 'paypal' | 'stripe';

const gatewayConfigs = {
  pagarme: {
    name: 'PagarMe',
    fields: [
      { key: 'token', label: 'Token PagarMe', type: 'password', placeholder: 'Insira o token PagarMe' }
    ]
  },
  pagseguro: {
    name: 'PagSeguro',
    fields: [
      { key: 'key', label: 'Chave PagSeguro', type: 'password', placeholder: 'Insira a chave PagSeguro' }
    ]
  },
  mercadopago: {
    name: 'Mercado Pago',
    fields: [
      { key: 'client_id', label: 'Client ID Mercado Pago', type: 'text', placeholder: 'Insira o Client ID' },
      { key: 'client_secret', label: 'Client Secret Mercado Pago', type: 'password', placeholder: 'Insira o Client Secret' }
    ]
  },
  paypal: {
    name: 'PayPal',
    fields: [
      { key: 'username', label: 'Username PayPal', type: 'text', placeholder: 'Insira o Username' },
      { key: 'password', label: 'Password PayPal', type: 'password', placeholder: 'Insira o Password' }
    ]
  },
  stripe: {
    name: 'Stripe',
    fields: [
      { key: 'publishable_key', label: 'Publishable Key Stripe', type: 'text', placeholder: 'Insira a Publishable Key' },
      { key: 'secret_key', label: 'Secret Key Stripe', type: 'password', placeholder: 'Insira a Secret Key' }
    ]
  }
};

export default function ConfiguracaoGatewayPage() {
  const [activeTab, setActiveTab] = useState<GatewayProvider>('pagarme');
  const [gatewayData, setGatewayData] = useState<Record<GatewayProvider, GatewayConfig>>({
    pagarme: { provider: 'pagarme', credentials: {}, enabled: false },
    pagseguro: { provider: 'pagseguro', credentials: {}, enabled: false },
    mercadopago: { provider: 'mercadopago', credentials: {}, enabled: false },
    paypal: { provider: 'paypal', credentials: {}, enabled: false },
    stripe: { provider: 'stripe', credentials: {}, enabled: false }
  });
  
  const [formData, setFormData] = useState<FormData>({
    credentials: {},
    applyToAllSearchEngines: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadGatewayConfigs();
  }, []);

  useEffect(() => {
    // Atualizar formData quando mudar de aba
    const currentConfig = gatewayData[activeTab];
    setFormData({
      credentials: { ...currentConfig.credentials },
      applyToAllSearchEngines: false
    });
    setErrors({});
  }, [activeTab, gatewayData]);

  const loadGatewayConfigs = async () => {
    try {
      setLoading(true);

      // Carregar configurações do gateway
      const { data: configData, error } = await supabase
        .from('gateway_conf')
        .select('key, value');

      if (error) throw error;

      // Organizar dados por provider
      const configs = { ...gatewayData };
      
      (configData || []).forEach(config => {
        const [provider, field] = config.key.split('_');
        if (configs[provider as GatewayProvider]) {
          configs[provider as GatewayProvider].credentials[field] = config.value;
          configs[provider as GatewayProvider].enabled = true;
        }
      });

      setGatewayData(configs);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const config = gatewayConfigs[activeTab];

    config.fields.forEach(field => {
      const value = formData.credentials[field.key];
      if (!value || !value.trim()) {
        newErrors[field.key] = `${field.label} é obrigatório`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value
      }
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Preparar dados para salvar
      const updates = Object.entries(formData.credentials).map(([field, value]) => ({
        key: `${activeTab}_${field}`,
        value: value.trim()
      }));

      // Salvar no Supabase
      for (const update of updates) {
        const { error } = await supabase
          .from('gateway_conf')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      // Atualizar estado local
      setGatewayData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          credentials: { ...formData.credentials },
          enabled: true
        }
      }));

      alert(`Configuração ${gatewayConfigs[activeTab].name} salva com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Falha ao salvar. Verifique as credenciais e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm(`Tem certeza que deseja desabilitar o gateway ${gatewayConfigs[activeTab].name}?`)) {
      return;
    }

    try {
      setSaving(true);

      // Remover configurações do Supabase
      const config = gatewayConfigs[activeTab];
      const keysToDelete = config.fields.map(field => `${activeTab}_${field.key}`);

      for (const key of keysToDelete) {
        const { error } = await supabase
          .from('gateway_conf')
          .delete()
          .eq('key', key);

        if (error) throw error;
      }

      // Atualizar estado local
      setGatewayData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          credentials: {},
          enabled: false
        }
      }));

      setFormData({
        credentials: {},
        applyToAllSearchEngines: false
      });

      alert(`Gateway ${gatewayConfigs[activeTab].name} desabilitado com sucesso!`);
    } catch (error) {
      console.error('Erro ao desabilitar gateway:', error);
      alert('Erro ao desabilitar gateway. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para configurações (seria implementado com router)
    console.log('Cancelar - navegar para configurações');
  };

  const openTutorial = () => {
    console.log('Tutorial de gateway - implementar link real');
  };

  const isFormValid = () => {
    const config = gatewayConfigs[activeTab];
    return config.fields.every(field => {
      const value = formData.credentials[field.key];
      return value && value.trim().length > 0;
    });
  };

  const hasExistingCredentials = () => {
    return gatewayData[activeTab].enabled;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando configurações...</div>
      </div>
    );
  }

  const currentConfig = gatewayConfigs[activeTab];

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Configurações</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Gateway</span>
      </nav>

      {/* Título */}
      <h1 className="text-gray-800 text-base font-semibold mb-6">Configuração de Gateway de Pagamento</h1>

      {/* Abas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {Object.entries(gatewayConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as GatewayProvider)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-teal-700 text-teal-700 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {config.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-teal-700 px-6 py-4">
          <div className="flex items-center text-white">
            <CreditCard className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Dados {currentConfig.name}</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentConfig.fields.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    id={field.key}
                    type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                    value={formData.credentials[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors[field.key] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-describedby={errors[field.key] ? `${field.key}-error` : undefined}
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field.key)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords[field.key] ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
                {errors[field.key] && (
                  <p id={`${field.key}-error`} className="text-red-500 text-sm mt-1" role="alert">
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Botão Desabilitar Gateway */}
          {hasExistingCredentials() && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleDisable}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Desabilitar Gateway
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-4 text-xs text-gray-600">
        Para obter os tokens e chaves,{' '}
        <button
          onClick={openTutorial}
          className="text-teal-600 hover:text-teal-800 underline inline-flex items-center"
        >
          acesse o tutorial clicando aqui
          <ExternalLink className="w-3 h-3 ml-1" />
        </button>
        .
      </div>

      {/* Checkbox Global */}
      <div className="mt-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.applyToAllSearchEngines}
            onChange={(e) => setFormData(prev => ({ ...prev, applyToAllSearchEngines: e.target.checked }))}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Alterar em todos os buscadores</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Se marcado, aplica esta configuração a todos os motores de busca.
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          aria-label="Cancelar configuração"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancelar
        </button>
        
        <button
          onClick={handleSave}
          disabled={!isFormValid() || saving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Salvar configuração do gateway"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}