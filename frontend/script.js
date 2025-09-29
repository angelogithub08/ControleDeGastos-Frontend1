// ==================== CONTROLE DE GASTOS - SCRIPT PRINCIPAL ====================
// Este arquivo coordena a inicialização e integração dos módulos da aplicação

// ==================== UTILITÁRIOS GLOBAIS ====================

function formatLargeNumber(value) {
  const num = Math.abs(value);

  if (num >= 1000000000) {
    return (
      (value / 1000000000).toFixed(1).replace(/\.0$/, "").replace(".", ",") +
      "Bi"
    );
  }
  if (num >= 1000000) {
    return (
      (value / 1000000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + "Mi"
    );
  }
  if (num >= 1000) {
    return (
      (value / 1000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + "K"
    );
  }

  return value.toFixed(2).replace(".", ",");
}

function formatCurrencyWithAbbreviation(value, useAbbreviation = false) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  if (useAbbreviation && absValue >= 1000) {
    const formattedValue = formatLargeNumber(absValue);
    return `${isNegative ? "-" : ""}R$ ${formattedValue}`;
  }

  // Usar a função formatCurrency do api.js para formatação padrão
  return formatCurrency(value);
}

// ==================== ATUALIZAÇÃO DO DASHBOARD ====================

function updateDashboard(balanceData = null) {
  const totalIncome = document.getElementById("totalIncome");
  const totalExpenses = document.getElementById("totalExpenses");
  const balance = document.getElementById("balance");
  const transactionCount = document.getElementById("transactionCount");

  if (balanceData) {
    // Usar formatação com abreviações para valores grandes
    totalIncome.textContent = formatCurrencyWithAbbreviation(
      balanceData.total_income,
      true
    );
    totalExpenses.textContent = formatCurrencyWithAbbreviation(
      balanceData.total_expense,
      true
    );

    const balanceValue = parseFloat(balanceData.balance);
    balance.textContent = formatCurrencyWithAbbreviation(balanceValue, true);

    // Colorir saldo baseado no valor
    if (balanceValue > 0) {
      balance.className = "text-2xl font-semibold text-green-600";
    } else if (balanceValue < 0) {
      balance.className = "text-2xl font-semibold text-red-600";
    } else {
      balance.className = "text-2xl font-semibold text-gray-900";
    }
  }

  // Sempre mostrar o total de transações (não filtradas) com formatação
  const count = transactions.length;
  transactionCount.textContent =
    count >= 1000 ? formatLargeNumber(count) : count.toString();
}

// ==================== ATUALIZAÇÃO GERAL DA UI ====================

function updateUI() {
  updateUserUI();
  updateTransactionTypeSelects();
  // renderTransactions() será chamado por loadInitialPage() se necessário
}

// ==================== INICIALIZAÇÃO ====================

async function initApp() {
  console.log("Inicializando aplicação...");

  // Verificar se há token salvo
  if (api.isAuthenticated()) {
    try {
      await loadUserData();
      showMainApp();
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }

  setupEventListeners();
}

function setupEventListeners() {
  // Configurar event listeners de cada módulo
  setupUserEventListeners();
  setupTransactionTypesEventListeners();
  setupTransactionsEventListeners();

  // Event listeners globais
  setupGlobalEventListeners();
}

function setupGlobalEventListeners() {
  const transactionModal = document.getElementById("transactionModal");
  const typesModal = document.getElementById("typesModal");
  const userModal = document.getElementById("userModal");

  // Fechar modais com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!transactionModal.classList.contains("hidden"))
        closeTransactionModal();
      if (!typesModal.classList.contains("hidden")) closeTypesModal();
      if (!userModal.classList.contains("hidden")) closeUserModal();
    }
  });
}

// ==================== FUNÇÕES GLOBAIS EXPOSTAS ====================

// Expor funções que precisam ser acessíveis globalmente
window.updateDashboard = updateDashboard;
window.updateUI = updateUI;
window.formatLargeNumber = formatLargeNumber;
window.formatCurrencyWithAbbreviation = formatCurrencyWithAbbreviation;

// ==================== INICIALIZAÇÃO DA APLICAÇÃO ====================

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener("DOMContentLoaded", initApp);
