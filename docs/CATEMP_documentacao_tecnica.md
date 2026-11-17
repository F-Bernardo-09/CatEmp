# CATEMP — Documentação Técnica

## 1. Visão do projeto

O CATEMP é uma plataforma web onde micro-empreendedoras criam e administram **suas próprias lojas online individuais**. Cada loja tem identidade própria, URL exclusiva e catálogo isolado. O cliente final acessa a loja de uma vendedora específica, navega pelos produtos e serviços **daquela loja**, e envia uma solicitação de orçamento pelo WhatsApp.

O CATEMP **não é um marketplace**. Não existe catálogo global, busca entre lojas ou vitrine que misture produtos de vendedoras diferentes. Cada loja é um espaço independente — como se fosse um site próprio da empreendedora, hospedado dentro da plataforma CATEMP.

O piloto atende o negócio de Edmilsa Bezerra de Souza, que aluga e monta ornamentações para festas.

**Limite essencial:** o CATEMP organiza o pré-atendimento; não fecha vendas nem confirma reservas. Data, disponibilidade, orçamento, entrega, montagem e confirmação são tratados diretamente pelo WhatsApp. Nenhuma tela pode dar a entender que um pedido foi confirmado.

### 1.1 Modelo mental: loja individual, não marketplace

| Aspecto | ✅ CATEMP (correto) | ❌ Marketplace (errado) |
|---|---|---|
| Acesso inicial | Cliente entra direto na loja da vendedora via link | Cliente entra num catálogo geral com tudo misturado |
| Navegação | Tudo acontece dentro da loja (`/:slug/*`) | Produtos de várias lojas na mesma página |
| Busca | Busca dentro da loja da vendedora | Busca global mostrando resultados de todas as lojas |
| Categorias | Categorias da loja, criadas pela vendedora | Categorias globais misturando todas as lojas |
| Concorrência | O cliente não vê outras lojas enquanto navega | O cliente vê concorrentes ao lado |
| Carrinho | Itens de uma única loja | Itens de múltiplas lojas no mesmo carrinho |

### 1.2 Perfis de uso

- **Cliente:** acessa a loja de uma vendedora (via link direto), consulta o catálogo dela, seleciona itens e envia uma solicitação pelo WhatsApp. Não tem conta nem login.
- **Vendedora:** gerencia a própria loja (itens, fotos, categorias e temas). Entra com e-mail e senha.
- **Administrador:** libera novas vendedoras gerando tokens de acesso.

### 1.3 Como uma loja é criada

A criação de lojas é controlada pelo administrador:

1. A interessada envia uma mensagem ao WhatsApp do administrador (fora do sistema) pedindo acesso.
2. Se o administrador aprovar, gera o token em `/admin/tokens` e envia o código à pessoa.
3. Em `/cadastro`, a pessoa informa o token junto com seus dados (incluindo o slug da loja), e a conta e a loja são criadas.
4. A partir daí, a vendedora entra apenas com **e-mail e senha**.
5. A loja fica acessível publicamente em `/:slug`.

O token **não é uma senha**: é um código de uso único que apenas libera a criação da conta. A quantidade de lojas é decidida pelo administrador.

## 2. Decisões de escopo

- Catálogo público; cliente sem conta e sem login.
- Cada loja é acessada por uma URL exclusiva (`/:slug`). Toda a navegação pública acontece dentro do contexto da loja.
- Carrinho mantido no navegador, contextualizado por loja; sem tabela de carrinhos persistentes.
- Sem tabela de clientes, de pedidos ou de solicitações: nada do que o cliente envia é guardado no banco.
- Envio por link `wa.me` com mensagem pré-preenchida; sem API oficial do WhatsApp Business.
- **O carrinho pertence a uma única loja.** O cliente não mistura itens de lojas diferentes.
- **Não há agendamento nem datas bloqueadas.** Ao montar o carrinho, o cliente informa a data prevista do evento; ela não é salva e segue apenas na mensagem do WhatsApp.
- Uma loja por usuário. Uma conta por loja.
- URL compartilhável do carrinho incluída na primeira versão.
- Supabase Auth gerencia login, senha e sessão; cadastro público do Auth desativado.
- Cadastro de vendedoras exige token de uso único.
- Cada foto pertence a exatamente um tema; escolher a foto é escolher a variação visual.
- Imagens ficam no Supabase Storage; o banco guarda os caminhos no bucket.
- Sem limites de fotos, tamanho de arquivo ou destaques por enquanto.

