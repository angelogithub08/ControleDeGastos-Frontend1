// ==================== GERENCIAMENTO DE TRANSAÇÕES ====================


let transactions = [];
let filteredTransactions = [];


let currentPage = 0;
let itemsPerPage = 10;
let displayedTransactions = [];
let hasMoreTransactions = true;

// ==================== CARREGAMENTO DE DADOS ====================

async function loadTransactions(reset = true) {
  try {
    if (reset) {
     
      currentPage = 0;
      displayedTransactions = [];
      hasMoreTransactions = true;
    }

    transactions = await api.getTransactions(0, 1000);
    filteredTransactions = [...transactions];

    if (reset) {
      loadInitialPage();
    }

   
    updateDashboard();
  } catch (error) {
    console.error("Erro ao carregar transações:", error);
    transactions = [];
    filteredTransactions = [];
    displayedTransactions = [];
    hasMoreTransactions = false;
   
    updateDashboard();
    renderTransactions();
  }
}

// ==================== PAGINAÇÃO ====================

function loadInitialPage() {
  currentPage = 0;
  displayedTransactions = [];
  loadNextPage();
}

function loadNextPage() {
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const nextPageItems = filteredTransactions.slice(startIndex, endIndex);

  if (nextPageItems.length > 0) {
    displayedTransactions = [...displayedTransactions, ...nextPageItems];
    currentPage++;
    hasMoreTransactions = endIndex < filteredTransactions.length;
  } else {
    hasMoreTransactions = false;
  }

  renderTransactions();
}

// ==================== RENDERIZAÇÃO ====================

