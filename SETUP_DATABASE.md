# Teste de Integração com n8n

## Formato do Payload Enviado

Quando você clica em **PESQUISAR PASSAGEM**, o front envia este JSON para o n8n:

```json
{
  "source": "amadeus",
  "search": {
    "origin": "GRU",
    "destination": "CGB",
    "date": "2025-11-15",
    "returnDate": null,
    "adults": 1,
    "cabin": "ECONOMY",
    "airlines": ["AD", "G3", "LA"],
    "nonStop": false,
    "currency": "BRL",
    "sort": "best"
  },
  "ui": {
    "originLabel": "GRU - Aeroporto Internacional de São Paulo/Guarulhos",
    "destinationLabel": "CGB - Aeroporto Internacional de Cuiabá"
  }
}
```

## Mapeamento de Companhias

O front converte os IDs internos para códigos IATA:

```
azul    → AD
gol     → G3
latam   → LA
tam     → JJ
avianca → AV
copa    → CM
```

## Mapeamento de Classe

```
economica  → ECONOMY
executiva  → BUSINESS
```

## Mapeamento de Ordenação

```
BEST     → best
CHEAPEST → cheapest
FASTEST  → fastest
```

## Teste no Console do Navegador

Você pode testar o webhook diretamente:

```javascript
fetch("https://n8n.nexladesenvolvimento.com.br/webhook/pesquisaVoo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    source: "amadeus",
    search: {
      origin: "GRU",
      destination: "CGB",
      date: "2025-11-15",
      returnDate: null,
      adults: 1,
      cabin: "ECONOMY",
      airlines: ["G3"],
      nonStop: false,
      currency: "BRL",
      sort: "best"
    },
    ui: {
      originLabel: "GRU - São Paulo",
      destinationLabel: "CGB - Cuiabá"
    }
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Logs no Console

Quando você pesquisa, verá no console:

```
📤 Enviando para n8n: { source: "amadeus", search: {...}, ui: {...} }
✅ Webhook n8n respondeu: { ... }
```

Se der erro:

```
❌ Falha ao chamar webhook n8n: 404 Not Found
```

## Verificar se Chegou no n8n

1. Acesse o n8n: https://n8n.nexladesenvolvimento.com.br
2. Abra o workflow **pesquisaVoo**
3. Veja as execuções recentes
4. Confira se o payload chegou com todos os campos

## Campos Obrigatórios

✅ `source` - Sempre "amadeus"
✅ `search.origin` - Código IATA 3 letras (ex: "GRU")
✅ `search.destination` - Código IATA 3 letras (ex: "CGB")
✅ `search.date` - Formato YYYY-MM-DD
✅ `search.adults` - Número >= 1
✅ `search.cabin` - "ECONOMY" ou "BUSINESS"
✅ `search.airlines` - Array com códigos IATA (ex: ["G3", "AD"])
✅ `search.currency` - "BRL"

## Campos Opcionais

- `search.returnDate` - null ou "YYYY-MM-DD"
- `search.nonStop` - true/false (padrão: false)
- `search.sort` - "best" | "cheapest" | "fastest"
- `ui.originLabel` - Label completo da origem
- `ui.destinationLabel` - Label completo do destino

## Validações do Front

Antes de enviar, o front valida:

- Origem e destino preenchidos
- Origem ≠ Destino
- Data de ida preenchida
- Data de ida >= hoje
- Adultos >= 1
- Pelo menos 1 companhia selecionada

## CORS

O webhook do n8n **PRECISA** aceitar requisições CORS do domínio do front.

Se der erro de CORS, configure no n8n:

- Webhook node → Settings → Response → Headers
- Adicionar: `Access-Control-Allow-Origin: *`

## Status HTTP Esperados

- **200** - Sucesso
- **400** - Payload inválido
- **404** - Webhook não encontrado
- **500** - Erro no workflow do n8n

## Troubleshooting

### Nada chega no n8n

- Verifique URL do webhook
- Confirme que o workflow está ativo
- Veja logs do n8n

### Erro de CORS

- Configure headers no webhook node
- Ou use Edge Function proxy (já existe no projeto)

### Erro 404

- Webhook não existe ou está desativado
- Verifique path: `/webhook/pesquisaVoo`

### Payload vazio

- Verifique console do navegador
- Confirme que `handleSearch` está sendo chamado
- Veja se há erros de validação