## 3. Tecnologias e arquitetura

- **Front-end e estilos:** React, TypeScript, Vite e Tailwind CSS.
- **Rotas:** React Router.
- **Formulários e validação:** Zod (schemas em `schemas/`).
- **Banco:** Supabase / PostgreSQL.
- **Autenticação:** Supabase Auth.
- **Operações sensíveis:** Supabase Edge Functions (gerar token, cadastrar vendedora, revogar token).
- **Permissões de dados:** Row Level Security (RLS).
- **Imagens:** Supabase Storage (bucket `fotos`).
- **Hospedagem do front:** Vercel.

O navegador fala com o Supabase por duas portas: o cliente `supabase-js` para leituras e gravações comuns (sempre sujeitas ao RLS) e as Edge Functions para operações sensíveis. A chave `service_role` fica somente no servidor. O WhatsApp fica fora do sistema: o navegador apenas abre um link `wa.me` com a mensagem pronta.

**Segurança:** ocultar um botão no front-end não protege nada. Toda regra importante (quem gera token, quem edita qual loja) é garantida no servidor, por Edge Function ou RLS. Cada vendedora só acessa os dados da própria loja.

## 4. Rotas e navegação

O princípio fundamental: **toda rota pública pertence a uma loja**. O slug da loja é o primeiro segmento da URL.

### 4.1 Rotas públicas (contexto de loja)

| Rota | Descrição |
|---|---|
| `/:slug` | Vitrine da loja: banner, perfil, carrossel de destaques e catálogo da vendedora. |
| `/:slug/buscar` | Busca e filtros **dentro da loja**: modalidade, categoria e texto. |
| `/:slug/item/:codigo` | Detalhe do item: fotos, seletor de tema, preço, extras, adicionar ao carrinho. O parâmetro é o `codigo_publico`, não o UUID. |
| `/:slug/carrinho` | Carrinho da loja: revisar itens, data prevista, observações e enviar pelo WhatsApp. Aceita `?c=`. |

### 4.2 Rotas públicas (sem contexto de loja)

| Rota | Descrição |
|---|---|
| `/entrar` | Login da vendedora (e-mail e senha). |
| `/cadastro` | Cadastro de vendedora com token, em duas etapas (acesso e loja). |

### 4.3 Painel da vendedora (exige login)

| Rota | Descrição |
|---|---|
| `/painel` | Resumo e atalhos de gestão. Mostra o link público da loja. |
| `/painel/itens` | Lista de itens da loja. |
| `/painel/itens/novo` | Criar novo item. |
| `/painel/itens/:id` | Editar item existente. |
| `/painel/categorias` | Gerenciar categorias (por modalidade). |
| `/painel/temas` | Gerenciar temas visuais; não excluir temas usados por fotos. |
| `/painel/loja` | Editar perfil e contatos; mostra o link público. |

### 4.4 Admin (exige papel `admin`)

| Rota | Descrição |
|---|---|
| `/admin/tokens` | Gerar, consultar e revogar tokens. |

### 4.5 O que NÃO existe

- **`/` (home geral):** não existe uma landing page global mostrando todas as lojas ou produtos de todas as vendedoras. Se alguém acessar `/`, pode ver uma página institucional simples do CATEMP ou redirecionar — mas **nunca um catálogo de produtos**.
- **`/buscar` (busca global):** não existe busca que cruze lojas.
- **`/produto/:id` (item global):** não existe rota de item fora do contexto de uma loja.

### 4.6 Navegação dentro da loja

Quando o cliente está dentro de `/:slug`, o cabeçalho mostra:
- Nome e/ou logo da loja (não "CATEMP").
- Navegação contextual: busca dentro da loja, link para o carrinho da loja.
- Toda navegação de volta (breadcrumb, botão voltar) leva a páginas **dentro da mesma loja**.

## 5. Estrutura de pastas

Projeto único, com o front-end na raiz e a parte do Supabase em `supabase/`. Cada tabela tem a sua própria migração, em vez de um único script com todas as criações.