function renderTransactions() {
  const transactionsList = document.getElementById("transactionsList");

  if (filteredTransactions.length === 0) {
    transactionsList.innerHTML = `
      <div class="text-center py-8 text-gray-500 empty-state">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
        <p class="mt-2">Nenhuma transação encontrada</p>
        <p class="text-sm">Clique em "Nova Transação" para começar</p>
      </div>
    `;
    return;
  }

  const transactionsHTML = displayedTransactions
    .map((transaction) => {
      const isIncome = transaction.transaction_type_type === "INCOME";
      const valueClass = isIncome ? "text-green-600" : "text-red-600";
      const valuePrefix = isIncome ? "+" : "-";
      const bgClass = isIncome
        ? "bg-green-50 border-green-200"
        : "bg-red-50 border-red-200";

      return `
      <div class="transaction-item ${bgClass} rounded-lg p-4 border fade-in">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <h3 class="text-sm font-medium text-gray-900">${
                transaction.transaction_type_name
              }</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isIncome
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }">
                ${isIncome ? "Receita" : "Despesa"}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">${formatDate(
              transaction.created_at
            )}</p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-lg font-semibold ${valueClass}">${valuePrefix}${formatCurrency(
        transaction.value,
        false
      )}</span>
            <div class="flex space-x-1">
              <button onclick="editTransaction(${
                transaction.id
              })" class="text-gray-400 hover:text-blue-500 transition-colors" title="Editar transação">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button onclick="deleteTransaction(${
                transaction.id
              })" class="text-gray-400 hover:text-red-500 transition-colors" title="Excluir transação">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  
  const loadMoreButton = hasMoreTransactions
    ? `
    <div class="text-center py-6">
      <button 
        id="loadMoreBtn" 
        onclick="loadNextPage()" 
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Carregar Mais (${
          filteredTransactions.length - displayedTransactions.length
        } restantes)
      </button>
    </div>
  `
    : "";

  transactionsList.innerHTML = transactionsHTML + loadMoreButton;
}

// ==================== FILTROS ====================

function applyFilters() {
  const filterType = document.getElementById("filterType");
  const filterCategory = document.getElementById("filterCategory");

  const typeFilter = filterType.value;
  const categoryFilter = filterCategory.value;

  filteredTransactions = transactions.filter((transaction) => {
    let matchesType = true;
    let matchesCategory = true;

    if (typeFilter) {
      matchesType = transaction.transaction_type_id.toString() === typeFilter;
    }

    if (categoryFilter) {
      matchesCategory = transaction.transaction_type_type === categoryFilter;
    }

    return matchesType && matchesCategory;
  });

 
  loadInitialPage();
  updateDashboard();
}

function clearAllFilters() {
  const filterType = document.getElementById("filterType");
  const filterCategory = document.getElementById("filterCategory");

  filterType.value = "";
  filterCategory.value = "";
 
  updateFilterTypeSelect();
  filteredTransactions = [...transactions];
 
  loadInitialPage();
  updateDashboard();
}

// ==================== MODAL DE TRANSAÇÃO ====================

function openTransactionModal(transaction = null) {
  const transactionModal = document.getElementById("transactionModal");
  const transactionModalTitle = document.getElementById(
    "transactionModalTitle"
  );
  const transactionForm = document.getElementById("transactionForm");
  const transactionId = document.getElementById("transactionId");
  const transactionTypeFilter = document.getElementById(
    "transactionTypeFilter"
  );
  const transactionTypeId = document.getElementById("transactionTypeId");
  const transactionValue = document.getElementById("transactionValue");
  const saveTransactionBtn = document.getElementById("saveTransactionBtn");

  
  if (!transactionTypes || transactionTypes.length === 0) {
    console.warn("Tipos de transação não carregados. Carregando...");
    loadTransactionTypes().then(() => {
      
      openTransactionModal(transaction);
    });
    return;
  }

  if (transaction) {
   
    transactionModalTitle.textContent = "Editar Transação";
    transactionId.value = transaction.id;

    
    const transactionType = transactionTypes.find(
      (t) => t.id === transaction.transaction_type_id
    );
    if (transactionType) {
      transactionTypeFilter.value = transactionType.type;
      updateModalTransactionTypeSelect();
    }

    transactionTypeId.value = transaction.transaction_type_id;
    transactionValue.value = formatCurrencyInput(
      (transaction.value * 100).toString()
    );
    saveTransactionBtn.textContent = "Atualizar";
  } else {
    transactionModalTitle.textContent = "Nova Transação";
    transactionForm.reset();
    transactionId.value = "";
    transactionTypeFilter.value = "";
    updateModalTransactionTypeSelect();
    saveTransactionBtn.textContent = "Salvar";
  }

  transactionModal.classList.remove("hidden");
  transactionModal.classList.add("flex");
  transactionTypeFilter.focus();
}

function closeTransactionModal() {
  const transactionModal = document.getElementById("transactionModal");
  const transactionForm = document.getElementById("transactionForm");

  transactionModal.classList.add("hidden");
  transactionModal.classList.remove("flex");
  transactionForm.reset();
}

async function handleTransactionSubmit(e) {
  e.preventDefault();

  const transactionForm = document.getElementById("transactionForm");
  const formData = new FormData(transactionForm);
  const id = formData.get("id");
  const transaction_type_id = parseInt(formData.get("transaction_type_id"));
  const value = parseCurrencyInput(formData.get("value"));

  if (!transaction_type_id || !value || value <= 0) {
    showNotification(
      "Por favor, preencha todos os campos corretamente.",
      "error"
    );
    return;
  }

  try {
    showLoading(true);

    const transactionData = {
      user_id: currentUser.id,
      transaction_type_id,
      value,
    };

    if (id) {
     
      await api.updateTransaction(parseInt(id), transactionData);
      showNotification("Transação atualizada com sucesso!");
    } else {
     
      await api.createTransaction(transactionData);
      showNotification("Transação criada com sucesso!");
    }

 
    await Promise.all([loadTransactions(), loadBalance()]);

    closeTransactionModal();
  } catch (error) {
    handleApiError(error, "Erro ao salvar transação");
  } finally {
    showLoading(false);
  }
}


window.editTransaction = async function (id) {
  try {
    const transaction = await api.getTransaction(id);
    openTransactionModal(transaction);
  } catch (error) {
    handleApiError(error, "Erro ao carregar transação");
  }
};


window.deleteTransaction = async function (id) {
  if (!confirm("Tem certeza que deseja excluir esta transação?")) {
    return;
  }

  try {
    showLoading(true);

    await api.deleteTransaction(id);
    showNotification("Transação excluída com sucesso!");

   
    await Promise.all([loadTransactions(), loadBalance()]);
  } catch (error) {
    handleApiError(error, "Erro ao excluir transação");
  } finally {
    showLoading(false);
  }
};

// ==================== MÁSCARA MONETÁRIA ====================

function formatCurrencyInput(value) {
 
  let numbers = value.replace(/\D/g, "");

  
  if (!numbers) return "";

 
  let amount = parseInt(numbers) / 100;


  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(amount);
}

function parseCurrencyInput(value) {
 
  let numbers = value.replace(/\D/g, "");

 
  if (!numbers) return 0;

  
  return parseInt(numbers) / 100;
}

function applyCurrencyMask(input) {
  input.addEventListener("input", function (e) {
    const cursorPosition = e.target.selectionStart;
    const oldValue = e.target.value;
    const newValue = formatCurrencyInput(oldValue);

    e.target.value = newValue;

  
    const newCursorPosition =
      cursorPosition + (newValue.length - oldValue.length);
    e.target.setSelectionRange(newCursorPosition, newCursorPosition);
  });

  input.addEventListener("focus", function (e) {
   
    if (!e.target.value) {
      e.target.value = "R$ 0,00";
    }
  });

  input.addEventListener("blur", function (e) {
   
    if (e.target.value === "R$ 0,00") {
      e.target.value = "";
    }
  });
}

// ==================== EVENT LISTENERS ====================

function setupTransactionsEventListeners() {
  const addTransactionBtn = document.getElementById("addTransactionBtn");
  const cancelTransactionBtn = document.getElementById("cancelTransactionBtn");
  const transactionForm = document.getElementById("transactionForm");
  const transactionModal = document.getElementById("transactionModal");
  const transactionValue = document.getElementById("transactionValue");
  const filterType = document.getElementById("filterType");
  const clearFilters = document.getElementById("clearFilters");

  
  addTransactionBtn.addEventListener("click", () => openTransactionModal());

 
  cancelTransactionBtn.addEventListener("click", closeTransactionModal);
  transactionForm.addEventListener("submit", handleTransactionSubmit);

  
  applyCurrencyMask(transactionValue);

  
  filterType.addEventListener("change", applyFilters);
  clearFilters.addEventListener("click", clearAllFilters);

 
  transactionModal.addEventListener("click", (e) => {
    if (e.target === transactionModal) closeTransactionModal();
  });
}


window.transactions = transactions;
window.filteredTransactions = filteredTransactions;
window.displayedTransactions = displayedTransactions;
window.loadTransactions = loadTransactions;
window.loadNextPage = loadNextPage;
window.renderTransactions = renderTransactions;
window.applyFilters = applyFilters;
window.clearAllFilters = clearAllFilters;
window.openTransactionModal = openTransactionModal;
window.closeTransactionModal = closeTransactionModal;
window.setupTransactionsEventListeners = setupTransactionsEventListeners;
