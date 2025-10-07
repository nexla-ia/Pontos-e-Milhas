# Portal Pontos e Milhas

Sistema de busca e gerenciamento de passagens aéreas integrado com n8n.

## 📋 Características

- Integração com n8n para busca de voos em múltiplas APIs
- Sistema de polling para resultados em tempo real
- Interface responsiva e intuitiva
- Gestão completa de agências e usuários
- Suporte para voos de ida e volta

## 🚀 Setup Rápido

### 1️⃣ Criar Tabelas no Banco (OBRIGATÓRIO)

**❌ Sem isso você verá erro 404!**

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** → **New Query**
4. Copie e cole todo o conteúdo do arquivo `create_flight_tables.sql`
5. Clique em **Run** (Ctrl/Cmd + Enter)

✅ Isso cria `flight_searches` e `flight_results`

### 2️⃣ Deploy da Edge Function (OBRIGATÓRIO)

**❌ Sem isso os dados não chegam no n8n!**

```bash
supabase functions deploy n8n-webhook-proxy --no-verify-jwt
```

Ou via Dashboard (veja `DEPLOY_EDGE_FUNCTION.md`)

✅ Isso permite comunicação frontend ↔ n8n

## 🔄 Como Funciona

### Fluxo de Busca de Voos

```
1. Usuário pesquisa → Salva no banco (status: pending)
2. Frontend → Edge Function proxy → n8n webhook
3. n8n processa → Busca nas APIs das companhias
4. n8n → Edge Function receive → Salva resultados
5. Frontend polling (2s) → Detecta completion → Mostra voos
```

### Edge Functions

#### **n8n-webhook-proxy**
Proxy entre frontend e n8n (resolve CORS)
- **Endpoint**: `/functions/v1/n8n-webhook-proxy`
- **Envia para**: `https://n8n.nexladesenvolvimento.com.br/webhook/pesquisaVoo`

#### **receive-n8n-results**
Recebe resultados do n8n e salva no banco
- **Endpoint**: `/functions/v1/receive-n8n-results`
- **Atualiza**: Status da busca + insere voos encontrados

#### **flight-search** (Opcional)
Busca direta via Amadeus API (não usado no fluxo principal)

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- Projeto Supabase configurado
- n8n com workflow configurado

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build

```bash
npm run build
```

## 📊 Banco de Dados

### Tabelas

**flight_searches** - Armazena cada busca
- `search_id` (uuid) - ID único para matching
- `origin`, `destination` - Códigos IATA
- `departure_date`, `return_date` - Datas
- `adults` - Número de passageiros
- `status` - pending | completed | error

**flight_results** - Armazena voos encontrados
- `search_id` (uuid) - FK para flight_searches
- `airline`, `flight_number` - Dados do voo
- `departure`, `arrival` - Horários
- `duration`, `stops` - Duração e paradas
- `price_currency`, `price_total` - Preço

## 🎨 Stack Tecnológica

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (ícones)

**Backend:**
- Supabase (Database + Edge Functions)
- n8n (Workflow automation)
- Deno Runtime

## 🐛 Troubleshooting

### ❌ Erro 404 no /rest/v1/flight_searches

**Causa:** Tabelas não criadas no banco
**Solução:** Execute `create_flight_tables.sql` no SQL Editor

### ❌ n8n não recebe dados

**Causa:** Edge Function não deployed
**Solução:** `supabase functions deploy n8n-webhook-proxy --no-verify-jwt`

### ❌ Console mostra "Erro ao enviar webhook"

**Causa:** URL incorreta ou função não deployed
**Solução:** Verifique logs em Dashboard → Edge Functions → n8n-webhook-proxy → Logs

### ❌ Loading infinito (nunca mostra resultados)

**Causa:** n8n não está retornando dados
**Solução:** Verifique se o workflow do n8n está ativo e retornando para a URL correta

## 📝 Payload do n8n

**n8n recebe:**
```json
{
  "search_id": "uuid-gerado",
  "origem": "GRU",
  "destino": "CGB",
  "dataIda": "2025-11-15",
  "dataVolta": null,
  "adultos": 1,
  "classe": "economica",
  "companhias": ["gol", "azul"]
}
```

**n8n deve retornar para:** `https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/receive-n8n-results`

```json
{
  "search_id": "uuid-recebido",
  "flights": [{
    "airline": "GOL",
    "flightNumber": "G3 1448",
    "origin": "GRU",
    "destination": "CGB",
    "departure": "2025-11-15T08:55:00",
    "arrival": "2025-11-15T10:10:00",
    "duration": "PT2H15M",
    "stops": 0,
    "aircraft": "BOEING 737",
    "price": {
      "currency": "BRL",
      "total": "600.20"
    }
  }]
}
```

## 📖 Documentação Adicional

- `IMPORTANT_DATABASE_SETUP.md` - Setup das tabelas (resolve 404)
- `DEPLOY_EDGE_FUNCTION.md` - Deploy da função proxy
- `WEBHOOK_INTEGRATION.md` - Integração completa com n8n
- `create_flight_tables.sql` - SQL pronto para executar

## 📄 Licença

Privado
