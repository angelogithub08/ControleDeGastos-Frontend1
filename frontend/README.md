# 💰 Controle de Gastos - Frontend

Uma aplicação web completa para controle de gastos pessoais, construída com HTML, CSS e JavaScript vanilla, integrada com API FastAPI e utilizando Tailwind CSS para estilização.

## 🚀 Como usar

### Pré-requisitos

- Navegador web moderno
- Conexão com internet (para carregar o Tailwind CSS via CDN)
- **API Backend rodando em http://127.0.0.1:8000**

### Executando a aplicação

1. **Primeiro, inicie a API backend:**

   ```bash
   # Na pasta raiz do projeto
   cd ..
   source env/bin/activate  # ou env\Scripts\activate no Windows
   uvicorn main:app --reload
   ```

2. **Em seguida, sirva o frontend:**

   ```bash
   # Na pasta frontend
   cd frontend
   python -m http.server 8000

   # Acesse: http://localhost:8000
   ```

## 📋 Funcionalidades

### ✅ Implementadas

- **🔐 Sistema de Autenticação Completo**:

  - Login e registro de usuários
  - Autenticação JWT com token persistente
  - Proteção de rotas (requer login)
  - Logout seguro

- **📊 Dashboard em Tempo Real**:

  - Total de receitas e gastos
  - Saldo atual (receitas - gastos)
  - Contador de transações
  - Dados atualizados automaticamente

- **💸 Gerenciamento de Transações**:

  - Criar, editar e excluir transações
  - Classificação por tipo (receita/gasto)
  - Valores em Real brasileiro (R$)
  - Data e hora de criação

- **🏷️ Tipos de Transação Personalizáveis**:

  - Criar tipos customizados (ex: Salário, Alimentação)
  - Categorizar como receita ou gasto
  - Editar e excluir tipos existentes
  - Validação de integridade referencial

- **🔍 Sistema de Filtros**:

  - Filtrar por tipo específico de transação
  - Filtrar por categoria (receitas/gastos)
  - Limpar filtros rapidamente

- **🎨 Interface Moderna**:
  - Design responsivo para mobile e desktop
  - Animações suaves e feedback visual
  - Notificações de sucesso/erro
  - Loading states e overlays

### 🎨 Design

- **Tailwind CSS**: Framework CSS via CDN para estilização moderna
- **Interface limpa**: Design minimalista e profissional
- **Animações suaves**: Transições e efeitos visuais
- **Ícones SVG**: Ícones integrados para melhor UX
- **Tema claro**: Paleta de cores suave e moderna
- **Responsivo**: Adaptável a diferentes tamanhos de tela

## 📁 Estrutura de arquivos

```
frontend/
├── index.html      # Página principal com autenticação e app
├── styles.css      # Estilos personalizados e animações
├── api.js          # Serviço de comunicação com a API
├── script.js       # Lógica principal da aplicação
└── README.md       # Este arquivo
```

## 🔧 Tecnologias utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos personalizados e animações
- **JavaScript ES6+**: Lógica da aplicação e comunicação com API
- **Tailwind CSS**: Framework CSS via CDN
- **Fetch API**: Requisições HTTP para a API
- **LocalStorage**: Persistência do token de autenticação
- **SVG Icons**: Ícones vetoriais

## 🔗 Integração com API

A aplicação está totalmente integrada com a API FastAPI e utiliza todos os endpoints disponíveis:

### Autenticação

- `POST /auth/register` - Registro de usuários
- `POST /auth/login` - Login e obtenção de token JWT
- `GET /auth/me` - Informações do usuário logado

### Usuários

- `GET /users/{user_id}/balance` - Saldo do usuário
- `GET /users/{user_id}/transactions` - Transações do usuário
- `PUT /users/{user_id}` - Atualizar perfil do usuário

### Tipos de Transação

- `GET /transaction-types/` - Listar tipos
- `POST /transaction-types/` - Criar tipo
- `PUT /transaction-types/{id}` - Atualizar tipo
- `DELETE /transaction-types/{id}` - Excluir tipo

### Transações

- `GET /transactions/` - Listar transações do usuário
- `POST /transactions/` - Criar transação
- `PUT /transactions/{id}` - Atualizar transação
- `DELETE /transactions/{id}` - Excluir transação

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros para autenticação
- **Proteção de rotas**: Todas as operações requerem autenticação
- **Validação de propriedade**: Usuários só acessam seus próprios dados
- **Tratamento de erros**: Feedback adequado para erros de API
- **Logout automático**: Em caso de token inválido

## 💾 Persistência de Dados

- **Dados reais**: Todos os dados são persistidos no banco de dados via API
- **Token persistente**: Login mantido entre sessões
- **Sincronização**: Interface sempre atualizada com dados do servidor

## 🎯 Funcionalidades Avançadas

- **Filtros dinâmicos**: Filtragem em tempo real das transações
- **Cálculos automáticos**: Saldo e totais calculados automaticamente
- **Feedback visual**: Notificações, loading states e animações
- **Tratamento de erros**: Mensagens de erro amigáveis
- **Responsividade**: Interface adaptável a qualquer dispositivo

## 🚀 Próximos passos

Para expandir ainda mais a aplicação:

1. **Relatórios**: Gráficos e análises de gastos
2. **Exportação**: PDF, Excel, CSV
3. **PWA**: Transformar em Progressive Web App
4. **Notificações**: Push notifications
5. **Temas**: Modo escuro/claro
6. **Categorias avançadas**: Subcategorias e tags
7. **Metas**: Definir e acompanhar metas de gastos

## 🐛 Suporte

Esta é uma aplicação completa e funcional. Para melhorias futuras, considere:

- Testes automatizados (Jest, Cypress)
- Otimizações de performance
- Acessibilidade (WCAG)
- Internacionalização (i18n)
- Service Workers para offline

---

**Aplicação completa integrada com API FastAPI - Pronta para uso em produção!**
