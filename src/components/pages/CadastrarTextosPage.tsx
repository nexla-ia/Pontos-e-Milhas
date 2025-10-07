import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, FileText, Upload, X, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TextSection {
  key: string;
  title: string;
  placeholder: string;
  content: string;
}

interface FormData {
  sections: TextSection[];
  qrCodeImage: File | null;
  qrCodePreview: string | null;
  qrCodeAltText: string;
  emailSettings: {
    enviarTermo: boolean;
    enviarPoliticaTroca: boolean;
  };
  alterarTodosBuscadores: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const textSections: Omit<TextSection, 'content'>[] = [
  {
    key: 'termos_uso',
    title: 'Termo de Aquiescência',
    placeholder: 'Insira aqui os Termos de Uso'
  },
  {
    key: 'politica_privacidade',
    title: 'Texto de Política e Privacidade',
    placeholder: 'Insira aqui a Política de Privacidade'
  },
  {
    key: 'termos_pix',
    title: 'Termos Pagamento por Transferência Bancária/Pix',
    placeholder: 'Instruções para pagamento via Pix/Transferência'
  },
  {
    key: 'pagamentos_faturados',
    title: 'Para pagamentos faturados o valor tem alteração',
    placeholder: 'Descreva regras de faturamento e prazos'
  },
  {
    key: 'texto_pagamento',
    title: 'Cadastrar Texto (página de pagamento)',
    placeholder: 'Instruções exibidas na página de pagamento'
  },
  {
    key: 'politica_troca',
    title: 'Cadastrar Texto (página de confirmação / política de troca e cancelamento)',
    placeholder: 'Regras de multas, reembolsos e no-show por companhia'
  }
];

export default function CadastrarTextosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    sections: textSections.map(section => ({ ...section, content: '' })),
    qrCodeImage: null,
    qrCodePreview: null,
    qrCodeAltText: '',
    emailSettings: {
      enviarTermo: false,
      enviarPoliticaTroca: false
    },
    alterarTodosBuscadores: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      setLoading(true);

      // Carregar textos existentes
      const { data: textsData, error } = await supabase
        .from('texts')
        .select('key, content');

      if (error) throw error;

      // Organizar dados por chave
      const existingTexts = (textsData || []).reduce((acc: any, text) => {
        acc[text.key] = text.content;
        return acc;
      }, {});

