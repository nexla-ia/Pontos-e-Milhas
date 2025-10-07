# Integração com n8n via Webhook

Este documento explica como o sistema de busca de voos se integra com o n8n.

## Fluxo Completo

### 1. Usuário Clica em "Pesquisar"

Quando o usuário preenche o formulário e clica em "Pesquisar":

1. **Cria registro no banco**: Um registro é criado na tabela `flight_searches` com status `pending`
2. **Recebe search_id**: O banco retorna um UUID único para essa busca
3. **Envia para n8n**: Faz POST para o webhook com o search_id e parâmetros
4. **Navega para resultados**: Usuário vê tela de loading

### 2. Webhook do n8n Recebe os Dados

**URL do webhook n8n que recebe:** `https://n8n.nexladesenvolvimento.com.br/webhook/pesquisaVoo`

**Payload enviado:**
```json
{
  "search_id": "uuid-gerado-pelo-banco",
  "origem": "GRU",
  "destino": "CGB",
  "dataIda": "2025-11-15",
  "dataVolta": null,
  "adultos": 1,
  "criancas": 0,
  "bebes": 0,
  "classe": "economica",
  "companhias": ["gol", "azul", "latam"],
  "somenteIda": true,
  "sort": "BEST",
  "timestamp": "2025-10-03T20:00:00.000Z"
}
```

### 3. n8n Processa a Busca

O n8n deve:
1. Receber o payload
2. Buscar voos nas APIs das companhias
3. Processar e formatar os resultados
4. **Importante:** Guardar o `search_id` recebido

### 4. n8n Retorna os Resultados

Quando terminar, o n8n deve fazer POST para a Edge Function do Supabase:

**URL da Edge Function:** `https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/receive-n8n-results`

**Headers necessários:**
```
Content-Type: application/json
```

**Payload de resposta:**
```json
{
  "search_id": "uuid-que-foi-recebido-no-passo-2",
  "flights": [
    {
      "airline": "GOL LINHAS AEREAS S/A",
      "flightNumber": "G3 1448",
      "origin": "GRU",
      "destination": "CGB",
      "departure": "2025-11-15T08:55:00",
      "arrival": "2025-11-15T10:10:00",
      "duration": "PT2H15M",
      "stops": 0,
      "aircraft": "BOEING 737-800",
      "price": {
        "currency": "BRL",
        "total": "600.20"
      }
    },
    {
      "airline": "AZUL LINHAS AEREAS",
      "flightNumber": "AD 2734",
      "origin": "GRU",
      "destination": "CGB",
      "departure": "2025-11-15T14:30:00",
      "arrival": "2025-11-15T16:00:00",
      "duration": "PT2H30M",
      "stops": 0,
      "aircraft": "AIRBUS A320",
      "price": {
        "currency": "BRL",
        "total": "550.00"
      }
    }
  ]
}
```

### 5. Edge Function Salva no Banco

A Edge Function automaticamente:
1. Valida o `search_id`
2. Atualiza o status da busca para `completed`
3. Insere cada voo na tabela `flight_results`
4. Retorna sucesso

### 6. Frontend Mostra os Resultados

O frontend está fazendo polling (verificando a cada 2 segundos):
- Quando o status muda para `completed`
- Busca todos os voos da tabela `flight_results`
- Exibe cada voo em um card individual

## Formato dos Dados

### Estrutura de cada Flight

```typescript
{
  airline: string;           // Nome da companhia
  flightNumber: string;      // Número do voo (ex: "G3 1448")
  origin: string;            // Código IATA origem (ex: "GRU")
  destination: string;       // Código IATA destino (ex: "CGB")
  departure: string;         // ISO 8601 datetime
  arrival: string;           // ISO 8601 datetime
  duration: string;          // Duração em formato ISO 8601 (ex: "PT2H15M")
  stops: number;             // Número de paradas (0 = direto)
  aircraft: string;          // Tipo de aeronave (opcional)
  price: {
    currency: string;        // Código da moeda (ex: "BRL")
    total: string;           // Preço total como string (ex: "600.20")
  }
}
```

## Configuração do n8n

### Node 1: Webhook Trigger
- **URL:** `/webhook/pesquisaVoo`
- **Method:** POST
- **Recebe:** search_id + parâmetros de busca

### Node 2: Processar Busca
- Buscar voos nas APIs
- Formatar resultados

### Node 3: HTTP Request
- **URL:** `https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/receive-n8n-results`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:** JSON com search_id e array de flights

## Timeout

- O frontend aguarda até **60 segundos**
- Após isso, mostra mensagem de timeout
- É importante que o n8n responda dentro desse prazo

## Tratamento de Erros

Se ocorrer erro no n8n:
```json
{
  "search_id": "uuid",
  "flights": []
}
```

Isso vai marcar a busca como completada mas sem resultados.

## Testes

Para testar manualmente a Edge Function:

```bash
curl -X POST https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/receive-n8n-results \
  -H "Content-Type: application/json" \
  -d '{
    "search_id": "seu-search-id-aqui",
    "flights": [
      {
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
      }
    ]
  }'
```

## Logs

Para debug:
- Frontend: Console do navegador mostra cada etapa
- Edge Function: Logs no Supabase Dashboard > Edge Functions > Logs
- n8n: Executions do workflow