```
catemp/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── favicon.svg
│
├── docs/
│   └── CATEMP_documentacao_tecnica.md   # este arquivo
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_funcoes_auxiliares.sql
│   │   ├── 0002_usuarios.sql
│   │   ├── 0003_lojas.sql
│   │   ├── 0004_tokens_acesso.sql
│   │   ├── 0005_categorias.sql
│   │   ├── 0006_temas.sql
│   │   ├── 0007_itens.sql
│   │   ├── 0008_item_categorias.sql
│   │   ├── 0009_fotos.sql
│   │   ├── 0010_extras_servico.sql
│   │   ├── 0011_rls_politicas.sql
│   │   ├── 0012_storage_fotos.sql
│   │   ├── 0013_validacao_publicacao.sql
│   │   └── 0014_admin_seed.sql
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── cors.ts
│   │   │   ├── supabase-admin.ts
│   │   │   ├── hash.ts
│   │   │   └── respostas.ts
│   │   ├── gerar-token/
│   │   │   └── index.ts
│   │   ├── cadastrar-vendedora/
│   │   │   └── index.ts
│   │   └── revogar-token/
│   │       └── index.ts
│   └── tests/
│       └── rls_dois_usuarios.test.sql
│
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── config.ts
    │
    ├── app/
    │   ├── providers.tsx
    │   ├── router.tsx
    │   └── guards/
    │       ├── RotaProtegida.tsx
    │       └── RotaAdmin.tsx
    │
    ├── lib/
    │   ├── supabase.ts
    │   ├── whatsapp.ts
    │   ├── carrinhoUrl.ts
    │   ├── formatadores.ts
    │   └── slug.ts
    │
    ├── types/
    │   ├── database.ts
    │   └── carrinho.ts
    │
    ├── schemas/
    │   ├── cadastro.ts
    │   ├── loja.ts
    │   ├── item.ts
    │   ├── categoria.ts
    │   ├── tema.ts
    │   └── token.ts
    │
    ├── services/
    │   ├── auth.ts
    │   ├── lojas.ts
    │   ├── itens.ts
    │   ├── categorias.ts
    │   ├── temas.ts
    │   ├── fotos.ts
    │   ├── extras.ts
    │   ├── catalogo.ts
    │   └── tokens.ts
    │
    ├── contexts/
    │   ├── AuthContext.tsx
    │   └── CarrinhoContext.tsx
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useCarrinho.ts
    │   ├── useLojaDoUsuario.ts
    │   └── queries/
    │       ├── useItens.ts
    │       ├── useCatalogo.ts
    │       └── useTokens.ts
    │
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── catalogo/
    │   ├── carrinho/
    │   ├── painel/
    │   └── admin/
    │
    └── pages/
        ├── publicas/
        │   ├── LojaHome.tsx       # vitrine da loja (/:slug)
        │   ├── LojaBuscar.tsx     # busca dentro da loja (/:slug/buscar)
        │   ├── LojaDetalheItem.tsx # detalhe do item (/:slug/item/:codigo)
        │   ├── LojaCarrinho.tsx   # carrinho da loja (/:slug/carrinho)
        │   ├── Entrar.tsx
        │   └── Cadastro.tsx
        ├── painel/
        │   ├── PainelInicio.tsx
        │   ├── ItensLista.tsx
        │   ├── ItemForm.tsx
        │   ├── Categorias.tsx
        │   ├── Temas.tsx
        │   └── PerfilLoja.tsx
        ├── admin/
        │   └── Tokens.tsx
        └── NaoEncontrada.tsx
```

**Convenções:**

- Páginas só orquestram; a lógica de dados fica em `services/` e `hooks/queries/`.
- Nenhuma página fala direto com o `supabase-js`.
- Validações Zod ficam em `schemas/` e são reaproveitadas nos formulários.
- Chaves e segredos nunca entram em `src/`; só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env`.
- A `service_role` existe apenas como segredo das Edge Functions.

## 6. Banco de dados

Todas as tabelas ficam no schema `public`. Campos de situação usam `varchar` com `CHECK`. Todos os `id` são `uuid` gerados pelo banco (`gen_random_uuid()`), exceto em `usuarios`, onde o `id` é o do Auth.

UUIDs são identificadores internos e **não** aparecem na URL do carrinho. Para isso, itens, temas e extras têm um **código público curto** (`codigo_publico`).

### 6.1 Relações

```
usuarios 1──1 lojas
                │
        ┌───────┼───────┬──────────┐
        │       │       │          │
      itens  categorias temas   tokens_acesso
        │       │       │
        ├───────┘       │
   item_categorias      │
        │               │
      fotos ────────────┘
        │
   extras_servico
