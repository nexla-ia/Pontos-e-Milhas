# Configuração do Webhook n8n

## 🎯 Objetivo

Garantir que o front receba e exiba corretamente os dados da API Amadeus retornados pelo n8n.

## 📋 Configuração do n8n (Passo a Passo)

### 1. Webhook Node (dados)

**Settings:**
- HTTP Method: `POST`
- Path: `pesquisaVoo`
- Response Mode: `Using 'Respond to Webhook' Node`
- CORS: `*`

### 2. Edit Fields Node

Extrair campos do payload recebido:

```
originLocationCode = {{$json.body.search.origin}}
destinationLocationCode = {{$json.body.search.destination}}
departureDate = {{$json.body.search.date}}
returnDate = {{$json.body.search.returnDate}}
adults = {{$json.body.search.adults}}
currencyCode = {{$json.body.search.currency}}
max = 5
```

### 3. HTTP Request (OAuth Token)

**Method:** `POST`
**URL:** `https://test.api.amadeus.com/v1/security/oauth2/token`
**Body Parameters:**
- `grant_type` = `client_credentials`
- `client_id` = `BkJ96jdklQNkWOZbeCRbNCEEgkGt46Kx`
- `client_secret` = `EYji9XTinKKcy4j8`

### 4. HTTP Request1 (Flight Offers)

**Method:** `GET`
**URL:** `https://test.api.amadeus.com/v2/shopping/flight-offers`

**Query Parameters:**
- `originLocationCode` = `{{$node["Edit Fields"].json.originLocationCode}}`
- `destinationLocationCode` = `{{$node["Edit Fields"].json.destinationLocationCode}}`
- `departureDate` = `{{$node["Edit Fields"].json.departureDate}}`
- `adults` = `{{$node["Edit Fields"].json.adults}}`
- `currencyCode` = `{{$node["Edit Fields"].json.currencyCode}}`
- `max` = `{{$node["Edit Fields"].json.max}}`

**Headers:**
- `Authorization` = `Bearer {{$node["HTTP Request"].json.access_token}}`

### 5. Respond to Webhook Node (CRÍTICO)

O front suporta 3 formatos. Escolha UM:

#### ✅ Opção 1: Array Direto (RECOMENDADO)

**Response Body:** `{{$json.data}}`

Resultado: `[{id: "1", ...}, {id: "2", ...}]`

#### ✅ Opção 2: Objeto com Data

**Response Body:** `={{ { "data": $json.data } }}`

Resultado: `{data: [{...}, {...}]}`

#### ✅ Opção 3: Amadeus Completo

**Response Body:** `={{$json}}`

Resultado: `{meta: {...}, data: [...], dictionaries: {...}}`

**Headers:**
- `Content-Type` = `application/json`

## 🧪 Teste no Console

```javascript
fetch("https://n8n.nexladesenvolvimento.com.br/webhook/pesquisaVoo", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    source: "amadeus",
    search: {
      origin: "CGB",
      destination: "GRU",
      date: "2025-10-16",
      returnDate: "2025-10-31",
      adults: 1,
      currency: "BRL"
    }
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Resultado esperado:** Array ou objeto com propriedade `data`

## 📊 Logs do Front

Quando funcionar:

```
📤 Enviando para n8n: {source: "amadeus", search: {...}}
✅ Webhook n8n respondeu: [{...}] ou {data: [...]}
📦 Formato detectado: Array direto com 10 ofertas
```

## ✅ Checklist

- [ ] Webhook ativo em `/webhook/pesquisaVoo`
- [ ] Edit Fields extraindo campos corretamente
- [ ] Token OAuth funcionando
- [ ] Authorization header enviado para Amadeus
- [ ] Respond to Webhook em um dos 3 formatos
- [ ] CORS configurado
- [ ] Teste manual funciona
- [ ] Status 200 OK no Network
