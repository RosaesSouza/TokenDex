// ======================
// AUTH SERVICE (LOCALSTORAGE)
// ======================

const USER_KEY = "tokendex_user";

// Salvar usuário logado
export function saveLoggedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Obter usuário logado
export function getLoggedUser() {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
}

// Verificar login
export function isLogged() {
  return localStorage.getItem(USER_KEY) !== null;
}

// Logout
export function logout() {
  localStorage.removeItem(USER_KEY);
}