```

- Um usuário tem uma loja (1:1).
- Uma loja tem muitos itens, categorias e temas.
- Um item tem muitas fotos e muitos extras (extras só em serviços).
- Itens e categorias se relacionam N:N por `item_categorias`.
- Uma foto pertence a exatamente um tema (a variação visual).
- Tokens são emitidos por um administrador e, quando usados, ligam-se ao usuário criado.

### 6.2 `usuarios`

Perfil ligado ao Supabase Auth. E-mail e senha ficam em `auth.users`, nunca aqui.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid (PK) | ✅ | Mesmo `id` de `auth.users` (FK). |
| `nome` | varchar(120) | ✅ | Nome da pessoa. |
| `papel` | varchar(10) | ✅ | `admin` ou `vendedor` (padrão `vendedor`). Só o servidor altera. |
| `situacao` | varchar(10) | ✅ | `ativa` ou `suspensa` (padrão `ativa`). |
| `criado_em` | timestamptz | ✅ | Padrão `now()`. |
| `atualizado_em` | timestamptz | ✅ | Trigger automático. |

### 6.3 `lojas`

Perfil público e dados de contato. Uma por usuário.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid (PK) | ✅ | |
| `usuario_id` | uuid (FK → usuarios, UNIQUE) | ✅ | Uma loja por usuário. |
| `nome_comercial` | varchar(120) | ✅ | Nome exibido ao público. |
| `slug` | varchar(60) (UNIQUE) | ✅ | Usado na URL `/:slug`. Formato: `^[a-z0-9]+(-[a-z0-9]+)*$`. |
| `descricao` | text | | Apresentação da loja. |
| `logo_url` | text | | URL da logo no Storage. |
| `capa_url` | text | | URL da imagem de capa. |
| `email` | varchar(254) | | E-mail de contato. |
| `telefone` | varchar(20) | | Telefone de contato. |
| `whatsapp` | varchar(13) | ✅ | Somente dígitos, formato `^[0-9]{12,13}$`. Gera o link `wa.me`. |
| `bairro` | varchar(80) | | |
| `cidade` | varchar(80) | | |
| `estado` | char(2) | | |
| `situacao` | varchar(10) | ✅ | `pendente`, `ativa`, `suspensa` ou `encerrada` (padrão `ativa`). |
| `criado_em` | timestamptz | ✅ | |
| `atualizado_em` | timestamptz | ✅ | Trigger automático. |

### 6.4 `tokens_acesso`

Códigos que liberam a criação de contas de vendedora. Escrita somente pelas Edge Functions.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid (PK) | ✅ | |
| `token_hash` | char(64) (UNIQUE) | ✅ | SHA-256 do código. O código real nunca é guardado. |
| `criado_por` | uuid (FK → usuarios) | ✅ | Administrador que gerou. |
| `emitido_para` | varchar(120) | ✅ | Texto livre para o admin lembrar a quem enviou. |
| `expira_em` | timestamptz | ✅ | Validade. |
| `usado_em` | timestamptz | | Preenchido ao consumir. |
| `usado_por` | uuid (FK → usuarios) | | Usuário criado com o token. |
| `revogado_em` | timestamptz | | Preenchido se o admin cancelar. |
| `criado_em` | timestamptz | ✅ | |

A situação do token **não é uma coluna**, é calculada: *revogado* (`revogado_em` preenchido), *usado* (`usado_em` preenchido), *vencido* (`expira_em` no passado) ou *disponível* (nenhum dos anteriores).

Constraints: `expira_em > criado_em`; `usado_em` e `revogado_em` não podem ambos ser preenchidos.

### 6.5 `itens`

Produtos e serviços no mesmo cadastro, diferenciados por `tipo`.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid (PK) | ✅ | UNIQUE compostas com `(id, loja_id)` e `(id, loja_id, modalidade)`. |
| `codigo_publico` | varchar(8) (UNIQUE) | ✅ | Código curto gerado pelo banco. Usado na URL `/:slug/item/:codigo`. |
| `loja_id` | uuid (FK → lojas) | ✅ | Sempre vem do perfil autenticado, nunca de campo do formulário. |
| `tipo` | varchar(10) | ✅ | `produto` ou `servico`. |
| `modalidade` | varchar(7) | ✅ | `aluguel` ou `venda`. |
| `titulo` | varchar(120) | ✅ | Nome do item. |
| `descricao` | text | ✅ | Descrição completa. |
| `altura` | numeric(8,2) | ✅ | Deve ser > 0. |
| `largura` | numeric(8,2) | ✅ | Deve ser > 0. |
| `profundidade` | numeric(8,2) | ✅ | Deve ser > 0. |
| `preco_base` | numeric(10,2) | ✅ | ≥ 0. Preço fixo no produto; preço mínimo no serviço. |
| `preco_reposicao` | numeric(10,2) | ✅ | ≥ 0. Valor de reposição (relevante para aluguel). |
| `situacao` | varchar(15) | ✅ | `disponivel`, `manutencao` ou `oculto` (padrão `oculto`). |
| `em_destaque` | boolean | ✅ | Padrão `false`. Aparece no carrossel da loja. |
| `criado_em` | timestamptz | ✅ | |
| `atualizado_em` | timestamptz | ✅ | Trigger automático. |

Validação de publicação (trigger `0013`): para mudar para `disponivel`, o item precisa de título não-vazio, `preco_base > 0` e ao menos uma foto `principal`.

Só itens `disponivel` de lojas `ativa` aparecem no catálogo público.

### 6.6 `categorias`

Categorias criadas e reutilizadas por cada loja.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid (PK) | ✅ | UNIQUE compostas com `(id, loja_id)` e `(id, loja_id, modalidade)`. |
| `loja_id` | uuid (FK → lojas) | ✅ | |
| `modalidade` | varchar(7) | ✅ | `aluguel` ou `venda`. Adicionado pela migração 0008. |
| `nome` | varchar(60) | ✅ | |
| `slug` | varchar(60) | ✅ | UNIQUE por `(loja_id, modalidade, slug)`. |
| `situacao` | varchar(10) | ✅ | `ativa` ou `inativa` (padrão `ativa`). |

As categorias pertencem à loja. A busca dentro da loja filtra pelas categorias **daquela loja**.

### 6.7 `item_categorias`

Liga itens a categorias (N:N). FKs compostas com `loja_id` e `modalidade` impedem que um item receba categoria de outra loja ou modalidade diferente.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `item_id` | uuid | ✅ | PK composta `(item_id, categoria_id)`. |
| `loja_id` | uuid | ✅ | Garante mesma loja. |
| `modalidade` | varchar(7) | ✅ | Garante mesma modalidade. |
| `categoria_id` | uuid | ✅ | PK composta. |

### 6.8 `temas`

Variações visuais reutilizáveis por loja (ex.: Rústico, Floral, Vaquejada).

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid (PK) | ✅ | UNIQUE composta `(id, loja_id)`. |
| `codigo_publico` | varchar(8) (UNIQUE) | ✅ | Código curto para URL do carrinho. |
| `loja_id` | uuid (FK → lojas) | ✅ | |
| `nome` | varchar(60) | ✅ | UNIQUE por `(loja_id, nome)`. |
| `criado_em` | timestamptz | ✅ | |

Tema com fotos associadas não pode ser excluído (FK de `fotos` com `ON DELETE RESTRICT`).

### 6.9 `fotos`

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid (PK) | ✅ | |
| `item_id` | uuid | ✅ | FK composta `(item_id, loja_id)` → itens. `ON DELETE CASCADE`. |
| `loja_id` | uuid | ✅ | Garante item e tema da mesma loja. |
| `tema_id` | uuid | | FK composta `(tema_id, loja_id)` → temas. `ON DELETE RESTRICT`. |
| `caminho_storage` | text (UNIQUE) | ✅ | Caminho no bucket `fotos`. |
| `texto_alternativo` | varchar(255) | ✅ | Acessibilidade. |
| `posicao` | integer | ✅ | ≥ 0, UNIQUE por `(item_id, posicao)`. |
| `principal` | boolean | ✅ | Padrão `false`. Índice único parcial: só uma `principal` por item. |
| `criado_em` | timestamptz | ✅ | |

### 6.10 `extras_servico`

Adicionais de um serviço (ex.: "iluminação", "toalha de mesa").

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid (PK) | ✅ | |
| `codigo_publico` | varchar(8) (UNIQUE) | ✅ | Código curto para URL do carrinho. |
| `item_id` | uuid | ✅ | FK composta `(item_id, loja_id)` → itens. `ON DELETE CASCADE`. |
| `loja_id` | uuid | ✅ | |
| `nome` | varchar(120) | ✅ | |
| `preco_minimo` | numeric(10,2) | ✅ | ≥ 0. |
| `caminho_storage` | text | ✅ | Imagem do adicional no bucket. |
| `criado_em` | timestamptz | ✅ | |
| `atualizado_em` | timestamptz | ✅ | Trigger automático. |

Trigger `0013` valida que o `item_id` referenciado tem `tipo = 'servico'`.

### 6.11 O que de propósito não existe

- Tabelas de clientes, carrinhos, pedidos ou solicitações.
- Tabela de agenda ou datas bloqueadas.
- Tabela de busca (a busca usa queries sobre `itens` filtrados por `loja_id`).
- Tabelas de carrossel global ou catálogo geral (cada loja tem seu próprio carrossel de destaques, usando `em_destaque` em `itens`).

### 6.12 Integridade

- Categoria, tema, foto e extra pertencem à mesma loja/item: chaves estrangeiras compostas com `loja_id`.
- Extras só em serviços: trigger de validação `validar_item_de_servico_extra()`.
- Uma foto principal por item: índice único parcial.
- Sem categorias ou temas duplicados na loja: restrições `UNIQUE`.
- Preços e valores adicionais não negativos: `CHECK`.
- Códigos públicos únicos globalmente: `UNIQUE` + geração no banco com nova tentativa em caso de colisão.
- Excluir item remove fotos e extras em cascata. Excluir a foto remove o arquivo do Storage.

### 6.13 Códigos públicos

Servem para a URL do carrinho e rota de detalhe não carregarem UUIDs.

- Gerados pelo banco, com 5 caracteres de um alfabeto de 31 caracteres: maiúsculas e dígitos sem `0`, `O`, `1`, `I`, `L` (evita confusão visual). Isso dá ~28,6 milhões de combinações.
- O tamanho pode crescer no futuro sem alterar o formato da URL.
- Não revelam nome, preço nem loja.

## 7. Permissões (RLS)

RLS ativado em **todas** as tabelas. Sem política, ninguém acessa.

- **Visitante (anon):** lê `lojas` com `situacao = 'ativa'`; `itens` com `situacao = 'disponivel'` de loja ativa; e `fotos`, `extras_servico`, `item_categorias`, `categorias` e `temas` relacionados a itens disponíveis de lojas ativas.
- **Vendedora autenticada:** lê e escreve apenas linhas cujo `loja_id` seja o da própria loja. Em `lojas`, altera só a própria, sem mexer em `situacao`. Não altera o próprio `papel`.
- **Administrador:** lê `tokens_acesso` (apenas metadados, sem hash).
- **Ninguém no navegador:** escreve em `tokens_acesso` ou altera `usuarios.papel`.

Funções auxiliares de RLS:
- `usuario_e_admin()` — verifica se o usuário autenticado é admin ativo.
- `usuario_e_dono_da_loja(p_loja_id)` — verifica se o usuário autenticado é dono da loja informada.

## 8. Storage (fotos)

- Bucket público para leitura (`fotos`), com escrita restrita a usuários autenticados.
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`.
- Limite de arquivo: 50 MB.
- Caminho dos arquivos: `{loja_id}/{item_id}/{uuid}.extensão`.
- Política de escrita: o usuário só grava em pastas cujo primeiro segmento seja o `loja_id` da própria loja.
- Sem compressão automática nesta versão.

