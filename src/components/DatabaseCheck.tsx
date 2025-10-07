import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, CheckCircle, XCircle, Loader } from 'lucide-react';

interface Agency {
  id: string;
  corporate_name: string;
  trade_name: string;
  cnpj: string;
  email_primary: string;
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  role: string;
  agency_id: string;
  created_at: string;
}

export default function DatabaseCheck() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar agências
      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select('id, corporate_name, trade_name, cnpj, email_primary, created_at')
        .order('created_at', { ascending: false });

      if (agenciesError) throw agenciesError;

      // Verificar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role, agency_id, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setAgencies(agenciesData || []);
      setUsers(usersData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Verificando banco de dados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center text-red-600 mb-4">
          <XCircle className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-semibold">Erro ao conectar com o banco</h3>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={checkDatabase}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center text-green-600 mb-6">
        <Database className="w-6 h-6 mr-2" />
        <h3 className="text-lg font-semibold">Status do Banco de Dados</h3>
      </div>

      {/* Agências */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          {agencies.length > 0 ? (
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
          )}
          <h4 className="font-medium text-gray-900">
            Agências ({agencies.length})
          </h4>
        </div>
        
        {agencies.length > 0 ? (
          <div className="space-y-3">
            {agencies.map((agency) => (
              <div key={agency.id} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Razão Social:</span>
                    <span className="ml-2 text-gray-900">{agency.corporate_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Nome Fantasia:</span>
                    <span className="ml-2 text-gray-900">{agency.trade_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">CNPJ:</span>
                    <span className="ml-2 text-gray-900">{agency.cnpj}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{agency.email_primary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhuma agência encontrada</p>
        )}
      </div>

      {/* Usuários */}
      <div>
        <div className="flex items-center mb-3">
          {users.length > 0 ? (
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
          )}
          <h4 className="font-medium text-gray-900">
            Usuários ({users.length})
          </h4>
        </div>
        
        {users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nome:</span>
                    <span className="ml-2 text-gray-900">{user.full_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Função:</span>
                    <span className="ml-2 text-gray-900 capitalize">{user.role}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">ID da Agência:</span>
                    <span className="ml-2 text-gray-900 font-mono text-xs">{user.agency_id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhum usuário encontrado</p>
        )}
      </div>

      <button
        onClick={checkDatabase}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Atualizar dados
      </button>
    </div>
  );
}