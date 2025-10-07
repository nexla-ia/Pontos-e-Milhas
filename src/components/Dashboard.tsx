import React, { useState, useEffect } from 'react';
import { LogOut, User, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { signOut } from '../lib/auth';
import Sidebar from './Sidebar';
import ValoresPage from './pages/ValoresPage';
import OpsEmAbertoPage from './pages/OpsEmAbertoPage';
import PagamentoPendentePage from './pages/PagamentoPendentePage';
import EmAtendimentoPage from './pages/EmAtendimentoPage';
import FinalizadosPage from './pages/FinalizadosPage';
import CanceladosPage from './pages/CanceladosPage';
import RelatorioPage from './pages/RelatorioPage';
import CadastroManualPage from './pages/CadastroManualPage';
import ListarUsuariosPage from './pages/ListarUsuariosPage';
import CadastrarUsuarioPage from './pages/CadastrarUsuarioPage';
import ListarAgenciasPage from './pages/ListarAgenciasPage';
import CadastrarAgenciaPage from './pages/CadastrarAgenciaPage';
import ListarPerfisAgenciaPage from './pages/ListarPerfisAgenciaPage';
import CadastrarPerfilAgenciaPage from './pages/CadastrarPerfilAgenciaPage';
import ListarUsuariosClientePage from './pages/ListarUsuariosClientePage';
import CadastrarUsuarioClientePage from './pages/CadastrarUsuarioClientePage';
import ConsultasSistemaPage from './pages/ConsultasSistemaPage';
import CadastrarAtividadePage from './pages/CadastrarAtividadePage';
import CadastrarBancoPage from './pages/CadastrarBancoPage';
import CadastrarCompanhiaPage from './pages/CadastrarCompanhiaPage';
import ConfiguracaoGatewayPage from './pages/ConfiguracaoGatewayPage';
import ConfiguracoesGeraisPage from './pages/ConfiguracoesGeraisPage';
import CadastrarOperadoraPage from './pages/CadastrarOperadoraPage';
import CadastrarTextosPage from './pages/CadastrarTextosPage';
import ListarAtividadesPage from './pages/ListarAtividadesPage';
import ListarBancosPage from './pages/ListarBancosPage';
import ListarCompanhiasPage from './pages/ListarCompanhiasPage';
import ListarOperadorasPage from './pages/ListarOperadorasPage';
import PersonalizacaoPage from './pages/PersonalizacaoPage';
import SlidesPage from './pages/SlidesPage';
import BuscarPassagemPage from './pages/BuscarPassagemPage';
import ResultadosVoosPage from './pages/ResultadosVoosPage';
import type { AuthUser } from '../lib/auth';

interface DashboardProps {
  user: {
    user: any;
    profile: AuthUser;
  };
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeMenuItem, setActiveMenuItem] = useState('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchId, setSearchId] = useState<string>('');

  useEffect(() => {
    // Escutar evento de navegação
    const handleNavigate = (event: CustomEvent) => {
      if (event.detail.page === 'Resultados dos Voos') {
        setSearchId(event.detail.searchId || '');
        setActiveMenuItem('resultados-voos');
      }
    };

    window.addEventListener('navigate', handleNavigate as EventListener);

    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const { profile } = user;
  const agency = profile.agency;

  // Show sidebar for admin and agency users (emissor, proprietario)
  const showSidebar = ['admin', 'emissor', 'proprietario'].includes(profile.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for admin and agency users */}
      {showSidebar && (
        <Sidebar 
          activeItem={activeMenuItem}
          onItemClick={setActiveMenuItem}
          userRole={profile.role}
        />
      )}

      {/* Header */}
      <header className={`bg-white shadow-sm border-b border-gray-200 ${showSidebar ? 'ml-[280px]' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Portal Pontos e Milhas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Olá, <span className="font-medium">{profile.full_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${showSidebar ? 'ml-[280px]' : ''}`}>
        <div className="px-4 py-6 sm:px-0">
          {/* Renderizar conteúdo baseado no item ativo */}
          {activeMenuItem === 'preco-cias' ? (
            <ValoresPage />
          ) : activeMenuItem === 'em-aberto' ? (
            <OpsEmAbertoPage />
          ) : activeMenuItem === 'pagamento-pendente' ? (
            <PagamentoPendentePage />
          ) : activeMenuItem === 'em-atendimento' ? (
            <EmAtendimentoPage />
          ) : activeMenuItem === 'finalizados' ? (
            <FinalizadosPage />
          ) : activeMenuItem === 'cancelados' ? (
            <CanceladosPage />
          ) : activeMenuItem === 'relatorio' ? (
            <RelatorioPage />
          ) : activeMenuItem === 'cadastro-manual' ? (
            <CadastroManualPage />
          ) : activeMenuItem === 'listar-usuarios' ? (
            <ListarUsuariosPage />
          ) : activeMenuItem === 'cadastrar-usuario' ? (
            <CadastrarUsuarioPage />
          ) : activeMenuItem === 'listar-agencias' ? (
            <ListarAgenciasPage />
          ) : activeMenuItem === 'cadastro-agencia' ? (
            <CadastrarAgenciaPage />
          ) : activeMenuItem === 'listar-perfil-agencia' ? (
            <ListarPerfisAgenciaPage />
          ) : activeMenuItem === 'cadastrar-perfil-agencia' ? (
            <CadastrarPerfilAgenciaPage />
          ) : activeMenuItem === 'listar-usuarios-cliente' ? (
            <ListarUsuariosClientePage onItemClick={setActiveMenuItem} />
          ) : activeMenuItem === 'cadastrar-usuario-cliente' ? (
            <CadastrarUsuarioClientePage />
          ) : activeMenuItem === 'consultas' ? (
            <ConsultasSistemaPage />
          ) : activeMenuItem === 'cadastrar-atividade' ? (
            <CadastrarAtividadePage />
          ) : activeMenuItem === 'cadastrar-banco' ? (
            <CadastrarBancoPage />
          ) : activeMenuItem === 'cadastrar-companhia' ? (
            <CadastrarCompanhiaPage />
          ) : activeMenuItem === 'config-gateway' ? (
            <ConfiguracaoGatewayPage />
          ) : activeMenuItem === 'config-gerais' ? (
            <ConfiguracoesGeraisPage />
          ) : activeMenuItem === 'cadastrar-operadora' ? (
            <CadastrarOperadoraPage />
          ) : activeMenuItem === 'cadastrar-textos' ? (
            <CadastrarTextosPage />
          ) : activeMenuItem === 'listar-atividades' ? (
            <ListarAtividadesPage />
          ) : activeMenuItem === 'listar-bancos' ? (
            <ListarBancosPage />
          ) : activeMenuItem === 'listar-companhias' ? (
            <ListarCompanhiasPage />
          ) : activeMenuItem === 'listar-operadoras' ? (
            <ListarOperadorasPage />
          ) : activeMenuItem === 'personalizacao' ? (
            <PersonalizacaoPage />
          ) : activeMenuItem === 'slides' ? (
            <SlidesPage />
          ) : activeMenuItem === 'buscar-passagem' ? (
            <BuscarPassagemPage />
          ) : activeMenuItem === 'resultados-voos' ? (
            <ResultadosVoosPage />
          ) : activeMenuItem === 'inicio' ? (
            <>
              {/* Welcome Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Bem-vindo ao Portal!
                  </h2>
                  <p className="text-gray-600">
                    Você está logado como <strong>{profile.role}</strong> da agência{' '}
                    <strong>{agency?.corporate_name}</strong>.
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center mb-4">
                      <User className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Informações do Usuário
                      </h3>
                    </div>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Nome</dt>
                        <dd className="text-sm text-gray-900">{profile.full_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{user.user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Função</dt>
                        <dd className="text-sm text-gray-900 capitalize">{profile.role}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Agency Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center mb-4">
                      <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Informações da Agência
                      </h3>
                    </div>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Razão Social</dt>
                        <dd className="text-sm text-gray-900">{agency?.corporate_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Nome Fantasia</dt>
                        <dd className="text-sm text-gray-900">{agency?.trade_name || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">CNPJ</dt>
                        <dd className="text-sm text-gray-900">{agency?.cnpj}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Ações Rápidas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="text-sm font-medium text-gray-900">Consultar Milhas</div>
                      <div className="text-xs text-gray-500 mt-1">Verificar disponibilidade</div>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="text-sm font-medium text-gray-900">Emitir Passagem</div>
                      <div className="text-xs text-gray-500 mt-1">Nova emissão</div>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="text-sm font-medium text-gray-900">Histórico</div>
                      <div className="text-xs text-gray-500 mt-1">Ver transações</div>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="text-sm font-medium text-gray-900">Relatórios</div>
                      <div className="text-xs text-gray-500 mt-1">Gerar relatórios</div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Placeholder para outros itens do menu */
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {activeMenuItem.charAt(0).toUpperCase() + activeMenuItem.slice(1).replace('-', ' ')}
                </h2>
                <p className="text-gray-600">
                  Esta página está em desenvolvimento.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}