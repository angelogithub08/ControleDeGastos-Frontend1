// ==================== GERENCIAMENTO DE USUÁRIOS ====================

// Estado dos usuários
let currentUser = null;

// ==================== AUTENTICAÇÃO ====================

function switchAuthTab(tab) {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (tab === "login") {
    loginTab.classList.add("border-primary-500", "text-primary-600");
    loginTab.classList.remove("border-transparent", "text-gray-500");
    registerTab.classList.remove("border-primary-500", "text-primary-600");
    registerTab.classList.add("border-transparent", "text-gray-500");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    registerTab.classList.add("border-primary-500", "text-primary-600");
    registerTab.classList.remove("border-transparent", "text-gray-500");
    loginTab.classList.remove("border-primary-500", "text-primary-600");
    loginTab.classList.add("border-transparent", "text-gray-500");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  }

  hideAuthError();
}

async function handleLogin(e) {
  e.preventDefault();

  const loginForm = document.getElementById("loginForm");
  const formData = new FormData(loginForm);
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    showLoading(true);
    hideAuthError();

    await api.login(email, password);
    await loadUserData();
    showMainApp();

    showNotification("Login realizado com sucesso!");
  } catch (error) {
    showAuthError(error.message || "Erro ao fazer login");
  } finally {
    showLoading(false);
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const registerForm = document.getElementById("registerForm");
  const formData = new FormData(registerForm);
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    showLoading(true);
    hideAuthError();

    await api.register(name, email, password);

    // Após registro, fazer login automaticamente
    await api.login(email, password);
    await loadUserData();
    showMainApp();

    showNotification("Conta criada e login realizado com sucesso!");
  } catch (error) {
    showAuthError(error.message || "Erro ao criar conta");
  } finally {
    showLoading(false);
  }
}

function handleLogout() {
  if (confirm("Tem certeza que deseja sair?")) {
    api.logout();
    currentUser = null;
    showLoginScreen();
  }
}

function showAuthError(message) {
  const authError = document.getElementById("authError");
  const authErrorMessage = document.getElementById("authErrorMessage");

  authErrorMessage.textContent = message;
  authError.classList.remove("hidden");
}

function hideAuthError() {
  const authError = document.getElementById("authError");
  authError.classList.add("hidden");
}

// ==================== CARREGAMENTO DE DADOS DO USUÁRIO ====================

async function loadUserData() {
  try {
    showLoading(true);

    // Carregar dados do usuário atual
    currentUser = await api.getCurrentUser();

    // Carregar dados da aplicação
    await Promise.all([
      loadTransactionTypes(),
      loadTransactions(),
      loadBalance(),
    ]);

    updateUI();
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    throw error;
  } finally {
    showLoading(false);
  }
}

async function loadBalance() {
  if (!currentUser) return;

  try {
    const balanceData = await api.getUserBalance(currentUser.id);
    updateDashboard(balanceData);
  } catch (error) {
    console.error("Erro ao carregar saldo:", error);
  }
}

// ==================== ATUALIZAÇÃO DA UI ====================

function updateUserUI() {
  const userWelcome = document.getElementById("userWelcome");

  if (currentUser) {
    userWelcome.textContent = `Olá, ${currentUser.name}!`;
  }
}

// ==================== MODAL DE EDIÇÃO DO USUÁRIO ====================

function openUserModal() {
  const userModal = document.getElementById("userModal");
  const userId = document.getElementById("userId");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userPassword = document.getElementById("userPassword");
  const userPasswordConfirm = document.getElementById("userPasswordConfirm");

  if (!currentUser) {
    showNotification("Erro: usuário não encontrado", "error");
    return;
  }

  // Preencher formulário com dados atuais
  userId.value = currentUser.id;
  userName.value = currentUser.name;
  userEmail.value = currentUser.email;
  userPassword.value = "";
  userPasswordConfirm.value = "";

  userModal.classList.remove("hidden");
  userModal.classList.add("flex");
  userName.focus();
}

function closeUserModal() {
  const userModal = document.getElementById("userModal");
  const userForm = document.getElementById("userForm");

  userModal.classList.add("hidden");
  userModal.classList.remove("flex");
  userForm.reset();
}

async function handleUserSubmit(e) {
  e.preventDefault();

  const userForm = document.getElementById("userForm");
  const formData = new FormData(userForm);
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");

  // Validações
  if (!name || !email) {
    showNotification("Por favor, preencha nome e e-mail.", "error");
    return;
  }

  // Validar e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("Por favor, insira um e-mail válido.", "error");
    return;
  }

  // Se senha foi informada, validar confirmação
  if (password && password !== passwordConfirm) {
    showNotification("As senhas não coincidem.", "error");
    return;
  }

  // Validar tamanho da senha se informada
  if (password && password.length < 6) {
    showNotification("A senha deve ter pelo menos 6 caracteres.", "error");
    return;
  }

  try {
    showLoading(true);

    const userData = {
      name,
      email,
    };

    // Incluir senha apenas se foi informada
    if (password) {
      userData.password = password;
    }

    await api.updateUser(currentUser.id, userData);

    // Atualizar dados do usuário atual
    currentUser.name = name;
    currentUser.email = email;

    // Atualizar UI
    updateUserUI();

    showNotification("Perfil atualizado com sucesso!");
    closeUserModal();
  } catch (error) {
    handleApiError(error, "Erro ao atualizar perfil");
  } finally {
    showLoading(false);
  }
}

// ==================== NAVEGAÇÃO DE TELAS ====================

function showLoginScreen() {
  const loginScreen = document.getElementById("loginScreen");
  const mainApp = document.getElementById("mainApp");

  loginScreen.classList.remove("hidden");
  mainApp.classList.add("hidden");
}

function showMainApp() {
  const loginScreen = document.getElementById("loginScreen");
  const mainApp = document.getElementById("mainApp");

  loginScreen.classList.add("hidden");
  mainApp.classList.remove("hidden");
}

// ==================== INICIALIZAÇÃO ====================

function setupUserEventListeners() {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const editUserBtn = document.getElementById("editUserBtn");
  const cancelUserBtn = document.getElementById("cancelUserBtn");
  const userForm = document.getElementById("userForm");
  const userModal = document.getElementById("userModal");

  // Tabs de autenticação
  loginTab.addEventListener("click", () => switchAuthTab("login"));
  registerTab.addEventListener("click", () => switchAuthTab("register"));

  // Formulários de autenticação
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);

  // Botão de logout
  logoutBtn.addEventListener("click", handleLogout);

  // Modal de edição do usuário
  editUserBtn.addEventListener("click", openUserModal);
  cancelUserBtn.addEventListener("click", closeUserModal);
  userForm.addEventListener("submit", handleUserSubmit);

  // Fechar modal clicando fora
  userModal.addEventListener("click", (e) => {
    if (e.target === userModal) closeUserModal();
  });
}

// Expor funções globais necessárias
window.currentUser = currentUser;
window.loadUserData = loadUserData;
window.updateUserUI = updateUserUI;
window.showLoginScreen = showLoginScreen;
window.showMainApp = showMainApp;
window.setupUserEventListeners = setupUserEventListeners;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
