# Pontos e Milhas – Busca de Voos

Aplicação React/TypeScript para pesquisar e normalizar ofertas de voo com suporte a integração opcional com n8n e Supabase.

## 🚀 Primeiros passos

```bash
npm install
cp .env.example .env # preencha as variáveis conforme necessário
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

### Scripts úteis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento com Vite |
| `npm run build` | Gera o build de produção (`tsc -b` + `vite build`) |
| `npm run preview` | Preview do build |
| `npm run lint` | Executa ESLint em arquivos `.ts`/`.tsx` |
| `npm run typecheck` | Checagem de tipos sem emitir arquivos |
| `npm run test` | Executa testes unitários com o runner nativo do Node |

## ⚙️ Configuração de ambiente

Variáveis suportadas (ver `.env.example`):

- `VITE_N8N_WEBHOOK_URL`: URL do webhook n8n (opcional). Quando presente habilita o botão “Enviar ao n8n”.
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`: usados para acionar a edge function `flight-search`. Caso não informados o app utiliza resultados mock para demonstração.

Nenhuma das integrações é obrigatória para o app iniciar em modo de desenvolvimento.

## ✈️ Funcionalidades principais

- Formulário tipado com validações (IATA, datas, passageiros, ida/volta, seleção de companhias).
- Busca de voos via camada de serviço com normalização de resultados, heurística anti-duplicata e ordenações (BEST, CHEAPEST, FASTEST).
- Paginação client-side, exibição de detalhes padronizados e feedback de carregamento.
- Envio opcional ao n8n seguindo o contrato esperado pelo workflow.
- Logs descritivos em console para facilitar troubleshooting.

## 🧪 Testes

Executar testes unitários:

```bash
npm run test
```

Os testes cobrem utilitários de validação, normalização e ordenação de voos usando o `node:test` com um loader TypeScript.

## 🧾 Licença

Projeto interno Pontos e Milhas. Uso restrito às equipes autorizadas.
