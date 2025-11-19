# Mira Creative

Mira Creative é uma plataforma web robusta para gerenciamento de roteiros e produção audiovisual, desenvolvida com React e Vite, utilizando Firebase como backend e integrada com APIs de Inteligência Artificial para otimizar o fluxo de trabalho criativo.

## ✨ Funcionalidades Principais

- **Autenticação Robusta**: Acesso seguro e exclusivo para contas `@mirante.com.br` via Google. A sessão do usuário é verificada de forma inteligente no carregamento, proporcionando uma experiência de login fluida e sem "piscar" a tela.
- **Dashboard de Roteiros**: Interface central com visualização em cards para criar, visualizar, filtrar, editar e excluir roteiros.
- **Gerenciamento de Permissões**: Sistema de papéis (Administrador, Produtor, etc.) que controla o acesso a funcionalidades como edição e exclusão.
- **Filtros Avançados**: Ferramentas poderosas para encontrar roteiros por status, produtor, apresentador, programa e localidade.
- **Cronograma de Produção**: Calendário interativo (`FullCalendar`) que exibe as datas de gravação e exibição. Inclui tooltips ricos em informações ao passar o mouse sobre os eventos e filtros dinâmicos.
- **Exportação para PDF**: Geração de documentos PDF profissionais e detalhados a partir dos roteiros, incluindo a logo da empresa.

### 🤖 Recursos de Inteligência Artificial

- **Aprimoramento de Roteiros com IA**: Ferramenta integrada à API da OpenAI (`GPT`) que analisa o roteiro existente e sugere melhorias para o texto e para as descrições de vídeo, linha por linha.
- **Assistente de Chat "Daqui"**: Chatbot integrado à API do Google Gemini (via `Firebase Cloud Function`) que responde a perguntas sobre os roteiros cadastrados, agindo como um especialista nos dados da plataforma.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Vite, Tailwind CSS
- **Componentes UI**: Shadcn UI
- **Roteamento**: React Router DOM
- **Gerenciamento de Estado**: React Context API
- **Backend & Infra**: Firebase (Authentication, Firestore, Cloud Functions)
- **Inteligência Artificial**:
  - **Google Gemini AI** (via Cloud Functions para Q&A)
  - **OpenAI GPT** (via cliente para aprimoramento de roteiros)
- **Linguagem**: JavaScript

## 🚀 Como Executar o Projeto Localmente

Para executar o projeto em seu ambiente de desenvolvimento, siga os passos abaixo.

### Pré-requisitos

- **Node.js**: Versão 18 ou superior.
- **Firebase CLI**: Necessário para testar as Cloud Functions localmente.

### Instalação

1.  **Clone o repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd mira-creative
    ```

2.  **Instale as dependências do projeto:**

    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione as chaves de configuração do seu projeto Firebase. Você pode encontrá-las no console do Firebase em `Configurações do projeto > Suas apps > Configuração do SDK`.
    Adicione também as chaves para a API da OpenAI.

    ```env
    # Firebase
    VITE_FIREBASE_API_KEY="SUA_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="SEU_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="SEU_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="SEU_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="SEU_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="SEU_APP_ID"

    # OpenAI
    VITE_API_KEY_OPENAI="SUA_CHAVE_DE_API_DA_OPENAI"
    VITE_API_ORG_OPENAI="SEU_ID_DE_ORGANIZACAO_DA_OPENAI"
    VITE_API_PROJECT_OPENAI="SEU_ID_DE_PROJETO_DA_OPENAI"
    ```

4.  **Execute o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:5173`.

## 📂 Estrutura do Projeto

```
├── src/
│   ├── components/
│   │   ├── Card/         # Formulários e visualização de roteiros
│   │   ├── Dashboard/    # Dashboard, filtros, estatísticas
│   │   ├── AiChat/       # Assistente de IA
│   │   ├── AppSidebar/   # Barra lateral de navegação
│   │   └── ui/           # Componentes reutilizáveis (Button, Card, etc)
│   ├── context/          # Contexto de usuário
│   ├── functions/        # Funções utilitárias
│   ├── hooks/            # Hooks customizados
│   ├── lib/              # Utilidades (ex: cn)
│   ├── pages/            # Páginas principais (Home, Login)
│   └── assets/           # Imagens e outros recursos estáticos
└── functions/            # Código das Firebase Cloud Functions
```
