import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Eye, Link, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PersonalizationSettings {
  visualizarMilhas: boolean;
  linkCompanhia: boolean;
  orcamentoPersonalizado: boolean;
}

type TabType = 'visualizar-milhas' | 'link-companhia' | 'orcamento-personalizado';

export default function PersonalizacaoPage() {
  const [activeTab, setActiveTab] = useState<TabType>('visualizar-milhas');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<PersonalizationSettings>({
    visualizarMilhas: false,
    linkCompanhia: false,
    orcamentoPersonalizado: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const { data: settingsData, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['visualizar_milhas', 'link_companhia', 'orcamento_personalizado']);

      if (error) throw error;

      const settingsMap = (settingsData || []).reduce((acc: any, setting) => {
        acc[setting.key] = setting.value === 'true';
        return acc;
      }, {});

      setSettings({
        visualizarMilhas: settingsMap.visualizar_milhas || false,
        linkCompanhia: settingsMap.link_companhia || false,
        orcamentoPersonalizado: settingsMap.orcamento_personalizado || false
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting: keyof PersonalizationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const currentSetting = getCurrentSetting();
      const settingKey = getSettingKey(activeTab);

      // Salvar configuração específica da aba ativa
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: settingKey,
          value: currentSetting.toString()
        }, { onConflict: 'key' });

      if (error) throw error;

      alert('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para configurações (seria implementado com router)
    console.log('Cancelar - navegar para configurações');
  };

  const getCurrentSetting = (): boolean => {
    switch (activeTab) {
      case 'visualizar-milhas':
        return settings.visualizarMilhas;
      case 'link-companhia':
        return settings.linkCompanhia;
      case 'orcamento-personalizado':
        return settings.orcamentoPersonalizado;
      default:
        return false;
    }
  };

  const getSettingKey = (tab: TabType): string => {
    switch (tab) {
      case 'visualizar-milhas':
        return 'visualizar_milhas';
      case 'link-companhia':
        return 'link_companhia';
      case 'orcamento-personalizado':
        return 'orcamento_personalizado';
      default:
        return '';
    }
  };

  const tabs = [
    { 
      id: 'visualizar-milhas', 
      label: 'Visualizar Milhas', 
      icon: Eye,
      title: 'Visualizar Milhas',
      description: 'Ao selecionar essa opção, o sistema irá mostrar para todos os usuários a quantidade de milhas por passageiro, dentro do box de valores na tela de retorno das buscas.'
    },
    { 
      id: 'link-companhia', 
      label: 'Link Companhia', 
      icon: Link,
      title: 'Exibir Link',
      description: 'Ao selecionar essa opção, o sistema irá liberar para todos os usuários um botão na tela de retorno das buscas que redireciona para o site da companhia com os dados iguais aos da busca realizada.'
    },
    { 
      id: 'orcamento-personalizado', 
      label: 'Orçamento personalizado', 
      icon: FileText,
      title: 'Ativar Personalização',
      description: 'Ao selecionar essa opção, o sistema irá gerar um orçamento personalizado para o cliente.'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando configurações...</div>
      </div>
    );
  }

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Personalização</span>
      </nav>

      {/* Abas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-teal-700 text-teal-700'
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
      </div>

      {/* Conteúdo da Aba */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          {/* Checkbox */}
          <div className="flex-shrink-0 pt-1">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={getCurrentSetting()}
                onChange={(e) => handleSettingChange(
                  activeTab === 'visualizar-milhas' ? 'visualizarMilhas' :
                  activeTab === 'link-companhia' ? 'linkCompanhia' : 'orcamentoPersonalizado',
                  e.target.checked
                )}
                className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-lg font-medium text-gray-900">
                {currentTab?.title}
              </span>
            </label>
          </div>

          {/* Texto explicativo */}
          <div className="flex-1">
            <p className="text-gray-600 text-base leading-relaxed">
              {currentTab?.description}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}