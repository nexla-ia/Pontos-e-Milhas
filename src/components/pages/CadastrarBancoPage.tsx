import React, { useState } from 'react';
import { Save, ArrowLeft, Building } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FormData {
  code: string;
  name: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CadastrarBancoPage() {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Número é obrigatório';
    } else if (formData.code.length !== 3) {
      newErrors.code = 'Número deve ter exatamente 3 dígitos';
    } else if (!/^\d{3}$/.test(formData.code)) {
      newErrors.code = 'Número deve conter apenas dígitos';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;

    // Para o código, permitir apenas números e limitar a 3 dígitos
    if (field === 'code') {
      processedValue = value.replace(/\D/g, '').slice(0, 3);
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

      const { error } = await supabase
        .from('banks')
        .insert([{
          code: formData.code,
          name: formData.name.trim()
        }]);

      if (error) throw error;

      alert('Banco cadastrado com sucesso!');
      
      // Reset form
      setFormData({
        code: '',
        name: ''
      });

      // Navegar para lista (seria implementado com router)
      // navigate('/configuracoes/listar-bancos');

    } catch (error: any) {
      console.error('Erro ao cadastrar banco:', error);
      
      if (error.message?.includes('duplicate key')) {
        if (error.message.includes('code')) {
          setErrors({ code: 'Já existe um banco com este número' });
        } else {
          setErrors({ name: 'Já existe um banco com este nome' });
        }
      } else {
        alert('Falha ao cadastrar banco. Confira os dados.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para lista (seria implementado com router)
    // navigate('/configuracoes/listar-bancos');
    console.log('Cancelar - navegar para lista de bancos');
  };

  const isFormValid = () => {
    return formData.code.length === 3 && 
           /^\d{3}$/.test(formData.code) && 
           formData.name.trim().length > 0 && 
           formData.name.length <= 50;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Banco</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastrar</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastro de Banco</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Dados do Banco */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <Building className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">DADOS DO BANCO</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Número */}
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                Número *
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="000"
                maxLength={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-required="true"
                aria-describedby={errors.code ? 'code-error' : 'code-help'}
              />
              {errors.code && (
                <p id="code-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.code}
                </p>
              )}
              <p id="code-help" className="text-gray-500 text-xs mt-1">
                Código de 3 dígitos do banco
              </p>
            </div>

            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nome *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do banco"
                maxLength={50}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-required="true"
                aria-describedby={errors.name ? 'name-error' : 'name-help'}
              />
              {errors.name && (
                <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.name}
                </p>
              )}
              <p id="name-help" className="text-gray-500 text-xs mt-1">
                {formData.name.length}/50 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Ações do Formulário */}
        <div className="flex justify-end space-x-2 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            aria-label="Cancelar cadastro"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={!isFormValid() || saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cadastrar banco"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}