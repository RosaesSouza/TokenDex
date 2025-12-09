import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import logo from '../assets/logo.png'
import { useWallet } from '../context/WalletContext'   // IMPORTANTE

function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  const calcCheckDigit = (cpfSlice) => {
    let sum = 0
    for (let i = 0; i < cpfSlice.length; i++) {
      sum += parseInt(cpfSlice[i]) * (cpfSlice.length + 1 - i)
    }
    let rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  const digit1 = calcCheckDigit(cpf.slice(0, 9))
  const digit2 = calcCheckDigit(cpf.slice(0, 9) + digit1)
  return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10])
}

function Toast({ message, type = "error", onClose }) {
  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white z-50
        ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
    >
      {message}
      <button
        onClick={onClose}
        className="ml-2 font-bold hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  )
}

export default function Register() {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  // ⚡ PEGANDO A WALLET DO CONTEXT
  const { wallet, connectMetaMask } = useWallet()

  const showToast = (message, type = "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const registerUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          dob,
          cpf,
          email,
          wallet,       // 🟢 agora vem da MetaMask real!
          password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        showToast(result.error || "Erro ao registrar!", "error")
        return
      }

      showToast("Registro concluído com sucesso!", "success")
      setTimeout(() => navigate("/login"), 500)

    } catch (err) {
      showToast("Erro ao conectar ao servidor!", "error")
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showToast('As senhas não coincidem!', 'error')
      return
    }

    if (!validateCPF(cpf)) {
      showToast('CPF inválido!', 'error')
      return
    }

    if (!wallet) {
      showToast('Conecte sua MetaMask antes de registrar!', 'error')
      return
    }

    registerUser()
  }


  return (
    <div className="flex items-center justify-center min-h-screen">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-xl p-8 rounded-2xl shadow-xl bg-default">
        <img src={logo} alt="Logo" className="mx-auto mb-6 w-48" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-white mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950"
              />
            </div>

            <div className="w-36">
              <label className="block text-white mb-1">Data de Nasc.</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-1">CPF</label>
            <InputMask
              mask="999.999.999-99"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            >
              {(inputProps) => (
                <input
                  {...inputProps}
                  type="text"
                  required
                  className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950"
                />
              )}
            </InputMask>
          </div>

          <div>
            <label className="block text-white mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950"
            />
          </div>

          <div>
            <label className="block text-white mb-1">Carteira MetaMask</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={wallet || ""}
                readOnly
                className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm"
                placeholder="Conecte para continuar"
              />

              <button
                type="button"
                onClick={connectMetaMask}
                className="px-4 ring-red-900 ring-4 bg-secondary text-black rounded-sm"
              >
                Conectar
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-white mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white mb-1">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-60 block mx-auto ring-red-900 ring-4 bg-secondary text-black py-2 rounded-sm transition"
          >
            Registrar
          </button>
        </form>
      </div>
    </div>
  )
}
