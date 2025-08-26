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

Para que o ambiente de desenvolvimento local (`netlify dev`) e o deploy funcionem corretamente, é **essencial** ter um arquivo `netlify.toml` na raiz do projeto. Este arquivo instrui a Netlify sobre como construir o site, como executar o servidor de desenvolvimento local e como rotear os pedidos.

O problema da "tela branca" que você está enfrentando ocorre porque a regra de redirecionamento `/*` para o `index.html` (necessária para o React Router em produção) está interferindo com o servidor de desenvolvimento do Vite, impedindo que ele sirva os arquivos JavaScript corretamente.

A configuração abaixo resolve isso adicionando uma seção `[dev]` que instrui o `netlify dev` a integrar-se corretamente com o Vite, além de manter as regras necessárias para o deploy em produção.

**Substitua o conteúdo do seu `netlify.toml` por este:**

```toml
# =============================================================================
# Netlify Configuration File
#
# Este arquivo é crucial para o desenvolvimento local e para o deploy.
# Ele configura o build, o servidor de desenvolvimento e as regras de
# redirecionamento da sua aplicação.
# =============================================================================

# Configurações de build para o deploy em produção
[build]
  command = "npm run build"      # Comando para buildar o projeto com Vite
  publish = "dist"               # Diretório de publicação (saída do Vite)
  functions = "netlify/functions"  # Diretório onde as funções serverless estão

# Configurações para o servidor de desenvolvimento local (netlify dev)
[dev]
  command = "vite"          # Comando para iniciar o servidor de desenvolvimento Vite
  targetPort = 5173         # Porta padrão em que o Vite é executado
  port = 8888               # Porta em que o `netlify dev` servirá o site
  publish = "dist"          # Necessário para o `netlify dev` encontrar assets estáticos
  autoLaunch = true         # Abre o navegador automaticamente

# --- Regras de Redirecionamento ---
# Estas regras funcionam tanto localmente quanto em produção.

# Regra de proxy para a API
# Direciona todas as chamadas de /api/* para a sua função 'api'.
# Isto é o que conserta os erros 404 nas chamadas de backend.
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

# Regra de fallback para a Single Page Application (SPA)
# Garante que o roteamento do React (React Router) funcione ao recarregar a
# página ou acessar uma URL diretamente, consertando o problema da "página não encontrada".
# Esta regra é a última a ser processada.
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- A seção `[dev]` garante que o `netlify dev` execute o Vite corretamente e saiba como encaminhar as solicitações para ele, resolvendo o problema da tela branca localmente.
- As regras `[[redirects]]` permanecem, pois são essenciais. A primeira lida com as chamadas de API e a segunda garante que seu aplicativo de página única (SPA) funcione corretamente em produção.

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