## 9. Carrinho, URL e WhatsApp

O carrinho vive no navegador (React Context persistido em `sessionStorage`). Nada é gravado no banco. **O carrinho é contextualizado por loja** — o cliente não mistura itens de lojas diferentes.

### 9.1 URL compartilhável

A URL reconstrói a seleção sem expor UUIDs, nomes, preços ou descrições:

`/:slug/carrinho?c={selecao}`

A URL está dentro do contexto da loja (`:slug`), porque os itens são todos de uma única loja.

Formato:
- Campos do item separados por `.`: `item.quantidade.tema.extras`
- Extras separados por `;`, quantidade do extra após `x` (omitida quando for 1).
- Itens separados por `_`.

Exemplo:

`/ornamentacoes-edmilsa/carrinho?c=K4P2.2.T7.A1x2;A3_M8Q1.1.T2`

- `K4P2.2.T7.A1x2;A3`: item `K4P2`, quantidade 2, tema `T7`, extra `A1` (quantidade 2) e extra `A3`.
- `M8Q1.1.T2`: item `M8Q1`, quantidade 1, tema `T2`, sem extras.

### 9.2 Regras do carrinho

- A URL inclui somente códigos, quantidades, temas e extras. Data desejada e observações ficam no navegador e vão na mensagem, não na URL.
- Ao abrir a URL, consultar os dados atuais e validar existência, publicação, loja ativa, tema do item e associação dos extras. Itens que não pertençam à loja do `:slug` são ignorados.
- Recalcular os valores com dados atuais; nunca confiar em preços vindos da URL.
- Avisar se um item estiver indisponível ou se o preço tiver mudado.
- Itens ou extras inválidos são ignorados com aviso, sem quebrar o carrinho.
- Para itens do tipo serviço, o carrinho oferece o campo de **data prevista do evento**. A data não é salva em lugar nenhum.
- Texto visível: "Isto não é uma reserva. A disponibilidade e o valor final são combinados com a loja."
- O carrinho não é esvaziado ao enviar; há botão "Limpar carrinho".

