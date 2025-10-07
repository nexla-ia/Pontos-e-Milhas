# Teste de Integração Front + n8n

## ✅ O Que Foi Implementado

### 1. Envio Correto para n8n
- URL: `https://n8n.nexladesenvolvimento.com.br/webhook/pesquisaVoo`
- Método: `POST`
- Headers: `Content-Type: application/json`
- Body: JSON com `source`, `search`, `ui`

### 2. Recebimento da Resposta
- O n8n deve retornar **array de ofertas** diretamente
- Formato esperado: `[{id, type, itineraries, price, ...}, ...]`
- Validação: verifica se é array antes de processar

### 3. Exibição dos Resultados
- Página "Resultados dos Voos" recebe os dados via evento `navigate`
- Parse automático dos campos do formato Amadeus
- Renderização em cards bonitos

## 📋 Fluxo Completo

```
1. Usuário preenche formulário
2. Clica em "PESQUISAR PASSAGEM"
3. Front envia POST para n8n
4. n8n processa e retorna JSON
5. Front valida se é array
6. Front navega para página de resultados
7. Página renderiza os voos
```

## 🧪 Como Testar

### Teste 1: Verificar Envio

Abra o console (F12) e faça uma busca. Você deve ver:

```
📤 Enviando para n8n: {
  source: "amadeus",
  search: {
    origin: "GRU",
    destination: "CGB",
    date: "2025-11-15",
    ...
  }
}
```

### Teste 2: Verificar Resposta

Logo depois, deve aparecer:

```
✅ Webhook n8n respondeu com 10 ofertas: [...]
```

Se der erro:

```
❌ Formato de resposta inválido do servidor. Esperava array, recebeu: object
```

Isso significa que o n8n não está retornando um array direto.

### Teste 3: Verificar Renderização

1. Após clicar em pesquisar, deve aparecer "Buscando voos disponíveis..."
2. Em 1-2 segundos, deve mostrar os cards de voos
3. Cada card deve ter:
   - Companhia aérea (código IATA)
   - Número do voo
   - Origem e destino com horários
   - Duração formatada (ex: "2h 15min")
   - Número de paradas
   - Preço em BRL

## 🔧 Configuração do n8n

### O Webhook n8n DEVE Retornar

**CORRETO** (array direto):
```json
[
  {
    "id": "1",
    "type": "flight-offer",
    "source": "GDS",
    "itineraries": [...],
    "price": {
      "currency": "BRL",
      "total": "600.00",
      "grandTotal": "600.00"
    },
    ...
  },
  ...
]
```

**INCORRETO** (objeto com array dentro):
```json
{
  "data": [...],
  "meta": {...}
}
```

Se o n8n retorna assim, você tem 2 opções:

#### Opção A: Ajustar n8n (Recomendado)

No último node do workflow, use um **Code node** ou **Set node**:

```javascript
// Code node
return $input.all().map(item => item.json);
```

Ou configure o webhook response para retornar apenas `{{$json.data}}`.

#### Opção B: Ajustar Front

Se não puder mudar o n8n, o front já trata isso automaticamente:

```javascript
// No ResultadosVoosPage.tsx, linhas 34-42
if (Array.isArray(responseData)) {
  offers = responseData;
} else if (responseData.data && Array.isArray(responseData.data)) {
  offers = responseData.data; // ← Pega array de dentro do objeto
}
```

## 🐛 Troubleshooting

### Erro: "Formato de resposta inválido do servidor"

**Causa:** n8n não retornou array

**Solução:**
1. Veja no console o que foi retornado: `console.log(offers)`
2. Ajuste o n8n para retornar array direto
3. Ou ajuste o parsing no front (já tem tratamento básico)

### Erro: "Nenhum dado foi retornado do servidor"

**Causa:** `event.detail.data` está vazio

**Solução:**
1. Verifique se o fetch está funcionando
2. Veja se há erro de CORS
3. Confirme que o webhook n8n está ativo

### Loading infinito

**Causa:** Página de resultados não recebeu os dados

**Solução:**
1. Verifique se o evento `navigate` está sendo disparado
2. Veja no console se há logs `📥 Recebendo dados da navegação`
3. Confirme que `event.detail.data` existe

### Cards aparecem mas sem dados

**Causa:** Estrutura JSON diferente do esperado

**Solução:**
1. Veja no console a estrutura exata dos objetos
2. Ajuste o parsing nos componentes:
   - `firstSegment?.departure?.iataCode`
   - `flight.price.grandTotal`
   - etc.

## 📊 Formato Amadeus (Referência)

O n8n deve retornar ofertas no formato da API Amadeus:

```json
{
  "id": "1",
  "type": "flight-offer",
  "source": "GDS",
  "instantTicketingRequired": false,
  "nonHomogeneous": false,
  "oneWay": false,
  "lastTicketingDate": "2025-11-14",
  "numberOfBookableSeats": 7,
  "itineraries": [
    {
      "duration": "PT2H15M",
      "segments": [
        {
          "departure": {
            "iataCode": "GRU",
            "at": "2025-11-15T08:55:00"
          },
          "arrival": {
            "iataCode": "CGB",
            "at": "2025-11-15T10:10:00"
          },
          "carrierCode": "G3",
          "number": "1448",
          "aircraft": {
            "code": "73G"
          },
          "duration": "PT2H15M"
        }
      ]
    }
  ],
  "price": {
    "currency": "BRL",
    "total": "600.00",
    "base": "500.00",
    "fees": [],
    "grandTotal": "600.00"
  },
  "validatingAirlineCodes": ["G3"],
  "travelerPricings": [...]
}
```

## ✅ Checklist de Validação

Antes de considerar pronto, verifique:

- [ ] Console mostra `📤 Enviando para n8n`
- [ ] Console mostra `✅ Webhook n8n respondeu com X ofertas`
- [ ] Nenhum erro de CORS no console
- [ ] Página muda de "Buscando..." para lista de voos
- [ ] Cards renderizam com todos os dados:
  - [ ] Companhia aérea
  - [ ] Número do voo
  - [ ] Origem + horário + data
  - [ ] Destino + horário + data
  - [ ] Duração formatada
  - [ ] Paradas (0 = Direto)
  - [ ] Preço em BRL com 2 casas decimais
- [ ] Botão "Selecionar Voo" aparece em cada card
- [ ] Mensagem de erro aparece se não houver voos

## 📝 Logs Esperados

### Console do Navegador

```
📤 Enviando para n8n: {source: "amadeus", search: {...}}
✅ Webhook n8n respondeu com 10 ofertas: [{id: "1", ...}, ...]
📥 Recebendo dados da navegação: {page: "Resultados dos Voos", data: [...]}
✅ Ofertas processadas: (10) [{…}, {…}, ...]
```

### Console do n8n

```
POST /webhook/pesquisaVoo
Body: {"source":"amadeus","search":{...}}
Response: 200 OK
Body: [{...}, {...}, ...]
```

## 🎯 Resumo

**O front agora:**
1. ✅ Envia POST JSON correto para n8n
2. ✅ Recebe resposta como `response.json()` (não usa `.text()`)
3. ✅ Valida se é array
4. ✅ Passa dados diretamente para página de resultados
5. ✅ Renderiza cards com parse dos campos Amadeus

**O n8n precisa:**
1. ✅ Aceitar POST com JSON
2. ✅ Retornar array de ofertas (formato Amadeus)
3. ✅ Headers CORS (se necessário)
4. ✅ Status 200 em caso de sucesso

---

**Última atualização:** 2025-10-06
