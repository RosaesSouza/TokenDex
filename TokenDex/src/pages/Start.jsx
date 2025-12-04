import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Start() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg p-8 rounded-2xl shadow-xl bg-default">
        <img src={logo} alt="Logo" className="mx-auto mb-6 w-96" />

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-60 block mx-auto ring-red-900 ring-4 bg-secondary text-black py-2 rounded-sm transition mb-4"
        >
          Entrar
        </button>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="w-60 block mx-auto ring-red-900 ring-4 bg-secondary text-black py-2 rounded-sm transition"
        >
          Registrar
        </button>
      </div>
    </div>
  );
}
