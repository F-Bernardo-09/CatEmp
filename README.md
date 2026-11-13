# CatEmp

Aplicação para gestão de acervo, catálogo e pedidos de aluguel/venda.

## Requisitos

- Node.js 20+
- npm
- Supabase CLI
- Git

## Setup local

1. Instale dependências:

```bash
npm install
```

2. Inicie o Supabase local:

```bash
supabase start
```

3. Aplique as migrations:

```bash
supabase db push
```

4. Se quiser servir as Edge Functions localmente:

```bash
supabase functions serve
```

5. Rode a aplicação:

```bash
npm run dev -- --host 0.0.0.0
```

6. Configure as variáveis de ambiente do frontend com os valores locais do Supabase:

```bash
cp .env.example .env.local
```

Arquivo esperado:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon-key-local>
```

A chave anon pode ser obtida no terminal do `supabase start` ou no painel local do Supabase Studio.

## Teste do fluxo básico

### 1) Criar usuário admin

- Acesse o Supabase Studio.
- Crie um usuário em Authentication.
- Atualize o perfil na tabela `public.usuarios` com `papel = 'admin'`.

Exemplo SQL:

```sql
insert into public.usuarios (id, nome, papel, situacao)
values (
  '<id-do-usuario-auth>',
  'Administrador',
  'admin',
  'ativa'
)
on conflict (id) do update
set nome = excluded.nome,
    papel = 'admin',
    situacao = 'ativa';
```

### 2) Login

- Acesse `/entrar`.
- Faça login com o usuário admin.
- Verifique se o guard de rota redireciona corretamente para `/painel`.

### 3) Gerar token de acesso

- Acesse `/admin/tokens`.
- Gere um token para um destinatário fictício.
- Confirme que a resposta retorna `token` e `expira_em`.
- Verifique que o hash fica no banco e nunca o token em texto puro.

### 4) Cadastro de loja e categorias

- Entre no painel.
- Cadastre a loja com slug e WhatsApp válidos.
- Crie categorias e temas.
- Confirme que o slug é validado e que o campo de WhatsApp rejeita letras.

### 5) Cadastro de item

- Vá em `/painel/itens`.
- Crie um item com todos os campos obrigatórios:
  - nome
  - modalidade
  - categoria
  - foto principal
  - descrição
  - dimensões
  - valor base
  - valor de reposição
- Tente salvar sem dados obrigatórios e confirme a validação.

### 6) Verificação final

- A página pública `/buscar` deve listar itens válidos.
- O detalhe do item deve renderizar imagem, descrição e valor.
- O orçamento deve abrir o WhatsApp com mensagem pré-formatada.

## Validação de build

Antes de fechar qualquer entrega, rode:

```bash
npm run build
```

Se o comando sair com código 0, a aplicação compila corretamente.

## Observações importantes

- O cadastro público do Auth deve ficar desligado no ambiente compartilhado, conforme a configuração do Supabase.
- Dados pessoais e e-mails reais não devem entrar em migrações ou commits públicos.
- Cada ambiente local pode ter seu próprio admin inicial, sem colidir com o repositório.
