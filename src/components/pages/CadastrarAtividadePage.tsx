import React, { useState } from 'react';
import { Save, ArrowLeft, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CadastrarAtividadePage() {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.description.length > 250) {
      newErrors.description = 'Descrição deve ter no máximo 250 caracteres';
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
        .from('activities')
        .insert([{
          name: formData.name.trim(),
          description: formData.description.trim() || null
        }]);

      if (error) throw error;

      alert('Atividade criada com sucesso!');
      
      // Reset form
      setFormData({
        name: '',
        description: ''
      });

      // Navegar para lista (seria implementado com router)
      // navigate('/configuracoes/listar-atividades');

    } catch (error: any) {
      console.error('Erro ao cadastrar atividade:', error);
      
      if (error.message?.includes('duplicate key')) {
        setErrors({ name: 'Já existe uma atividade com este nome' });
      } else {
        alert('Erro ao criar atividade. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para lista (seria implementado com router)
    // navigate('/configuracoes/listar-atividades');
    console.log('Cancelar - navegar para lista de atividades');
  };

  const isFormValid = () => {
    return formData.name.trim().length > 0 && formData.name.length <= 100 && formData.description.length <= 250;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Atividade</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastrar</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastro de Atividade</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Dados da Atividade */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#00416A] px-6 py-4">
            <div className="flex items-center text-white">
              <Activity className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">DADOS DA ATIVIDADE</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
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
                placeholder="Nome da atividade"
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição da atividade (opcional)"
                maxLength={250}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && (
                <p id="description-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.description}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.description.length}/250 caracteres
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
            aria-label="Cadastrar atividade"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}