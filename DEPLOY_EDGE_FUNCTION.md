# Deploy da Edge Function para n8n

## O Problema

O código estava usando `mode: 'no-cors'` que não envia os dados corretamente. Agora usa uma Edge Function do Supabase como proxy.

## Deploy Necessário

Você precisa fazer o deploy da Edge Function `n8n-webhook-proxy` que já está no projeto.

### Opção 1: Via Supabase Dashboard

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Edge Functions** no menu lateral
4. Clique em **Deploy new function**
5. Nome: `n8n-webhook-proxy`
6. Copie o conteúdo de `supabase/functions/n8n-webhook-proxy/index.ts`
7. Cole no editor
8. Clique em **Deploy**

### Opção 2: Via Supabase CLI (Recomendado)

```bash
# Instalar CLI (se ainda não tem)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref <seu-project-ref>

# Deploy da função
supabase functions deploy n8n-webhook-proxy --no-verify-jwt
```

## Como Funciona

**Antes (não funcionava):**
```
Frontend → n8n (CORS bloqueado)
```

**Agora (funciona):**
```
Frontend → Edge Function Supabase → n8n
```

A Edge Function:
1. Recebe o payload do frontend
2. Faz a chamada para o n8n
3. Retorna sucesso/erro

## Testar

Após o deploy, teste no console do navegador:

```javascript
fetch('https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/n8n-webhook-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw'
  },
  body: JSON.stringify({
    search_id: 'test-123',
    origem: 'GRU',
    destino: 'CGB',
    dataIda: '2025-11-15'
  })
})
.then(r => r.json())
.then(console.log)
```

Você deve ver:
```json
{
  "success": true,
  "status": 200,
  "message": "Webhook enviado com sucesso"
}
```

## Verificar Logs

Para ver se os dados estão chegando no n8n:

1. No Supabase: **Edge Functions** → **n8n-webhook-proxy** → **Logs**
2. Você verá:
   - "Recebido payload: {...}"
   - "Status n8n: 200"
   - "Resposta n8n: {...}"

## URL da Edge Function

A URL completa é:
```
https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/n8n-webhook-proxy
```

O frontend já está configurado para usar essa URL automaticamente.
