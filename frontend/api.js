// Serviço de comunicação com a API
class ApiService {
  constructor() {
    this.baseURL = "http://127.0.0.1:8000";
    this.token = localStorage.getItem("access_token");
  }

  // Configurar token de autenticação
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  // Obter headers padrão
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Se não autorizado, verificar se é login ou operação autenticada
      if (response.status === 401) {
        // Se for endpoint de login, não fazer reload - deixar o erro ser tratado
        if (endpoint === "/auth/login") {
          const data = await response.json();
          const error = new Error(data.detail || "Credenciais inválidas");
          error.status = response.status;
          error.statusText = response.statusText;
          error.data = data;
          throw error;
        } else {
          // Para outras operações, limpar token e redirecionar para login
          this.setToken(null);
          window.location.reload();
          return null;
        }
      }

      // Se não há conteúdo (204), retornar sucesso
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();

      if (!response.ok) {
        // Criar erro com informações detalhadas
        const error = new Error(
          data.detail || `HTTP error! status: ${response.status}`
        );
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== AUTENTICAÇÃO ====================

  async login(email, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });

    if (response && response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async register(name, email, password) {
    return await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      auth: false,
    });
  }

  async getCurrentUser() {
    return await this.request("/auth/me");
  }

  logout() {
    this.setToken(null);
    window.location.reload();
  }

  // ==================== USUÁRIOS ====================

  async getUsers(skip = 0, limit = 100) {
    return await this.request(`/users/?skip=${skip}&limit=${limit}`);
  }

  async getUser(userId) {
    return await this.request(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return await this.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return await this.request(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getUserTransactions(userId, skip = 0, limit = 100) {
    return await this.request(
      `/users/${userId}/transactions?skip=${skip}&limit=${limit}`
    );
  }

  async getUserBalance(userId) {
    return await this.request(`/users/${userId}/balance`);
  }

  // ==================== TIPOS DE TRANSAÇÃO ====================

  async getTransactionTypes(skip = 0, limit = 100) {
    return await this.request(
      `/transaction-types/?skip=${skip}&limit=${limit}`
    );
  }

  async getTransactionType(typeId) {
    return await this.request(`/transaction-types/${typeId}`);
  }

  async createTransactionType(typeData) {
    return await this.request("/transaction-types/", {
      method: "POST",
      body: JSON.stringify(typeData),
    });
  }

  async updateTransactionType(typeId, typeData) {
    return await this.request(`/transaction-types/${typeId}`, {
      method: "PUT",
      body: JSON.stringify(typeData),
    });
  }

  async deleteTransactionType(typeId) {
    return await this.request(`/transaction-types/${typeId}`, {
      method: "DELETE",
    });
  }

  // ==================== TRANSAÇÕES ====================

  async getTransactions(skip = 0, limit = 100, transactionTypeId = null) {
    let url = `/transactions/?skip=${skip}&limit=${limit}`;
    if (transactionTypeId) {
      url += `&transaction_type_id=${transactionTypeId}`;
    }
    return await this.request(url);
  }

  async getTransaction(transactionId) {
    return await this.request(`/transactions/${transactionId}`);
  }

  async createTransaction(transactionData) {
    return await this.request("/transactions/", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(transactionId, transactionData) {
    return await this.request(`/transactions/${transactionId}`, {
      method: "PUT",
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(transactionId) {
    return await this.request(`/transactions/${transactionId}`, {
      method: "DELETE",
    });
  }

  // ==================== UTILITÁRIOS ====================

  isAuthenticated() {
    return !!this.token;
  }

  // Método para testar conectividade com a API
  async testConnection() {
    try {
      const response = await this.request("/");
      return response;
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
      return null;
    }
  }
}

// Instância global do serviço de API
const api = new ApiService();

// Utilitários para formatação
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDateOnly = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Função para mostrar notificações
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  let bgColor, duration;

  switch (type) {
    case "success":
      bgColor = "bg-green-500";
      duration = 4000;
      break;
    case "error":
      bgColor = "bg-red-500";
      duration = 6000; // Erros ficam mais tempo
      break;
    case "warning":
      bgColor = "bg-yellow-500";
      duration = 8000; // Avisos ficam ainda mais tempo
      break;
    case "info":
      bgColor = "bg-blue-500";
      duration = 4000;
      break;
    default:
      bgColor = "bg-gray-500";
      duration = 4000;
  }

  notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in max-w-md`;
  notification.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200 flex-shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  // Remover automaticamente após o tempo especificado
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add("opacity-0");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, duration);
}

// Função para mostrar/ocultar loading overlay
function showLoading(show = true) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    if (show) {
      overlay.classList.remove("hidden");
      overlay.classList.add("flex");
    } else {
      overlay.classList.add("hidden");
      overlay.classList.remove("flex");
    }
  }
}

// Função para lidar com erros da API
function handleApiError(error, defaultMessage = "Ocorreu um erro inesperado") {
  console.error("API Error:", error);

  let message = defaultMessage;
  let type = "error";

  // Verificar se é um erro da API com status específico
  if (error.status) {
    switch (error.status) {
      case 400:
        message = error.message || "Dados inválidos fornecidos";
        break;
      case 401:
        message = "Não autorizado. Faça login novamente";
        break;
      case 403:
        message = error.message || "Acesso negado";
        break;
      case 404:
        message = error.message || "Recurso não encontrado";
        break;
      case 409:
        // Conflito - geralmente integridade referencial
        message = error.message || "Operação não permitida devido a conflito";
        type = "warning";
        break;
      case 422:
        message = error.message || "Dados de entrada inválidos";
        break;
      case 500:
        message = "Erro interno do servidor. Tente novamente mais tarde";
        break;
      default:
        message = error.message || defaultMessage;
    }
  } else if (error.message) {
    message = error.message;
  }

  showNotification(message, type);
}

// Exportar para uso global
window.api = api;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateOnly = formatDateOnly;
window.showNotification = showNotification;
window.showLoading = showLoading;
window.handleApiError = handleApiError;
