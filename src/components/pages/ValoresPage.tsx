import React, { useState, useEffect } from 'react';
import { Search, Edit, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompanyRate {
  id: string;
  company_code: string;
  company_name: string;
  avg_rate: number;
  median_rate: number;
  updated_at: string;
}

interface EditModalProps {
  isOpen: boolean;
  company: CompanyRate | null;
  onClose: () => void;
  onSave: (companyCode: string, avgRate: number, medianRate: number) => void;
}

function EditModal({ isOpen, company, onClose, onSave }: EditModalProps) {
  const [avgRate, setAvgRate] = useState('');
  const [medianRate, setMedianRate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setAvgRate(company.avg_rate.toString());
      setMedianRate(company.median_rate.toString());
    }
  }, [company]);

  const handleSave = async () => {
    if (!company) return;

    const avgValue = parseFloat(avgRate);
    const medianValue = parseFloat(medianRate);

    if (isNaN(avgValue) || isNaN(medianValue)) {
      alert('Por favor, insira valores numéricos válidos');
      return;
    }

    // Validar até 6 casas decimais
    if (avgRate.includes('.') && avgRate.split('.')[1]?.length > 6) {
      alert('Média deve ter no máximo 6 casas decimais');
      return;
    }

    if (medianRate.includes('.') && medianRate.split('.')[1]?.length > 6) {
      alert('Mediana deve ter no máximo 6 casas decimais');
      return;
    }

    setLoading(true);
    try {
      await onSave(company.company_code, avgValue, medianValue);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar os dados');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Valores - {company.company_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Média *
            </label>
            <input
              type="number"
              step="0.000001"
              value={avgRate}
              onChange={(e) => setAvgRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.000000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mediana *
            </label>
            <input
              type="number"
              step="0.000001"
              value={medianRate}
              onChange={(e) => setMedianRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.000000"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ValoresPage() {
  const [companies, setCompanies] = useState<CompanyRate[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyRate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<CompanyRate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    const filtered = companies.filter(company =>
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
    setCurrentPage(1);
  }, [companies, searchTerm]);

  const loadCompanies = async () => {
    try {
      setLoading(true);

      // Buscar companhias
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('code, name')
        .order('name');

      if (companiesError) throw companiesError;

      // Buscar taxas existentes
      const { data: ratesData, error: ratesError } = await supabase
        .from('company_mile_rates')
        .select('*');

      if (ratesError) throw ratesError;

      // Combinar dados das companhias com suas taxas
      const companiesWithRates: CompanyRate[] = (companiesData || []).map(company => {
        const existingRate = ratesData?.find(rate => rate.company_code === company.code);
        
        return {
          id: existingRate?.id || `temp-${company.code}`,
          company_code: company.code,
          company_name: company.name,
          avg_rate: existingRate?.avg_rate || 0,
          median_rate: existingRate?.median_rate || 0,
          updated_at: existingRate?.updated_at || ''
        };
      });

      setCompanies(companiesWithRates);
    } catch (error) {
      console.error('Erro ao carregar companhias:', error);
      alert('Erro ao carregar dados das companhias');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: CompanyRate) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleSave = async (companyCode: string, avgRate: number, medianRate: number) => {
    try {
      const { error } = await supabase
        .from('company_mile_rates')
        .upsert({
          company_code: companyCode,
          company_name: companies.find(c => c.company_code === companyCode)?.company_name || '',
          avg_rate: avgRate,
          median_rate: medianRate,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'company_code'
        });

      if (error) throw error;

      await loadCompanies();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  // Paginação
  const totalItems = filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCompanies.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Listagem de Preço das Cias
        </h1>
        
        {/* Campo de busca */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search filter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Companhia
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Média
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mediana
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((company, index) => (
              <tr key={company.company_code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {company.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {company.avg_rate.toFixed(6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {company.median_rate.toFixed(6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleEdit(company)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar/Cadastrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> até{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
                  <span className="font-medium">{totalItems}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total de itens */}
      <div className="mt-4 text-sm text-gray-600">
        Total de companhias: {totalItems}
      </div>

      {/* Modal de edição */}
      <EditModal
        isOpen={isModalOpen}
        company={editingCompany}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}