### 9.3 Envio por WhatsApp

Como o carrinho é de **uma única loja**, a mensagem vai para **um único número** (o WhatsApp da loja). Um botão "Enviar pelo WhatsApp" gera o link `wa.me`.

A mensagem inclui data prevista, itens, temas, extras, quantidades, valores de referência e observações, deixando claro que preço e disponibilidade serão confirmados pela loja.

Exemplo:

```
Olá! Vim pelo CATEMP e gostaria de um orçamento.

Data prevista do evento: 15/11/2026

Itens:
1) Painel redondo (Tema: Rústico) - 1x - ref. R$ 120,00
2) Montagem de mesa de bolo (Tema: Floral) - 1x
   Extras: Iluminação (+ R$ 40,00)
   - ref. R$ 190,00

Valor de referência total: R$ 310,00
(valores de referência, sujeitos a negociação)

Observações: Evento ao ar livre.
```

Geração do link:

```ts
// lib/whatsapp.ts
export function linkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
```

## 10. Autenticação e tokens

### 10.1 Gerar token (`gerar-token`)

Somente administrador ativo e autenticado. Entrada: `emitido_para` e `validade_dias` (padrão 7).

1. Ler a sessão; sem sessão, responder 401.
2. Conferir em `usuarios` se `papel = 'admin'` e `situacao = 'ativa'`; senão, 403.
3. Gerar código aleatório (ex.: `CATEMP-` + 10 caracteres hexadecimais).
4. Calcular o hash SHA-256 e gravar só o hash, com `criado_por`, `emitido_para` e `expira_em`.
5. Devolver o código real uma única vez.

