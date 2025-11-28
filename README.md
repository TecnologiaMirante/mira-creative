<div align="center">
  <h1>🎬 Sistema Mira Creative</h1>
  
  <p>
    <img src="https://img.shields.io/badge/status-active-success.svg" alt="Project Status">
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB" alt="React">
    <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
    <img src="https://img.shields.io/badge/firebase-%23039BE5.svg?style=flat&logo=firebase" alt="Firebase">
  </p>
</div>

O **Mira Creative** é uma plataforma corporativa robusta para **Orquestração de Produção Audiovisual**.
Desenvolvida para modernizar o fluxo de trabalho de emissoras e produtoras, a aplicação gerencia todo o ciclo editorial — desde a concepção de pautas até a exibição do roteiro — integrando inteligência artificial para otimização criativa.

---

## ✨ Funcionalidades Principais

### 📊 Dashboard & Analytics

Módulo de inteligência de dados com `Recharts` para visão estratégica em tempo real:

- **KPIs de Produção:** Total de pautas, taxa de aprovação e cancelamentos.
- **Análise de Fluxo:** Status das pautas (Aprovado, Em Produção, etc.).
- **Estrutura de Programação:** Comparativo entre programas de grade fixa e especiais.
- **Evolução Temporal:** Volume de criação diária.
- **Top Produtores:** Ranking de produtividade.

### 📝 Gestão Editorial

- **Arquitetura Relacional:** `Programas → Espelhos → Pautas → Roteiros` no Firestore.
- **Visualização Flexível:** Kanban/List views para roteiros.
- **Filtros Avançados:** Por produtor, apresentador, localidade e datas.
- **Cronograma Interativo:** Agenda de produção com `FullCalendar`.
- **Exportação para PDF:** Roteiros formatados para uso no set.

### 🤖 Inteligência Artificial Integrada

- **Copiloto Criativo (OpenAI GPT):** Sugere melhorias de texto e descrições técnicas.
- **Assistente “Daqui” (Gemini):** Chatbot contextualizado nos dados da plataforma via Cloud Functions.

### 🔐 Segurança & Performance

- **Autenticação Corporativa:** Acesso restrito ao domínio `@mirante.com.br`.
- **User Caching System:** Redução de consultas ao Firestore para perfis de usuário.
- **RBAC (Role-Based Access Control):** Permissões por perfil (Admin, Produtor, Editor).

---

## 🛠️ Stack Tecnológico

### Frontend

- **Framework:** React 18 + Vite
- **UI:** Tailwind CSS, Shadcn UI, Lucide React
- **Estado & Roteamento:** Context API, React Router DOM
- **Visualização de Dados:** Recharts, FullCalendar
- **Utilitários:** Date-fns, UUID

### Backend & Infraestrutura

- **Banco de Dados:** Google Firestore (NoSQL)
- **Autenticação:** Firebase Authentication
- **Serverless:** Firebase Cloud Functions (Node.js/Python)
- **Serviços de IA:** OpenAI SDK, Google Vertex AI (Gemini)

---

## 🚀 Instalação e Execução

### 📌 Pré-requisitos

- Node.js **v18+**
- NPM **ou** Yarn

### 📥 Passos para Execução

1.  **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/mira-creative.git
cd mira-creative
```

2.  **Instale as dependências:**

```bash
npm install
```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione as seguintes chaves:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."

# AI Services
VITE_API_KEY_OPENAI="..."
VITE_API_ORG_OPENAI="..."
```

4.  **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

👉 Acesse em: **[http://localhost:5173](http://localhost:5173)**

---

## 📂 Estrutura de Pastas

```bash
src/                     # Código fonte do Frontend
├── components/          # Componentes React reutilizáveis
│   ├── reports/         # Gráficos e widgets do dashboard (Recharts)
│   ├── pautas/          # Componentes relacionados a pautas
│   ├── ui/              # Componentes base da UI (Shadcn)
│   └── ...
├── context/             # Provedores de Context API
│   ├── AuthContext.jsx  # Gerencia autenticação e sessão do usuário
│   └── UserContext.jsx  # Cache de perfis de usuário
├── lib/                 # Funções utilitárias e configuração do Firebase
├── pages/               # Componentes de página (rotas)
└── main.jsx             # Ponto de entrada da aplicação React

functions/               # Código fonte do Backend (Cloud Functions)
```

---

## 📄 Licença

🚨 **Projeto proprietário – uso exclusivo interno.**
Todos os direitos reservados.

---

> Desenvolvido com 💙 pela equipe de Engenharia e Produto da **Mira Creative**.

```

```
