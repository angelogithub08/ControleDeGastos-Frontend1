// ==================== GERENCIAMENTO DE TIPOS DE TRANSAÇÃO ====================

let transactionTypes = [];

// ==================== CARREGAMENTO DE DADOS ====================

async function loadTransactionTypes() {
  try {
    transactionTypes = await api.getTransactionTypes(0, 1000);
    updateTransactionTypeSelects();
  } catch (error) {
    console.error("Erro ao carregar tipos de transação:", error);
    transactionTypes = [];
  }
}

// ==================== ATUALIZAÇÃO DA UI ====================

function updateTransactionTypeSelects() {
  // Verificar se transactionTypes está definido e é um array
  if (!transactionTypes || !Array.isArray(transactionTypes)) {
    console.warn("transactionTypes não está definido ou não é um array");
    return;
  }

  
  const sortedTypes = [...transactionTypes].sort((a, b) =>
    a.name.localeCompare(b.name)
  );


  updateModalTransactionTypeSelect(sortedTypes);


  updateFilterTypeSelect(sortedTypes);
}

function updateFilterTypeSelect(sortedTypes = null) {
  const filterType = document.getElementById("filterType");
  const filterCategory = document.getElementById("filterCategory");

  const types =
    sortedTypes ||
    [...transactionTypes].sort((a, b) => a.name.localeCompare(b.name));
  const selectedCategory = filterCategory.value;


  filterType.innerHTML = '<option value="">Todas as categorias</option>';


  const filteredTypes = selectedCategory
    ? types.filter((type) => type.type === selectedCategory)
    : types;

  filteredTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = type.name;
    filterType.appendChild(option);
  });
}

