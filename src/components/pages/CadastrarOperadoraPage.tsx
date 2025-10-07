import React, { useState } from 'react';
import { Save, ArrowLeft, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FormData {
  name: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CadastrarOperadoraPage() {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        .from('operators')
        .insert([{
          name: formData.name.trim()
        }]);

      if (error) throw error;

      alert('Operadora cadastrada com sucesso!');
      
      // Reset form
      setFormData({
        name: ''
      });

      // Navegar para lista (seria implementado com router)
      // navigate('/configuracoes/listar-operadoras');

    } catch (error: any) {
      console.error('Erro ao cadastrar operadora:', error);
      
      if (error.message?.includes('duplicate key')) {
        setErrors({ name: 'Já existe uma operadora com este nome' });
      } else {
        alert('Falha ao cadastrar operadora. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para lista (seria implementado com router)
    // navigate('/configuracoes/listar-operadoras');
    console.log('Cancelar - navegar para lista de operadoras');
  };

  const isFormValid = () => {
    return formData.name.trim().length > 0 && formData.name.length <= 100;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Operadora</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastrar</span>
      </nav>

      {/* Título */}
      <h1 className="text-lg font-semibold text-gray-800 mb-6">Cadastro de Operadora</h1>

      {/* Card de Formulário */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Cabeçalho do Card */}
          <div className="bg-teal-700 px-6 py-4">
            <div className="flex items-center text-white">
              <Phone className="w-5 h-5 mr-2" />
              <h2 className="text-base font-semibold">Dados da Operadora</h2>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome"
                maxLength={100}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-required="true"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.name}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.name.length}/100 caracteres
              </p>
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
                aria-label="Cadastrar operadora"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}