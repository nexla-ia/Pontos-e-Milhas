-- ====================================
-- CRIAR TABELAS PARA BUSCA DE VOOS
-- ====================================
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- Tempo estimado: 5 segundos

-- Criar tabela de buscas
CREATE TABLE IF NOT EXISTS flight_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date date NOT NULL,
  return_date date,
  adults integer NOT NULL DEFAULT 1,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de resultados
CREATE TABLE IF NOT EXISTS flight_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid NOT NULL REFERENCES flight_searches(search_id) ON DELETE CASCADE,
  airline text NOT NULL,
  flight_number text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure timestamptz NOT NULL,
  arrival timestamptz NOT NULL,
  duration text NOT NULL,
  stops integer NOT NULL DEFAULT 0,
  aircraft text,
  price_currency text NOT NULL,
  price_total text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ativar RLS (Row Level Security)
ALTER TABLE flight_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_results ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para flight_searches
CREATE POLICY "Anyone can create searches"
  ON flight_searches FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read searches"
  ON flight_searches FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update searches"
  ON flight_searches FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas de segurança para flight_results
CREATE POLICY "Anyone can create results"
  ON flight_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read results"
  ON flight_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_flight_searches_search_id ON flight_searches(search_id);
CREATE INDEX IF NOT EXISTS idx_flight_results_search_id ON flight_results(search_id);
CREATE INDEX IF NOT EXISTS idx_flight_searches_status ON flight_searches(status);

-- ====================================
-- PRONTO! Tabelas criadas com sucesso
-- ====================================
-- Agora você pode:
-- 1. Ir para Table Editor e ver as tabelas
-- 2. Recarregar a aplicação
-- 3. Testar a busca de voos
