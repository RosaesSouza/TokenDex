const MOCK_USER = {
  email: 'admin@example.com',
  password: '123456',
  name: 'Admin',
}

export function login(email, password) {
  if (email === MOCK_USER.email && password === MOCK_USER.password) {
    localStorage.setItem('user', JSON.stringify(MOCK_USER))
    return MOCK_USER
  }
  return null
}

export function getUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function logout() {
  localStorage.removeItem('user')
}
