# ⚠️ IMPORTANTE: Setup do Banco de Dados

## Erro 404 - Tabelas Não Existem

O erro `404 (Not Found)` no endpoint `/rest/v1/flight_searches` acontece porque **as tabelas ainda não foram criadas no banco de dados do Supabase**.

## Como Resolver (3 minutos)

### Opção 1: Dashboard do Supabase (Recomendado - Mais Fácil)

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione** seu projeto
3. **Clique** em "SQL Editor" no menu lateral
4. **Clique** em "New Query"
5. **Cole** o SQL abaixo
6. **Clique** em "Run" (ou Ctrl/Cmd + Enter)

```sql
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
```

### Opção 2: Supabase CLI

```bash
# Se você tem o CLI instalado
cd /path/to/project
supabase db push
```

## Verificação

Após executar o SQL:

1. Vá em **Table Editor** no dashboard
2. Você deve ver 2 novas tabelas:
   - ✅ `flight_searches`
   - ✅ `flight_results`

## Teste

Após criar as tabelas, recarregue a aplicação e tente pesquisar um voo novamente. O erro 404 deve desaparecer.

## O Que Essas Tabelas Fazem?

### `flight_searches`
Armazena cada busca de voo que o usuário faz:
- Origem e destino
- Datas
- Número de passageiros
- Status da busca (pending → completed)

### `flight_results`
Armazena os voos encontrados para cada busca:
- Dados do voo (companhia, número, horários)
- Preço
- Duração e paradas
- Vinculado a uma busca pelo `search_id`

## Fluxo Completo

1. Usuário pesquisa → Cria registro em `flight_searches`
2. Sistema envia para n8n → n8n processa
3. n8n retorna resultados → Edge Function salva em `flight_results`
4. Frontend detecta (polling) → Mostra os voos

---

**Ainda com dúvidas?** Veja `WEBHOOK_INTEGRATION.md` para detalhes da integração com n8n.
