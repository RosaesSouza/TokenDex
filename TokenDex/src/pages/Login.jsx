import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { saveLoggedUser } from "../services/authService"; // IMPORTANTE

function Toast({ message, type = "error", onClose }) {
  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white z-50
        ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
    >
      {message}
      <button onClick={onClose} className="ml-2 font-bold hover:text-gray-200">
        ✕
      </button>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Login realizado com sucesso!", "success");

      // Salva o usuário onde o Home.jsx espera
      saveLoggedUser(data.user);

      setTimeout(() => navigate("/"), 500);
    } else {
      showToast(data.error || "Credenciais inválidas", "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full bg-default max-w-lg p-8 rounded-2xl shadow-xl">
        <img src={logo} alt="Logo" className="mx-auto mb-6 w-96" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950"
            />
          </div>

          <div>
            <label className="block text-white mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950 mb-4"
            />
          </div>

          <button
            type="submit"
            className="w-60 block mx-auto ring-red-900 ring-4 bg-secondary text-black py-2 rounded-sm transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
