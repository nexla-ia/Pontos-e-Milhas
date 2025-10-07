# Correção do Erro 404 no Supabase

## 🐛 Problema

Ao clicar em "PESQUISAR PASSAGEM", aparecia erro 404:
```
POST /rest/v1/flight_searches 404 (Not Found)
```

Isso causava travamento na UI e impedia os voos de aparecerem.

## ✅ Solução Implementada

### 1. Chamada ao Supabase Desabilitada

A tentativa de salvar o histórico da busca foi **comentada** em:
- `src/components/pages/BuscarPassagemPage.tsx` (linhas 297-322)

**Antes:**
```javascript
try {
  await supabase
    .from('flight_searches')
    .insert({...});
} catch (dbError) {
  console.warn('Erro ao salvar no banco (ignorado):', dbError);
}
```

**Agora:**
```javascript
// NOTA: Log no Supabase comentado temporariamente
// A tabela flight_searches retorna 404
/*
try {
  await supabase
    .from('flight_searches')
    .insert({...});
  console.log('✅ Busca salva no histórico');
} catch (dbError) {
  console.warn('⚠️ Falha ao salvar histórico (ignorado):', dbError);
}
*/
```

### 2. Fluxo Principal Preservado

O código agora:
1. ✅ Chama o webhook n8n
2. ✅ Recebe as ofertas
3. ✅ ~~Tenta salvar no Supabase~~ (comentado)
4. ✅ Navega para página de resultados
5. ✅ Renderiza os voos

**O erro 404 NÃO impede mais a busca de funcionar!**

## 🔍 Por Que o Erro 404 Acontece?

A tabela `flight_searches` provavelmente:

1. **Não foi criada** - A migration não foi aplicada
2. **Está em schema diferente** - Não está em `public`
3. **URL incorreta** - `.env` aponta para projeto diferente

## 🛠️ Como Reabilitar o Log (Opcional)

### Passo 1: Verificar se a Tabela Existe

Acesse o [Supabase Dashboard](https://supabase.com/dashboard) e vá em:
- Table Editor
- Procure por `flight_searches`

Se **NÃO existir**:

### Passo 2: Aplicar a Migration

Execute o SQL em **SQL Editor**:

```sql
-- Ver arquivo: supabase/migrations/20251003200000_create_flight_searches.sql

CREATE TABLE IF NOT EXISTS flight_searches (
  search_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date date NOT NULL,
  return_date date,
  adults integer NOT NULL DEFAULT 1,
  currency text DEFAULT 'BRL',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flight_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on flight_searches"
  ON flight_searches FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public select on flight_searches"
  ON flight_searches FOR SELECT
  TO anon
  USING (true);
```

### Passo 3: Descomentar o Código

Em `src/components/pages/BuscarPassagemPage.tsx`, remova os `/*` e `*/`:

```javascript
// Descomente isso ↓
try {
  await supabase
    .from('flight_searches')
    .insert({
      origin: origemCode,
      destination: destinoCode,
      departure_date: searchParams.dataIda,
      return_date: searchParams.somenteIda ? null : searchParams.dataVolta,
      adults: searchParams.adultos,
      currency: 'BRL',
      status: 'completed'
    });
  console.log('✅ Busca salva no histórico');
} catch (dbError) {
  console.warn('⚠️ Falha ao salvar histórico (ignorado):', dbError);
}
```

### Passo 4: Testar

1. Busque uma passagem
2. Verifique no console: `✅ Busca salva no histórico`
3. Confirme no Supabase Dashboard que o registro foi criado

## 📝 Importante

**A busca de voos funciona perfeitamente SEM o log no Supabase!**

O log é apenas para:
- Histórico de buscas
- Analytics
- Auditoria

Se você **não precisa** disso agora, deixe comentado e foque em fazer a integração com o n8n funcionar primeiro.

## ✅ Status Atual

- [x] Erro 404 não bloqueia mais a UI
- [x] Busca envia para n8n corretamente
- [x] Voos são renderizados normalmente
- [ ] Log no Supabase (opcional, desabilitado)

## 🧪 Teste

1. Preencha o formulário de busca
2. Clique em "PESQUISAR PASSAGEM"
3. Veja no console:
   ```
   📤 Enviando para n8n: {...}
   ✅ Webhook n8n respondeu: [...]
   📦 Ofertas extraídas: 10 voo(s)
   ```
4. ❌ **NÃO** deve aparecer erro 404
5. ✅ Voos devem renderizar normalmente

---

**Última atualização:** 2025-10-06
