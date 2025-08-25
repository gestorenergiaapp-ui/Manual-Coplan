# Manual de Diretrizes Online

Este é um manual online interativo para funcionários, detalhando as diretrizes administrativas e operacionais da empresa, com funcionalidades de busca e edição de conteúdo em tempo real.

## Arquitetura

A aplicação é uma Single Page Application (SPA) construída com React e TypeScript. O backend é servido por Netlify Functions, que se comunicam com um banco de dados MongoDB para persistência de dados. O armazenamento de imagens e logos é feito através do MongoDB GridFS.

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Netlify Functions (Node.js)
- **Banco de Dados**: MongoDB Atlas
- **Armazenamento de Arquivos**: MongoDB GridFS
- **Autenticação**: JWT (JSON Web Tokens) armazenados em cookies httpOnly.

## Como Executar Localmente

1.  **Clone o repositório.**
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto. Você precisará de duas variáveis:
    -   `MONGODB_URI`: Sua string de conexão completa do MongoDB Atlas, incluindo o nome do banco de dados. Ex: `mongodb+srv://user:pass@cluster.mongodb.net/meuBancoDeDados?retryWrites=true&w=majority`
    -   `JWT_SECRET`: Uma string longa e aleatória para assinar os tokens de autenticação. Você pode gerar uma usando `openssl rand -base64 32`.

    **Exemplo de `.env`:**
    ```
    MONGODB_URI="sua_string_de_conexao_com_nome_do_banco"
    JWT_SECRET="seu_segredo_super_secreto_gerado_aleatoriamente"
    ```
4.  **Crie o arquivo de configuração `netlify.toml`:**
    Crie um arquivo chamado `netlify.toml` na raiz do projeto e cole o conteúdo da seção abaixo nele. Este passo é **essencial** para que a aplicação funcione localmente.

5.  **Inicie o ambiente de desenvolvimento:**
    A CLI da Netlify irá iniciar o servidor Vite para o frontend e o servidor de funções para o backend simultaneamente.
    ```bash
    netlify dev
    ```
6.  Acesse a aplicação em `http://localhost:8888`. O usuário administrador padrão é `admin` com a senha `admin123`.

## Configuração do Netlify (`netlify.toml`)

Para que o ambiente de desenvolvimento local (`netlify dev`) e o deploy funcionem corretamente, é crucial ter um arquivo `netlify.toml` na raiz do projeto. Este arquivo instrui a Netlify sobre como construir o site e, mais importante, como rotear os pedidos.

**Copie e cole o conteúdo abaixo no seu arquivo `netlify.toml`:**

```toml
# Configurações de build
[build]
  command = "npm run build"      # Comando para buildar o projeto
  publish = "dist"               # Diretório de publicação (saída do Vite)
  functions = "netlify/functions"  # Diretório onde as funções serverless estão

# Regra de proxy para a API (deve vir primeiro)
# Direciona chamadas /api/* para a função serverless, corrigindo erros de comunicação.
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

# Regra de fallback para Single Page Application (SPA)
# Garante que o roteamento do React funcione ao recarregar a página, corrigindo a "tela branca".
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
- A seção `[build]` define os comandos e diretórios para o processo de build.
- A primeira regra `[[redirects]]` cria um proxy para a sua API serverless.
- A segunda regra `[[redirects]]` é o "fallback" que resolve o problema da "tela branca" e garante que o React Router funcione corretamente.

## Limpeza da Arquitetura

Como parte da evolução do projeto, foi realizada uma refatoração significativa para mover a lógica de negócio do frontend para o backend, resultando em uma arquitetura mais limpa, segura e escalável.

Os seguintes arquivos se tornaram obsoletos e foram esvaziados, podendo ser removidos do projeto com segurança:

-   `data/content.tsx`
-   `data/users.ts`
-   `context/AdminContext.tsx`
-   `hooks/useAdmin.ts`
-   `components/LoginModal.tsx`
-   `context/AIContext.tsx`
-   `hooks/useAI.ts`
-   `components/AIChatModal.tsx`