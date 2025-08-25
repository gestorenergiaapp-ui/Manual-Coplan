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
    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`. Preencha com suas credenciais do MongoDB e um segredo para o JWT.
    ```
    MONGODB_URI="sua_string_de_conexao_mongodb"
    DB_NAME="nome_do_seu_banco_de_dados"
    JWT_SECRET="seu_segredo_super_secreto_para_jwt"
    ```
4.  **Inicie o ambiente de desenvolvimento:**
    A CLI da Netlify irá iniciar o servidor Vite para o frontend e o servidor de funções para o backend simultaneamente.
    ```bash
    netlify dev
    ```
5.  Acesse a aplicação em `http://localhost:8888`.

## Limpeza da Arquitetura

Como parte da evolução do projeto, foi realizada uma refatoração significativa para mover a lógica de negócio do frontend para o backend, resultando em uma arquitetura mais limpa, segura e escalável.

Os seguintes arquivos se tornaram obsoletos e foram esvaziados, podendo ser removidos do projeto com segurança:

-   `data/content.tsx`: O conteúdo inicial agora é semeado diretamente no banco de dados.
-   `data/users.ts`: Os dados de usuários agora são gerenciados no banco de dados.
-   `context/AdminContext.tsx`: Não utilizado.
-   `hooks/useAdmin.ts`: Não utilizado.
-   `components/LoginModal.tsx`: Não utilizado.
-   `context/AIContext.tsx`: Não utilizado.
-   `hooks/useAI.ts`: Não utilizado.
-   `components/AIChatModal.tsx`: Não utilizado.
