import React, { useState } from 'react';
import { Save, X, Building2, CreditCard, Eye, DollarSign, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FormData {
  name: string;
  description: string;
  chargeMethods: string[];
  markupAllowed: string[];
  issueMethods: {
    miles: boolean;
    paid: boolean;
  };
  visibility: {
    miles: boolean;
    paid: boolean;
  };
}

interface FormErrors {
  [key: string]: string;
}

const chargeMethodOptions = [
  { id: 'pix_transfer', label: 'Pagamento via Transferência/Pix' },
  { id: 'pix_pagarme', label: 'Pagamento Pix Pagarme' },
  { id: 'card', label: 'Pagamento via Cartão' },
  { id: 'boleto', label: 'Pagamento via Boleto' },
  { id: 'boleto_installment', label: 'Pagamento via Boleto Parcelado' },
  { id: 'invoice', label: 'Pagamento Faturado' },
  { id: 'invoice_7days', label: 'Pagamento Faturado Acima 7 dias' },
  { id: 'cash', label: 'Pagamento em Espécie' }
];

export default function CadastrarPerfilAgenciaPage() {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    chargeMethods: [],
    markupAllowed: [],
    issueMethods: {
      miles: false,
      paid: false
    },
    visibility: {
      miles: false,
      paid: false
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | string[] | boolean) => {
    if (field === 'issueMethods' || field === 'visibility') {
      // Handle nested objects
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleChargeMethodToggle = (methodId: string) => {
    const currentMethods = formData.chargeMethods;
    const newMethods = currentMethods.includes(methodId)
      ? currentMethods.filter(id => id !== methodId)
      : [...currentMethods, methodId];
    
    setFormData(prev => ({
      ...prev,
      chargeMethods: newMethods
    }));
  };

  const handleMarkupToggle = (methodId: string) => {
    const currentMethods = formData.markupAllowed;
    const newMethods = currentMethods.includes(methodId)
      ? currentMethods.filter(id => id !== methodId)
      : [...currentMethods, methodId];
    
    setFormData(prev => ({
      ...prev,
      markupAllowed: newMethods
    }));
  };

  const handleIssueMethodToggle = (method: 'miles' | 'paid') => {
    setFormData(prev => ({
      ...prev,
      issueMethods: {
        ...prev.issueMethods,
        [method]: !prev.issueMethods[method]
      }
    }));
  };

  const handleVisibilityToggle = (method: 'miles' | 'paid') => {
    setFormData(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [method]: !prev.visibility[method]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('agency_profiles')
        .insert([{
        name: formData.name,
        description: formData.description,
        charge_methods: formData.chargeMethods,
        markup_allowed: formData.markupAllowed,
        issue_methods: formData.issueMethods,
        visibility: formData.visibility
        }]);

      if (error) throw error;
      
      alert('Perfil de agência cadastrado com sucesso!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        chargeMethods: [],
        markupAllowed: [],
        issueMethods: {
          miles: false,
          paid: false
        },
        visibility: {
          miles: false,
          paid: false
        }
      });

      // Navegar de volta para lista (seria implementado com router)
      // navigate('/perfil-agencia/listar');

    } catch (error: any) {
      console.error('Erro ao cadastrar perfil:', error);
      alert(`Erro ao cadastrar perfil: ${error.message || 'Tente novamente.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para lista (seria implementado com router)
    // navigate('/perfil-agencia/listar');
    console.log('Cancelar - navegar para lista de perfis');
  };

  const isFormValid = () => {
    return formData.name.trim().length > 0;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Perfil Agência</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastrar</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastrar Perfil Agência</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Dados Básicos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <Building2 className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">DADOS BÁSICOS</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome do perfil"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrição do perfil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Formas de Cobrança */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <CreditCard className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">FORMAS DE COBRANÇA</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chargeMethodOptions.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.chargeMethods.includes(option.id)}
                    onChange={() => handleChargeMethodToggle(option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Seção Autorizar Markup Extra */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <DollarSign className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">AUTORIZAR MARKUP EXTRA (DU)</h2>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Marque as modalidades que admitem markup adicional:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chargeMethodOptions.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.markupAllowed.includes(option.id)}
                    onChange={() => handleMarkupToggle(option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Seção Formas de Emissão e Visibilidade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formas de Emissão */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#00416A] px-6 py-4">
              <div className="flex items-center text-white">
                <Building2 className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">FORMAS DE EMISSÃO</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.issueMethods.miles}
                    onChange={() => handleIssueMethodToggle('miles')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Emitir Milhas</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.issueMethods.paid}
                    onChange={() => handleIssueMethodToggle('paid')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Emitir Pagante</span>
                </label>
              </div>
            </div>
          </div>

          {/* Visibilidade */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#00416A] px-6 py-4">
              <div className="flex items-center text-white">
                <Eye className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">VISIBILIDADE</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.visibility.miles}
                    onChange={() => handleVisibilityToggle('miles')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Exibir Milhas</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.visibility.paid}
                    onChange={() => handleVisibilityToggle('paid')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Exibir Pagante</span>
                </label>
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
    </div>
  );
}