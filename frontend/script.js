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

  return formatCurrency(value);
}

// ==================== ATUALIZAÇÃO DO DASHBOARD ====================

function updateDashboard(balanceData = null) {
  const totalIncome = document.getElementById("totalIncome");
  const totalExpenses = document.getElementById("totalExpenses");
  const balance = document.getElementById("balance");
  const transactionCount = document.getElementById("transactionCount");

  if (balanceData) {
    
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

   
    if (balanceValue > 0) {
      balance.className = "text-2xl font-semibold text-green-600";
    } else if (balanceValue < 0) {
      balance.className = "text-2xl font-semibold text-red-600";
    } else {
      balance.className = "text-2xl font-semibold text-gray-900";
    }
  }

  
  const count = transactions.length;
  transactionCount.textContent =
    count >= 1000 ? formatLargeNumber(count) : count.toString();
}

// ==================== ATUALIZAÇÃO GERAL DA UI ====================

function updateUI() {
  updateUserUI();
  updateTransactionTypeSelects();

}

// ==================== INICIALIZAÇÃO ====================

async function initApp() {
  console.log("Inicializando aplicação...");


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

  setupUserEventListeners();
  setupTransactionTypesEventListeners();
  setupTransactionsEventListeners();

 
  setupGlobalEventListeners();
}

function setupGlobalEventListeners() {
  const transactionModal = document.getElementById("transactionModal");
  const typesModal = document.getElementById("typesModal");
  const userModal = document.getElementById("userModal");

 
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


window.updateDashboard = updateDashboard;
window.updateUI = updateUI;
window.formatLargeNumber = formatLargeNumber;
window.formatCurrencyWithAbbreviation = formatCurrencyWithAbbreviation;

// ==================== INICIALIZAÇÃO DA APLICAÇÃO ====================

document.addEventListener("DOMContentLoaded", initApp);
