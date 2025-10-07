/*
  # Criar agência de teste para agente

  1. New Tables Data
    - Agência: "TurMundo Viagens e Turismo Ltda"
      - CNPJ: 98.765.432/0001-10
      - Email: contato@turmundo.com.br
      - Perfil: B2B
      - Localização: Rio de Janeiro, RJ
      - Atividades: Turismo corporativo, lazer, eventos
    
    - Usuário agente: Maria Fernanda Costa
      - Role: emissor (agente que emite passagens)
      - Email: maria@turmundo.com.br
      - Vinculado à agência TurMundo

  2. Security
    - Dados inseridos respeitando RLS existente
    - Usuário com perfil de emissor para testes de funcionalidades

  3. Features
    - Agência habilitada para emitir milhas e passagens pagas
    - Limite de consultas configurado
    - Dados completos de endereço e contato
*/

-- Inserir agência de teste para agente
INSERT INTO agencies (
  corporate_name,
  trade_name,
  cnpj,
  email_primary,
  email_financial,
  phone,
  website,
  num_employees,
  consultation_limit,
  profile,
  address_cep,
  address_street,
  address_number,
  address_complement,
  district,
  city,
  state,
  activities,
  notes,
  can_emit_milhas,
  can_emit_paid,
  show_milhas,
  show_paid
) VALUES (
  'TurMundo Viagens e Turismo Ltda',
  'TurMundo Viagens',
  '98.765.432/0001-10',
  'contato@turmundo.com.br',
  'financeiro@turmundo.com.br',
  '(21) 3456-7890',
  'www.turmundo.com.br',
  15,
  500,
  'B2B',
  '22071-900',
  'Avenida Atlântica',
  '1500',
  'Sala 801',
  'Copacabana',
  'Rio de Janeiro',
  'RJ',
  ARRAY['Turismo Corporativo', 'Turismo de Lazer', 'Eventos e Convenções', 'Turismo Nacional'],
  'Agência especializada em turismo corporativo e de lazer, com foco em atendimento personalizado',
  true,
  true,
  true,
  true
);

-- Buscar o ID da agência recém-criada
DO $$
DECLARE
  agency_uuid uuid;
BEGIN
  SELECT id INTO agency_uuid FROM agencies WHERE cnpj = '98.765.432/0001-10';
  
  -- Inserir usuário agente para a agência
  INSERT INTO users (
    full_name,
    role,
    agency_id
  ) VALUES (
    'Maria Fernanda Costa',
    'emissor',
    agency_uuid
  );
END $$;

-- Inserir algumas atividades adicionais se não existirem
INSERT INTO activities (name) VALUES 
  ('Turismo Corporativo'),
  ('Turismo de Lazer'),
  ('Eventos e Convenções'),
  ('Turismo Nacional'),
  ('Turismo Internacional'),
  ('Cruzeiros Marítimos')
ON CONFLICT DO NOTHING;

-- Inserir algumas companhias aéreas adicionais se não existirem
INSERT INTO airlines (name, code) VALUES 
  ('Azul Linhas Aéreas', 'AD'),
  ('LATAM Airlines', 'LA'),
  ('Avianca Brasil', 'O6')
ON CONFLICT (code) DO NOTHING;

-- Inserir alguns bancos adicionais se não existirem
INSERT INTO banks (name, code) VALUES 
  ('Banco Itaú', '341'),
  ('Banco Santander', '033'),
  ('Banco do Brasil', '001'),
  ('Caixa Econômica Federal', '104')
ON CONFLICT DO NOTHING;