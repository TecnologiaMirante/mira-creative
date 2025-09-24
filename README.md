# Mira Creative

Mira Creative é uma plataforma web para gerenciamento de roteiros e produção audiovisual, desenvolvida com React e Vite, utilizando Firebase como backend.

## ✨ Funcionalidades Principais

- **Autenticação Google Restrita**: Acesso seguro e exclusivo para contas `@mirante.com.br`.
- **Dashboard de Roteiros**: Interface central para visualizar, filtrar, editar, excluir e criar novos roteiros.
- **Filtros Avançados**: Ferramentas para encontrar roteiros por status, produtor, apresentador, cidade e bairro.
- **Exportação para PDF**: Geração de documentos PDF detalhados a partir dos roteiros.
- **Assistente de IA "Daqui"**: Chatbot integrado com a API do Google Gemini para responder dúvidas sobre os roteiros cadastrados.
- **Gerenciamento de Equipe**: Funcionalidades para gerenciar equipes e cronogramas de produção.
- **Interface Responsiva**: Layout adaptado para desktop e dispositivos móveis.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Vite, Tailwind CSS
- **Componentes UI**: Shadcn UI
- **Backend & Infra**: Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **Inteligência Artificial**: Google Gemini AI
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

    ```env
    VITE_FIREBASE_API_KEY="SUA_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="SEU_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="SEU_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="SEU_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="SEU_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="SEU_APP_ID"
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
