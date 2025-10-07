import React, { useState } from 'react';
import { Save, ArrowLeft, Plane, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MilesRate {
  id: string;
  min: number;
  max: number | null;
  price: number;
}

interface FormData {
  name: string;
  serviceFee: number;
  coloFee: number;
  refundFine: number;
  refundFineIntl: number;
  hoursToEmission: number;
  hoursExhaustedMessage: string;
  cancellationFine: number;
  cancellationFineIntl: number;
  boardingFeeNational: number;
  boardingFeeInternational: number;
  nationality: string;
  currency: string;
  currencyRate: number;
  autoUpdateRate: boolean;
  conversionRate: string;
  disableSearch: boolean;
  excludeFromReport: boolean;
  companyAgreement: boolean;
  mandatoryAttachment: boolean;
  milesRates: MilesRate[];
}

interface FormErrors {
  [key: string]: string;
}

const nationalities = [
  { code: 'BR', name: 'Brasil (BR)' },
  { code: 'US', name: 'Estados Unidos (US)' },
  { code: 'AR', name: 'Argentina (AR)' },
  { code: 'CL', name: 'Chile (CL)' },
  { code: 'CO', name: 'Colômbia (CO)' },
  { code: 'PE', name: 'Peru (PE)' },
  { code: 'UY', name: 'Uruguai (UY)' },
  { code: 'PY', name: 'Paraguai (PY)' }
];

const currencies = [
  { code: 'BRL', name: 'Real Brasileiro (BRL)' },
  { code: 'USD', name: 'Dólar Americano (USD)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'ARS', name: 'Peso Argentino (ARS)' },
  { code: 'CLP', name: 'Peso Chileno (CLP)' },
  { code: 'COP', name: 'Peso Colombiano (COP)' },
  { code: 'PEN', name: 'Sol Peruano (PEN)' }
];

export default function CadastrarCompanhiaPage() {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    serviceFee: 0,
    coloFee: 0,
    refundFine: 0,
    refundFineIntl: 0,
    hoursToEmission: 0,
    hoursExhaustedMessage: '',
    cancellationFine: 0,
    cancellationFineIntl: 0,
    boardingFeeNational: 0,
    boardingFeeInternational: 0,
    nationality: '',
    currency: '',
    currencyRate: 0,
    autoUpdateRate: false,
    conversionRate: '',
    disableSearch: false,
    excludeFromReport: false,
    companyAgreement: false,
    mandatoryAttachment: false,
    milesRates: [
      { id: '1', min: 0, max: null, price: 0 }
    ]
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }

    if (!formData.nationality) {
      newErrors.nationality = 'Nacionalidade é obrigatória';
    }

    if (!formData.currency) {
      newErrors.currency = 'Moeda da companhia é obrigatória';
    }

    // Validar faixas de milhas
    const validMilesRates = formData.milesRates.filter(rate => rate.price > 0);
    if (validMilesRates.length === 0) {
      newErrors.milesRates = 'Pelo menos uma faixa de milha com preço deve ser preenchida';
    }

    formData.milesRates.forEach((rate, index) => {
      if (rate.price < 0) {
        newErrors[`milesRate-${index}-price`] = 'Preço deve ser maior que zero';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean | MilesRate[]) => {
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

  const formatCurrency = (value: string): number => {
    const numericValue = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
  };

  const addMilesRate = () => {
    const lastRate = formData.milesRates[formData.milesRates.length - 1];
    const newMin = lastRate.max ? lastRate.max + 1 : 10001;
    
    // Atualizar a faixa anterior para ter um fim definido
    const updatedRates = formData.milesRates.map((rate, index) => {
      if (index === formData.milesRates.length - 1) {
        return { ...rate, max: newMin - 1 };
      }
      return rate;
    });

    const newRate: MilesRate = {
      id: Date.now().toString(),
      min: newMin,
      max: null,
      price: 0
    };

    setFormData(prev => ({
      ...prev,
      milesRates: [...updatedRates, newRate]
    }));
  };

  const removeMilesRate = (rateId: string) => {
    if (formData.milesRates.length > 1) {
      const filteredRates = formData.milesRates.filter(rate => rate.id !== rateId);
      
      // Se removeu a última faixa, a nova última deve ter max = null (INFINITO)
      if (filteredRates.length > 0) {
        filteredRates[filteredRates.length - 1].max = null;
      }

      setFormData(prev => ({
        ...prev,
        milesRates: filteredRates
      }));
    }
  };

  const updateMilesRate = (rateId: string, field: keyof MilesRate, value: number) => {
    setFormData(prev => ({
      ...prev,
      milesRates: prev.milesRates.map(rate => 
        rate.id === rateId ? { ...rate, [field]: value } : rate
      )
    }));

    // Limpar erro específico da faixa
    const rateIndex = formData.milesRates.findIndex(rate => rate.id === rateId);
    if (errors[`milesRate-${rateIndex}-${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`milesRate-${rateIndex}-${field}`]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('companies')
        .insert([{
        name: formData.name.trim(),
        code: formData.name.trim().substring(0, 3).toUpperCase(),
        service_fee: formData.serviceFee,
        colo_fee: formData.coloFee,
        refund_fine: formData.refundFine,
        refund_fine_intl: formData.refundFineIntl,
        hours_to_emission: formData.hoursToEmission || null,
        hours_exhausted_message: formData.hoursExhaustedMessage.trim() || null,
        cancellation_fine: formData.cancellationFine,
        cancellation_fine_intl: formData.cancellationFineIntl,
        boarding_fee_national: formData.boardingFeeNational,
        boarding_fee_international: formData.boardingFeeInternational,
        nationality: formData.nationality,
        currency: formData.currency,
        currency_rate: formData.currencyRate || null,
        auto_update_rate: formData.autoUpdateRate,
        conversion_rate: formData.conversionRate.trim() || null,
        disable_search: formData.disableSearch,
        exclude_from_report: formData.excludeFromReport,
        company_agreement: formData.companyAgreement,
        mandatory_attachment: formData.mandatoryAttachment,
        miles_rates: formData.milesRates.filter(rate => rate.price > 0).map(rate => ({
          min: rate.min,
          max: rate.max,
          price: rate.price
        }))
        }]);

      if (error) throw error;

      alert('Companhia cadastrada com sucesso!');
      
      // Reset form
      setFormData({
        name: '',
        serviceFee: 0,
        coloFee: 0,
        refundFine: 0,
        refundFineIntl: 0,
        hoursToEmission: 0,
        hoursExhaustedMessage: '',
        cancellationFine: 0,
        cancellationFineIntl: 0,
        boardingFeeNational: 0,
        boardingFeeInternational: 0,
        nationality: '',
        currency: '',
        currencyRate: 0,
        autoUpdateRate: false,
        conversionRate: '',
        disableSearch: false,
        excludeFromReport: false,
        companyAgreement: false,
        mandatoryAttachment: false,
        milesRates: [
          { id: '1', min: 0, max: null, price: 0 }
        ]
      });

      // Navegar para lista (seria implementado com router)
      // navigate('/configuracoes/listar-companhias');

    } catch (error: any) {
      console.error('Erro ao cadastrar companhia:', error);
      alert('Não foi possível salvar. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Navegar de volta para lista (seria implementado com router)
    // navigate('/configuracoes/listar-companhias');
    console.log('Cancelar - navegar para lista de companhias');
  };

  const isFormValid = () => {
    const hasValidName = formData.name.trim().length > 0 && formData.name.length <= 50;
    const hasNationality = formData.nationality.length > 0;
    const hasCurrency = formData.currency.length > 0;
    const hasValidMilesRate = formData.milesRates.some(rate => rate.price > 0);
    
    return hasValidName && hasNationality && hasCurrency && hasValidMilesRate;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <span className="mx-2">›</span>
        <span>Companhia</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">Cadastrar</span>
      </nav>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastro de Companhia</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção Dados da Companhia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-teal-700 px-6 py-4">
            <div className="flex items-center text-white">
              <Plane className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Dados da Companhia</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nome */}
              <div className="lg:col-span-3">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome da companhia"
                  maxLength={50}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-required="true"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Taxa Serviço */}
              <div>
                <label htmlFor="serviceFee" className="block text-sm font-semibold text-gray-700 mb-2">
                  Taxa Serviço
                </label>
                <input
                  id="serviceFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.serviceFee}
                  onChange={(e) => handleInputChange('serviceFee', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Taxa Colô */}
              <div>
                <label htmlFor="coloFee" className="block text-sm font-semibold text-gray-700 mb-2">
                  Taxa Colô
                </label>
                <input
                  id="coloFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.coloFee}
                  onChange={(e) => handleInputChange('coloFee', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Multa Reembolso */}
              <div>
                <label htmlFor="refundFine" className="block text-sm font-semibold text-gray-700 mb-2">
                  Multa Reembolso
                </label>
                <input
                  id="refundFine"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.refundFine}
                  onChange={(e) => handleInputChange('refundFine', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Multa Reemb. Internac. */}
              <div>
                <label htmlFor="refundFineIntl" className="block text-sm font-semibold text-gray-700 mb-2">
                  Multa Reemb. Internac.
                </label>
                <input
                  id="refundFineIntl"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.refundFineIntl}
                  onChange={(e) => handleInputChange('refundFineIntl', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Qtd Horas p/ Emissão */}
              <div>
                <label htmlFor="hoursToEmission" className="block text-sm font-semibold text-gray-700 mb-2">
                  Qtd Horas p/ Emissão
                </label>
                <input
                  id="hoursToEmission"
                  type="number"
                  min="0"
                  value={formData.hoursToEmission}
                  onChange={(e) => handleInputChange('hoursToEmission', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Mensagem Horas esgotada p/ Emissão */}
              <div className="lg:col-span-2">
                <label htmlFor="hoursExhaustedMessage" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensagem Horas esgotada p/ Emissão
                </label>
                <input
                  id="hoursExhaustedMessage"
                  type="text"
                  value={formData.hoursExhaustedMessage}
                  onChange={(e) => handleInputChange('hoursExhaustedMessage', e.target.value)}
                  placeholder="Mensagem quando horas esgotadas"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Multa Cancelamento */}
              <div>
                <label htmlFor="cancellationFine" className="block text-sm font-semibold text-gray-700 mb-2">
                  Multa Cancelamento
                </label>
                <input
                  id="cancellationFine"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cancellationFine}
                  onChange={(e) => handleInputChange('cancellationFine', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Multa Cancel. Internac. */}
              <div>
                <label htmlFor="cancellationFineIntl" className="block text-sm font-semibold text-gray-700 mb-2">
                  Multa Cancel. Internac.
                </label>
                <input
                  id="cancellationFineIntl"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cancellationFineIntl}
                  onChange={(e) => handleInputChange('cancellationFineIntl', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Taxa Embarque – Nacional */}
              <div>
                <label htmlFor="boardingFeeNational" className="block text-sm font-semibold text-gray-700 mb-2">
                  Taxa Embarque – Nacional
                </label>
                <input
                  id="boardingFeeNational"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.boardingFeeNational}
                  onChange={(e) => handleInputChange('boardingFeeNational', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Usada quando a companhia não retorna taxa específica
                </p>
              </div>

              {/* Taxa Embarque – Internacional */}
              <div>
                <label htmlFor="boardingFeeInternational" className="block text-sm font-semibold text-gray-700 mb-2">
                  Taxa Embarque – Internacional
                </label>
                <input
                  id="boardingFeeInternational"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.boardingFeeInternational}
                  onChange={(e) => handleInputChange('boardingFeeInternational', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Usada quando a companhia não retorna taxa específica
                </p>
              </div>

              {/* Nacionalidade */}
              <div>
                <label htmlFor="nationality" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nacionalidade *
                </label>
                <select
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.nationality ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-required="true"
                >
                  <option value="">Selecione a nacionalidade</option>
                  {nationalities.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
              </div>

              {/* Moeda da Companhia */}
              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-gray-700 mb-2">
                  Moeda da Companhia *
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.currency ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-required="true"
                >
                  <option value="">Selecione a moeda</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </select>
                {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
              </div>

              {/* Cotação da Moeda */}
              <div>
                <label htmlFor="currencyRate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cotação da Moeda
                </label>
                <input
                  id="currencyRate"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={formData.currencyRate}
                  onChange={(e) => handleInputChange('currencyRate', parseFloat(e.target.value) || 0)}
                  placeholder="0,0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Taxa de conversão */}
              <div className="lg:col-span-2">
                <label htmlFor="conversionRate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Taxa de conversão
                </label>
                <input
                  id="conversionRate"
                  type="text"
                  value={formData.conversionRate}
                  onChange={(e) => handleInputChange('conversionRate', e.target.value)}
                  placeholder="Taxa de conversão"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Checkboxes */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoUpdateRate}
                    onChange={(e) => handleInputChange('autoUpdateRate', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Atualizar cotação automaticamente?</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.disableSearch}
                    onChange={(e) => handleInputChange('disableSearch', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Desativar busca?</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.excludeFromReport}
                    onChange={(e) => handleInputChange('excludeFromReport', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Desconsiderar no relatório?</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.companyAgreement}
                    onChange={(e) => handleInputChange('companyAgreement', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Acordo com a companhia?</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.mandatoryAttachment}
                    onChange={(e) => handleInputChange('mandatoryAttachment', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Anexo obrigatório?</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Cadastro de Milhas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-teal-700 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <h2 className="text-lg font-semibold">Cadastro de Milhas</h2>
              <button
                type="button"
                onClick={addMilesRate}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                aria-label="Adicionar faixa de milhas"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Adicionar Faixa
              </button>
            </div>
          </div>

          <div className="p-6">
            {errors.milesRates && (
              <p className="text-red-500 text-sm mb-4">{errors.milesRates}</p>
            )}
            
            <div className="space-y-4">
              {formData.milesRates.map((rate, index) => (
                <div key={rate.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Faixa {index + 1}</h4>
                    {formData.milesRates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilesRate(rate.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Remover faixa ${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Início Milha */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Início Milha
                      </label>
                      <input
                        type="text"
                        value={rate.min.toLocaleString('pt-BR')}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      />
                    </div>

                    {/* Fim Milha */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fim Milha
                      </label>
                      <input
                        type="text"
                        value={rate.max ? rate.max.toLocaleString('pt-BR') : 'INFINITO'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      />
                    </div>

                    {/* Preço */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Preço *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rate.price}
                        onChange={(e) => updateMilesRate(rate.id, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                          errors[`milesRate-${index}-price`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        aria-required="true"
                      />
                      {errors[`milesRate-${index}-price`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`milesRate-${index}-price`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ações do Formulário */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
            aria-label="Cadastrar companhia"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}