      // Atualizar seções com conteúdo existente
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          content: existingTexts[section.key] || ''
        }))
      }));

    } catch (error) {
      console.error('Erro ao carregar textos:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar se pelo menos um texto foi preenchido
    const hasContent = formData.sections.some(section => section.content.trim().length > 0);
    if (!hasContent) {
      newErrors.general = 'Pelo menos uma seção de texto deve ser preenchida';
    }

    // Validar arquivo de imagem se fornecido
    if (formData.qrCodeImage) {
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(formData.qrCodeImage.type)) {
        newErrors.qrCode = 'Apenas arquivos JPG e PNG são aceitos';
      } else if (formData.qrCodeImage.size > maxSize) {
        newErrors.qrCode = 'Arquivo deve ter no máximo 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionChange = (sectionKey: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.key === sectionKey ? { ...section, content } : section
      )
    }));

    // Limpar erro geral se algum conteúdo foi adicionado
    if (content.trim() && errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, qrCode: 'Apenas arquivos JPG e PNG são aceitos' }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, qrCode: 'Arquivo deve ter no máximo 5MB' }));
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        qrCodeImage: file,
        qrCodePreview: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);

    // Limpar erro
    if (errors.qrCode) {
      setErrors(prev => ({ ...prev, qrCode: '' }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      qrCodeImage: null,
      qrCodePreview: null,
      qrCodeAltText: ''
    }));
  };

  const handleEmailSettingChange = (setting: keyof typeof formData.emailSettings, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings,
        [setting]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Salvar textos no Supabase
      for (const section of formData.sections) {
        if (section.content.trim()) {
          const { error } = await supabase
            .from('texts')
            .upsert({
              key: section.key,
              content: section.content.trim()
            }, { onConflict: 'key' });

          if (error) throw error;
        }
      }

      // TODO: Implementar upload de imagem quando necessário
      if (formData.qrCodeImage) {
        console.log('Upload de QR Code:', formData.qrCodeImage.name);
      }

      // TODO: Salvar configurações de e-mail
      console.log('Configurações de e-mail:', formData.emailSettings);

      alert('Textos e políticas salvos com sucesso!');
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(section => ({ ...section, content: '' })),
        qrCodeImage: null,
        qrCodePreview: null,
        qrCodeAltText: '',
        emailSettings: {
          enviarTermo: false,
          enviarPoliticaTroca: false
        },
        alterarTodosBuscadores: false
      }));

      // Navegar para lista (seria implementado com router)
      // navigate('/configuracoes/textos');

    } catch (error: any) {
      console.error('Erro ao salvar textos:', error);
      alert('Erro ao salvar textos e políticas. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para configurações (seria implementado com router)
    console.log('Cancelar - navegar para configurações');
  };

  const isFormValid = () => {
    return formData.sections.some(section => section.content.trim().length > 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando textos...</div>
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
        <span className="text-gray-900 font-medium">Textos e Políticas</span>
      </nav>

      {/* Título */}
      <h1 className="text-lg font-semibold text-gray-800 mb-6">Termos, Políticas e Textos de Pagamento</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Container principal */}
        <div className="bg-white rounded-md shadow p-6 space-y-6">
          
          {/* Error geral */}
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Seções de Texto */}
          {formData.sections.map((section) => (
            <div key={section.key} className="space-y-0">
              {/* Header */}
              <div className="bg-teal-800 text-white px-4 py-2 rounded-t">
                <h3 className="font-semibold">{section.title}</h3>
              </div>
              
              {/* Body */}
              <div className="p-4 border border-t-0 rounded-b">
                <textarea
                  value={section.content}
                  onChange={(e) => handleSectionChange(section.key, e.target.value)}
                  placeholder={section.placeholder}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical"
                  style={{ minHeight: '300px' }}
                />
                <p className="text-gray-500 text-xs mt-2">
                  {section.content.length} caracteres
                </p>
              </div>
            </div>
          ))}

          {/* Seção QR Code */}
          <div className="space-y-0">
            <div className="bg-teal-800 text-white px-4 py-2 rounded-t">
              <h3 className="font-semibold">QR Code para Pix</h3>
            </div>
            
            <div className="p-4 border border-t-0 rounded-b">
              <div className="space-y-4">
                <div>
                  <label htmlFor="qrCodeUpload" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload de Imagem do QR Code
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      id="qrCodeUpload"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                  </div>
                  {errors.qrCode && <p className="text-red-500 text-sm mt-1">{errors.qrCode}</p>}
                  <p className="text-gray-500 text-xs mt-1">
                    Aceita JPG e PNG, máximo 5MB
                  </p>
                </div>

                {/* Preview da imagem */}
                {formData.qrCodePreview && (
                  <div className="relative inline-block">
                    <img
                      src={formData.qrCodePreview}
                      alt="Preview QR Code"
                      className="w-32 h-32 object-cover border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Alt text */}
                {formData.qrCodePreview && (
                  <div>
                    <label htmlFor="qrCodeAltText" className="block text-sm font-medium text-gray-700 mb-2">
                      Texto alternativo (opcional)
                    </label>
                    <input
                      id="qrCodeAltText"
                      type="text"
                      value={formData.qrCodeAltText}
                      onChange={(e) => setFormData(prev => ({ ...prev, qrCodeAltText: e.target.value }))}
                      placeholder="Descrição da imagem para acessibilidade"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                )}

                <p className="text-gray-600 text-sm">
                  💡 Caso não tenha QR code, deixe em branco e use chave CNPJ abaixo.
                </p>
              </div>
            </div>
          </div>

          {/* Seção Configuração de E-mail */}
          <div className="space-y-0">
            <div className="bg-teal-800 text-white px-4 py-2 rounded-t">
              <h3 className="font-semibold">Configuração de texto enviados por e-mail</h3>
            </div>
            
            <div className="p-4 border border-t-0 rounded-b">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.emailSettings.enviarTermo}
                    onChange={(e) => handleEmailSettingChange('enviarTermo', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enviar termo</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.emailSettings.enviarPoliticaTroca}
                    onChange={(e) => handleEmailSettingChange('enviarPoliticaTroca', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enviar política de troca</span>
                </label>
              </div>
            </div>
          </div>

          {/* Checkbox global */}
          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.alterarTodosBuscadores}
                onChange={(e) => setFormData(prev => ({ ...prev, alterarTodosBuscadores: e.target.checked }))}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Alterar em todos os buscadores</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Se marcado, aplica estas configurações a todos os motores de busca.
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            aria-label="Cancelar cadastro"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={!isFormValid() || saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cadastrar textos e políticas"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}