import React, { useState } from 'react';
import { 
  Home, 
  DollarSign, 
  Package, 
  User, 
  Users, 
  Search, 
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Plane
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  userRole: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
}

const adminMenuItems: MenuItem[] = [
  { id: 'inicio', label: 'Início', icon: Home },
  { 
    id: 'valores', 
    label: 'Valores', 
    icon: DollarSign,
    subItems: [
      { id: 'preco-cias', label: 'Preço CIAS' }
    ]
  },
  { 
    id: 'ops-geradas', 
    label: 'OPs Geradas', 
    icon: Package,
    subItems: [
      { id: 'em-aberto', label: 'Em aberto' },
      { id: 'pagamento-pendente', label: 'Pagamento Pendente' },
      { id: 'em-atendimento', label: 'Em atendimento' },
      { id: 'finalizados', label: 'Finalizados' },
      { id: 'cancelados', label: 'Cancelados' },
      { id: 'relatorio', label: 'Relatório' },
      { id: 'cadastro-manual', label: 'Cadastro Manual' }
    ]
  },
  { 
    id: 'usuarios-internos', 
    label: 'Usuários Internos', 
    icon: User,
    subItems: [
      { id: 'listar-usuarios', label: 'Listar' },
      { id: 'cadastrar-usuario', label: 'Cadastrar' }
    ]
  },
  { 
    id: 'clientes', 
    label: 'Clientes', 
    icon: Users,
    subItems: [
      { id: 'listar-agencias', label: 'Listar Agências' },
      { id: 'cadastro-agencia', label: 'Cadastro de Agência' },
      { id: 'listar-perfil-agencia', label: 'Listar perfil de agência' },
      { id: 'cadastrar-perfil-agencia', label: 'Cadastrar Perfil de Agência' },
      { id: 'listar-usuarios-cliente', label: 'Listar cadastros' },
      { id: 'cadastrar-usuario-cliente', label: 'Cadastro manual' }
    ]
  },
  { id: 'consultas', label: 'Consultas do Sistema', icon: Search },
  { 
    id: 'configuracoes', 
    label: 'Configurações', 
    icon: Settings,
    subItems: [
      { id: 'cadastrar-atividade', label: 'Cadastrar Atividade' },
      { id: 'cadastrar-banco', label: 'Cadastrar banco' },
      { id: 'cadastrar-companhia', label: 'Cadastrar companhia' },
      { id: 'config-gateway', label: 'Configurações de Gateway' },
      { id: 'config-gerais', label: 'Configurações Gerais' },
      { id: 'cadastrar-operadora', label: 'Cadastrar Operadora' },
      { id: 'cadastrar-textos', label: 'Cadastrar Textos' },
      { id: 'listar-atividades', label: 'Listar atividades' },
      { id: 'listar-bancos', label: 'Listar bancos' },
      { id: 'listar-companhias', label: 'Listar companhias' },
      { id: 'listar-operadoras', label: 'Listar operadoras' },
      { id: 'personalizacao', label: 'Personalização' },
      { id: 'slides', label: 'Slides' }
    ]
  }
];

const agencyMenuItems: MenuItem[] = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'buscar-passagem', label: 'Encontrar Passagem', icon: Search },
  { id: 'consultas', label: 'Consultas do Sistema', icon: Search },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ activeItem, onItemClick, userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Selecionar itens do menu baseado na função do usuário
  const menuItems = userRole === 'admin' ? adminMenuItems : agencyMenuItems;

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string, hasSubItems: boolean) => {
    if (hasSubItems && !isCollapsed) {
      toggleExpanded(itemId);
    } else {
      onItemClick(itemId);
    }
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-[#00416A] transition-all duration-300 z-50 overflow-y-auto ${
      isCollapsed ? 'w-16' : 'w-[280px]'
    }`}>
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        {!isCollapsed && (
          <h2 className="text-white font-semibold text-lg">Pontos & Milhas</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const isExpanded = expandedItems.includes(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          return (
            <div key={item.id}>
              {/* Main menu item */}
              <button
                onClick={() => handleItemClick(item.id, hasSubItems)}
                className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 relative group ${
                  isActive 
                    ? 'bg-blue-600 border-l-4 border-white' 
                    : 'hover:bg-blue-700'
                }`}
              >
                <Icon 
                  size={20} 
                  className="text-white flex-shrink-0" 
                />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 text-white font-medium text-base flex-1">
                      {item.label}
                    </span>
                    {hasSubItems && (
                      <div className="ml-2">
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-white" />
                        ) : (
                          <ChevronRight size={16} className="text-white" />
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {item.label}
                  </div>
                )}
              </button>

              {/* Submenu items */}
              {hasSubItems && isExpanded && !isCollapsed && (
                <div className="bg-blue-800">
                  {item.subItems!.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onItemClick(subItem.id)}
                      className={`w-full flex items-center px-8 py-2 text-left transition-all duration-200 ${
                        activeItem === subItem.id
                          ? 'bg-blue-600 border-l-4 border-white'
                          : 'hover:bg-blue-700'
                      }`}
                    >
                      <span className="text-white text-sm">
                        {subItem.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}