### 10.2 Cadastrar vendedora (`cadastrar-vendedora`)

Chamada sem login, pela tela de cadastro.

1. Validar todos os campos com Zod (e-mail, senha ≥ 8 caracteres, slug, WhatsApp só dígitos).
2. Calcular o hash do código informado.
3. Consumir o token de forma atômica (`usado_em` nulo, `revogado_em` nulo, `expira_em` no futuro).
4. Verificar se o `slug` já existe; se existir, devolver o token ao estado anterior e pedir outro slug.
5. Criar o usuário no Auth pela API de administração.
6. Inserir o perfil em `usuarios` (papel `vendedor`) e a loja em `lojas` (situação `ativa`).
7. Preencher `tokens_acesso.usado_por`.
8. Se qualquer passo falhar, desfazer tudo (apagar o usuário criado e devolver o token) e responder com erro genérico.

### 10.3 Revogar token (`revogar-token`)

Preenche `revogado_em` em tokens ainda não usados.

### 10.4 Primeiro administrador

Criar o usuário no painel do Supabase (Authentication) e inserir manualmente a linha em `usuarios` com `papel = 'admin'` e o mesmo `id`. A migração `0014_admin_seed.sql` faz isso para o e-mail `admin@catemp.local`.

## 11. Services e dados (camada de acesso)

### 11.1 Leituras públicas (`catalogo.ts`)

As funções de leitura pública **sempre recebem `loja_id` ou `slug` como parâmetro obrigatório**. Nunca buscam itens de todas as lojas.

