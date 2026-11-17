# CATEMP

Plataforma web onde micro-empreendedoras criam e administram **suas próprias lojas online individuais**. Cada loja tem URL exclusiva, identidade própria e catálogo isolado. O cliente final acessa a loja de uma vendedora, navega pelo catálogo dela e envia uma solicitação de orçamento pelo WhatsApp.

> **O CATEMP não é um marketplace.** Não existe catálogo global, busca entre lojas ou vitrine que misture produtos de vendedoras diferentes. Cada loja é um espaço independente — como um site próprio da empreendedora, hospedado na plataforma.

## Stack

- **Front-end:** React · TypeScript · Vite · Tailwind CSS · React Router
- **Banco e auth:** Supabase (PostgreSQL · Auth · Storage · Edge Functions · RLS)
- **Hospedagem:** Vercel

## Requisitos

- Node.js 20.19+
- npm
- Supabase CLI
- Git

## Setup local

1. Instale as dependências:

```bash
npm install
```

2. Copie as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Preencha com os valores do Supabase local:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon-key-local>
```

3. Inicie o Supabase local:

```bash
supabase start
```

4. Aplique as migrations:

```bash
supabase db push
```

5. (Opcional) Sirva as Edge Functions localmente:

```bash
supabase functions serve
```

6. Rode a aplicação:

```bash
npm run dev
```

A chave anon pode ser obtida no terminal do `supabase start` ou no painel do Supabase Studio.

## Primeiro administrador

1. Crie um usuário no Supabase Studio (Authentication) com o e-mail `admin@catemp.local` (ou outro).
2. A migração `0014_admin_seed.sql` cria o perfil de admin para esse e-mail. Se usar outro, ajuste a migration ou insira manualmente:

```sql
insert into public.usuarios (id, nome, papel, situacao)
values ('<id-do-usuario-auth>', 'Administrador', 'admin', 'ativa')
on conflict (id) do update
set papel = 'admin', situacao = 'ativa';
```

## Como funciona

### Perfis de uso

| Perfil | O que faz | Login |
|---|---|---|
| **Cliente** | Acessa a loja via link, navega pelo catálogo, seleciona itens e envia orçamento pelo WhatsApp. | Não |
| **Vendedora** | Gerencia a própria loja: itens, fotos, categorias e temas. | E-mail + senha |
| **Admin** | Libera novas vendedoras gerando tokens de acesso. | E-mail + senha |

### Fluxo de criação de loja

1. A interessada pede um token ao admin (via WhatsApp, fora do sistema).
2. O admin gera o token em `/admin/tokens` e envia o código.
3. Em `/cadastro`, a pessoa usa o token + dados pessoais → conta e loja são criadas.
4. A loja fica pública em `/<slug-da-loja>`.

### Rotas

Toda rota pública pertence a uma loja. O slug é o primeiro segmento:

| Rota | Descrição |
|---|---|
| `/:slug` | Vitrine da loja (perfil, destaques, catálogo) |
| `/:slug/buscar` | Busca dentro da loja |
| `/:slug/item/:codigo` | Detalhe do item (fotos, temas, extras) |
| `/:slug/carrinho` | Carrinho da loja + envio WhatsApp |
| `/entrar` | Login da vendedora |
| `/cadastro` | Cadastro com token |
| `/painel/*` | Painel da vendedora (exige login) |
| `/admin/*` | Administração (exige admin) |

### Carrinho e WhatsApp

- O carrinho vive no navegador (`sessionStorage`), pertence a **uma única loja**.
- O envio gera um link `wa.me` com mensagem pré-preenchida para o WhatsApp da loja.
- **Nenhuma venda é confirmada pelo sistema.** Preço e disponibilidade são combinados direto no WhatsApp.

## Estrutura do projeto

```
catemp/
├── supabase/           # banco, edge functions e testes
│   ├── migrations/     # uma migração por assunto
│   ├── functions/      # gerar-token, cadastrar-vendedora, revogar-token
│   └── tests/
└── src/
    ├── app/            # router, providers, guards
    ├── lib/            # supabase client, whatsapp, slug, formatadores
    ├── schemas/        # validações Zod
    ├── services/       # acesso a dados (supabase-js e Edge Functions)
    ├── contexts/       # AuthContext, CarrinhoContext
    ├── hooks/          # useAuth, useCarrinho, useLojaDoUsuario, queries/
    ├── components/     # ui/, layout/, catalogo/, carrinho/, painel/, admin/
    └── pages/          # publicas/, painel/, admin/
```

## Testes

```bash
npm test
```

## Build

```bash
npm run build
```

## Documentação completa

Veja [docs/CATEMP_documentacao_tecnica.md](docs/CATEMP_documentacao_tecnica.md) para a documentação técnica completa: visão do projeto, banco de dados, permissões, rotas, carrinho, autenticação e fluxos.

## Observações

- O cadastro público do Auth fica **desligado**. Novas contas só com token.
- Dados pessoais e e-mails reais não devem entrar em migrations ou commits públicos.
- Cada ambiente local pode ter seu próprio admin, sem colidir com o repositório.