function updateModalTransactionTypeSelect(sortedTypes = null) {
  const transactionTypeId = document.getElementById("transactionTypeId");
  const transactionTypeFilter = document.getElementById(
    "transactionTypeFilter"
  );

  try {
   
    if (
      !transactionTypes ||
      !Array.isArray(transactionTypes) ||
      transactionTypes.length === 0
    ) {
    
      if (transactionTypeId) {
        transactionTypeId.innerHTML =
          '<option value="">Selecione uma categoria</option>';
      }
      return;
    }

 
    let types = [];
    if (sortedTypes && Array.isArray(sortedTypes) && sortedTypes.length > 0) {
      types = sortedTypes;
    } else {
    
      types = transactionTypes.slice().sort((a, b) => {
        if (a && b && a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
    }

   
    if (!Array.isArray(types) || types.length === 0) {
      if (transactionTypeId) {
        transactionTypeId.innerHTML =
          '<option value="">Selecione uma categoria</option>';
      }
      return;
    }

    const selectedFilter =
      transactionTypeFilter && transactionTypeFilter.value
        ? transactionTypeFilter.value
        : "";


    if (transactionTypeId) {
      transactionTypeId.innerHTML =
        '<option value="">Selecione uma categoria</option>';
    }

   
    const filteredTypes = selectedFilter
      ? types.filter((type) => type && type.type === selectedFilter)
      : types;

  
    if (filteredTypes && Array.isArray(filteredTypes)) {
      filteredTypes.forEach((type) => {
        if (type && type.id && type.name && transactionTypeId) {
          const option = document.createElement("option");
          option.value = type.id;
          option.textContent = type.name;
          transactionTypeId.appendChild(option);
        }
      });
    }
  } catch (error) {
    console.error("Erro em updateModalTransactionTypeSelect:", error);
   
    if (transactionTypeId) {
      transactionTypeId.innerHTML =
        '<option value="">Selecione uma categoria</option>';
    }
  }
}

// ==================== MODAL DE TIPOS ====================

function openTypesModal() {
  const typesModal = document.getElementById("typesModal");

  typesModal.classList.remove("hidden");
  typesModal.classList.add("flex");
  loadTypesInModal();
}

function closeTypesModal() {
  const typesModal = document.getElementById("typesModal");
  const typeForm = document.getElementById("typeForm");
  const typeId = document.getElementById("typeId");
  const typeFormSubmitText = document.getElementById("typeFormSubmitText");

  typesModal.classList.add("hidden");
  typesModal.classList.remove("flex");
  typeForm.reset();
  typeId.value = "";
  typeFormSubmitText.textContent = "Adicionar";
}

async function loadTypesInModal() {
  try {
    const types = await api.getTransactionTypes(0, 1000);
    renderTypesList(types);
  } catch (error) {
    handleApiError(error, "Erro ao carregar tipos");
  }
}

function renderTypesList(types) {
  const incomeTypesList = document.getElementById("incomeTypesList");
  const expenseTypesList = document.getElementById("expenseTypesList");

  if (types.length === 0) {
    incomeTypesList.innerHTML =
      '<p class="text-gray-500 text-center py-4 text-sm">Nenhuma receita cadastrada</p>';
    expenseTypesList.innerHTML =
      '<p class="text-gray-500 text-center py-4 text-sm">Nenhuma despesa cadastrada</p>';
    return;
  }

 
  const incomeTypes = types.filter((type) => type.type === "INCOME");
  const expenseTypes = types.filter((type) => type.type === "EXPENSE");

 
  if (incomeTypes.length === 0) {
    incomeTypesList.innerHTML =
      '<p class="text-gray-500 text-center py-4 text-sm">Nenhuma receita cadastrada</p>';
  } else {
    const incomeHTML = incomeTypes
      .map((type) => createTypeItemHTML(type))
      .join("");
    incomeTypesList.innerHTML = incomeHTML;
  }


  if (expenseTypes.length === 0) {
    expenseTypesList.innerHTML =
      '<p class="text-gray-500 text-center py-4 text-sm">Nenhuma despesa cadastrada</p>';
  } else {
    const expenseHTML = expenseTypes
      .map((type) => createTypeItemHTML(type))
      .join("");
    expenseTypesList.innerHTML = expenseHTML;
  }
}

function createTypeItemHTML(type) {
  return `
    <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div class="flex items-center space-x-3">
        <span class="font-medium text-gray-900">${type.name}</span>
      </div>
      <div class="flex space-x-2">
        <button onclick="editType(${type.id})" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Editar
        </button>
        <button onclick="deleteType(${type.id})" class="text-red-600 hover:text-red-800 text-sm font-medium">
          Excluir
        </button>
      </div>
    </div>
  `;
}

async function handleTypeSubmit(e) {
  e.preventDefault();

  const typeForm = document.getElementById("typeForm");
  const typeId = document.getElementById("typeId");
  const typeFormSubmitText = document.getElementById("typeFormSubmitText");

  const formData = new FormData(typeForm);
  const id = formData.get("id");
  const name = formData.get("name").trim();
  const type = formData.get("type");

  if (!name || !type) {
    showNotification("Por favor, preencha todos os campos.", "error");
    return;
  }

  try {
    showLoading(true);

    const typeData = { name, type };

    if (id) {
     
      await api.updateTransactionType(parseInt(id), typeData);
      showNotification("Tipo atualizado com sucesso!");
    } else {
     
      await api.createTransactionType(typeData);
      showNotification("Tipo criado com sucesso!");
    }

   
    await loadTransactionTypes();
    await loadTypesInModal();

  
    typeForm.reset();
    typeId.value = "";
    typeFormSubmitText.textContent = "Adicionar";
  } catch (error) {
    handleApiError(error, "Erro ao salvar tipo");
  } finally {
    showLoading(false);
  }
}


window.editType = async function (id) {
  const typeId = document.getElementById("typeId");
  const typeName = document.getElementById("typeName");
  const typeCategory = document.getElementById("typeCategory");
  const typeFormSubmitText = document.getElementById("typeFormSubmitText");

  try {
    const type = await api.getTransactionType(id);

    typeId.value = type.id;
    typeName.value = type.name;
    typeCategory.value = type.type;
    typeFormSubmitText.textContent = "Atualizar";
  } catch (error) {
    handleApiError(error, "Erro ao carregar tipo");
  }
};


window.deleteType = async function (id) {
  // Encontrar o tipo para mostrar o nome na confirmação
  const type = transactionTypes.find((t) => t.id === id);
  const typeName = type ? type.name : "este tipo";

  if (
    !confirm(
      `Tem certeza que deseja excluir o tipo "${typeName}"?\n\nATENÇÃO: Se existirem transações usando este tipo, a exclusão será impedida.`
    )
  ) {
    return;
  }

  try {
    showLoading(true);

    await api.deleteTransactionType(id);
    showNotification("Tipo excluído com sucesso!");

    // Recarregar dados
    await loadTransactionTypes();
    await loadTypesInModal();
    await loadTransactions();
  } catch (error) {
    handleApiError(error, "Erro ao excluir tipo");
  } finally {
    showLoading(false);
  }
};

// ==================== EVENT LISTENERS ====================

function setupTransactionTypesEventListeners() {
  const manageTypesBtn = document.getElementById("manageTypesBtn");
  const closeTypesBtn = document.getElementById("closeTypesBtn");
  const typeForm = document.getElementById("typeForm");
  const typesModal = document.getElementById("typesModal");
  const transactionTypeFilter = document.getElementById(
    "transactionTypeFilter"
  );
  const filterCategory = document.getElementById("filterCategory");

  
  manageTypesBtn.addEventListener("click", openTypesModal);

 
  closeTypesBtn.addEventListener("click", closeTypesModal);
  typeForm.addEventListener("submit", handleTypeSubmit);

 
  typesModal.addEventListener("click", (e) => {
    if (e.target === typesModal) closeTypesModal();
  });

 
  transactionTypeFilter.addEventListener("change", function () {
   
    if (transactionTypes && transactionTypes.length > 0) {
      updateModalTransactionTypeSelect();
    } else {
      console.warn("Tentativa de filtrar tipos antes do carregamento");
      
      const transactionTypeId = document.getElementById("transactionTypeId");
      transactionTypeId.innerHTML =
        '<option value="">Selecione uma categoria</option>';
    }
  });

  
  filterCategory.addEventListener("change", function () {
    
    updateFilterTypeSelect();
   
    applyFilters();
  });
}


window.transactionTypes = transactionTypes;
window.loadTransactionTypes = loadTransactionTypes;
window.updateTransactionTypeSelects = updateTransactionTypeSelects;
window.updateFilterTypeSelect = updateFilterTypeSelect;
window.updateModalTransactionTypeSelect = updateModalTransactionTypeSelect;
window.openTypesModal = openTypesModal;
window.closeTypesModal = closeTypesModal;
window.setupTransactionTypesEventListeners =
  setupTransactionTypesEventListeners;