- `listarItensCatalogo(lojaId, filtros)` — lista itens `disponivel` **da loja informada**, com filtros de modalidade, categoria e texto.
- `listarCategoriasPublicas(lojaId, modalidade)` — lista categorias ativas **da loja informada**.
- `buscarItemPublico(codigo)` — busca um item pelo `codigo_publico`. Valida que a loja está ativa.

### 11.2 Gestão da vendedora (`itens.ts`, `categorias.ts`, `temas.ts`, `fotos.ts`, `extras.ts`)

Essas funções resolvem o `loja_id` automaticamente a partir do usuário autenticado. A vendedora opera somente sobre a própria loja.

### 11.3 Loja (`lojas.ts`)

- `buscarLojaPorSlug(slug)` — retorna a loja pelo slug (usado nas rotas públicas).
- `obterLojaDoUsuario()` — retorna a loja do usuário logado (usado no painel).
- `salvarLojaDoUsuario(dados)` — atualiza os dados da loja do usuário logado.

## 12. Componentes de layout

### 12.1 Cabeçalho da loja (`CabecalhoLoja`)

Usado em todas as páginas públicas dentro de `/:slug/*`. Mostra:
- Nome e/ou logo da loja.
- Navegação: busca (dentro da loja), carrinho (da loja).
- **Não** mostra "CATEMP" como marca principal — o protagonista é a loja.

### 12.2 Rodapé

Pode conter "Loja criada com CATEMP" como crédito discreto.

### 12.3 Layout do painel (`LayoutPainel`)

Menu lateral com links para itens, categorias, temas, perfil e link público da loja.

## 13. Configuração, implementação e testes

### 13.1 Configuração

- Desativar o cadastro público do Supabase Auth.
- Ativar RLS e criar políticas para todas as tabelas.
- Criar o bucket de fotos e suas políticas.
- Guardar `SUPABASE_SERVICE_ROLE_KEY` somente nas Edge Functions.
- No front-end, usar apenas a URL do projeto e a chave `anon`.
- Manter segredos fora do repositório (`.env` fora do Git).

### 13.2 Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 13.3 Ordem sugerida para a correção

1. **Rotas:** reestruturar `router.tsx` para colocar todas as rotas públicas sob `/:slug/*`.
2. **Service `catalogo.ts`:** adicionar `loja_id` como parâmetro obrigatório em `listarItensCatalogo` e `listarCategoriasPublicas`.
3. **Páginas públicas:** refatorar para receber `slug` da URL, resolver a loja, e passar `loja_id` para os services.
4. **Cabeçalho:** criar `CabecalhoLoja` com contexto da loja (nome, logo, navegação interna).
5. **Carrinho:** implementar contextualizado por loja.
6. **WhatsApp:** implementar geração da mensagem e link.

### 13.4 Testes mínimos

- Vendedora A não consegue ler nem alterar dados da loja B.
- Usuário sem papel de admin não gera token, inclusive chamando a função diretamente.
- Token é aceito uma única vez, mesmo com dois cadastros simultâneos.
- Cadastro público do Auth está desativado.
- Itens `oculto`/`manutencao` e lojas inativas não aparecem publicamente.
- A rota `/:slug/buscar` só mostra itens da loja do slug.
- A rota `/:slug/item/:codigo` só mostra itens que pertençam àquela loja.
- Carrinho pertence a uma única loja; itens de outra loja são rejeitados.
- URL compartilhada valida itens, temas e extras e atualiza preços.
- Data prevista aparece na mensagem e não é salva.
- Telas principais funcionam em celulares pequenos.

## 14. Glossário

| Termo | Definição |
|---|---|
| **Slug** | Identificador legível da loja na URL (ex.: `ornamentacoes-edmilsa`). |
| **Token de acesso** | Código de uso único, com validade, que libera a criação de uma conta. Não é senha. |
| **Hash** | Versão irreversível do token; guarda-se o hash, nunca o código real. |
| **Código público** | Código curto de item, tema ou extra, usado na URL do carrinho. |
| **RLS** | Regras do banco que limitam quais linhas cada usuário pode ver ou alterar. |
| **Edge Function** | Código no servidor do Supabase para operações sensíveis. |
| **Valor de referência** | Preço mínimo + extras; serve como base de negociação, não como valor final. |
| **Tema** | Variação visual de um item; cada foto pertence a um tema. |
| **Loja** | Espaço individual da vendedora. Não é um "vendedor dentro de um marketplace". |
