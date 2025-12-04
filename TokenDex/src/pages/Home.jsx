import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import logo from "../assets/logo.png";
import sombra from "../assets/shadow.png";
import vena from "../assets/venusaur.png";
import wartortle from "../assets/wartortle.png";
import charmeleon from "../assets/charmeleon.png";
import { startNewRound, checkAnswer } from "../gameLogic";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [toast, setToast] = useState(null); 
  const navigate = useNavigate();

  const TOTAL_SLOTS = 30;

  const initialPokemons = [
    { id: 1, unlocked: false },
    { id: 2, src: vena, name: "Venusaur", unlocked: true },
    { id: 3, unlocked: false },
    { id: 4, unlocked: false },
    { id: 5, src: charmeleon, name: "Charmeleon", unlocked: false }, 
    { id: 6, unlocked: false },
    { id: 7, unlocked: false },
    { id: 8, src: wartortle, name: "Wartortle", unlocked: true },
  ];

  const [pokemons, setPokemons] = useState([
    ...initialPokemons,
    ...Array(TOTAL_SLOTS - initialPokemons.length).fill(null).map((_, index) => ({
      id: initialPokemons.length + index + 1,
      unlocked: false,
    })),
  ]);

  useEffect(() => {
  const p = startNewRound();
  console.log("Novo Pokémon sorteado:", p.name);
}, []);

  const unlockedCount = pokemons.filter((p) => p.unlocked).length;

 const handleSubmit = (e) => {
  e.preventDefault();

  const result = checkAnswer(answer);

  if (result.correct) {
    // Printando (já vem pronto da lógica também)
    console.log("🏆 Pokémon:", result.pokemon.name);
    console.log("🔢 Tentativas:", result.attempts);
    console.log("✨ Shine:", result.shiny ? "SIM" : "NÃO");

    // Atualiza pokédex com o Pokémon desbloqueado
    setPokemons((prev) =>
      prev.map((p) =>
        p.name === result.pokemon.name ? { ...p, unlocked: true } : p
      )
    );

    setToast({
      message: `Você desbloqueou ${result.pokemon.name}!`,
      pokemon: pokemons.find((p) => p.name === result.pokemon.name),
    });

    setTimeout(() => setToast(null), 3500);

    // Sorteia o próximo round
    const next = startNewRound();
    console.log("Novo Pokémon sorteado:", next.name);
  }

  setAnswer("");
};


  const handleLogout = () => {
    logout();
    navigate("/start");
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-4 gap-8 relative">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition z-10"
      >
        Sair
      </button>

      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 pointer-events-auto">
          {toast.pokemon && (
            <img
              src={toast.pokemon.src}
              alt={toast.pokemon.name}
              className="w-12 h-12 object-contain"
            />
          )}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="w-full bg-default max-w-lg p-8 rounded-2xl shadow-xl flex-grow flex flex-col h-90">
        <img src={logo} alt="Logo" className="mx-auto mb-6 w-40" />

        <div className="bg-secondary w-full h-72 rounded-xl flex items-center justify-center mb-4">
          <img src={sombra} alt="Sombra" className="w-60 object-contain" />
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="text"
            placeholder="Quem é esse Pokémon?"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm focus:ring-red-950 mb-4 text-center text-black"
          />
          <button
            type="submit"
            className="w-60 block mx-auto ring-red-900 ring-4 bg-red-600 text-white py-2 rounded-sm hover:bg-red-700 transition"
          >
            Confirmar
          </button>
        </form>
      </div>

      <div className="w-full bg-default max-w-lg p-8 rounded-2xl shadow-xl flex-grow flex flex-col h-90">
        <h2 className="text-center text-xl mb-4 text-white">
          Pokédex ({unlockedCount}/{TOTAL_SLOTS})
        </h2>

        <div className="bg-secondary p-4 rounded-xl h-96 overflow-y-auto overflow-x-hidden custom-scroll">
          <div className="grid grid-cols-5 gap-1">
            {pokemons.map((p) =>
              p.unlocked ? (
                <img
                  key={p.id}
                  src={p.src}
                  alt={p.name}
                  className="w-24 h-24 object-contain rounded-lg brightness-50 hover:brightness-100 transition"
                />
              ) : (
                <div
                  key={p.id}
                  className="w-24 h-24 flex items-center justify-center text-black font-bold rounded-lg text-xl"
                >
                  ?
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
