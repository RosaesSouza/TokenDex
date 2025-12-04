// gameLogic.js

// Lista temporária de pokemons (até integrar com BD)
export const pokemonList = [
  { id: 1, name: "Bulbasaur" },
  { id: 2, name: "Ivysaur" },
  { id: 3, name: "Venusaur" },
  { id: 4, name: "Charmander" },
  { id: 5, name: "Charmeleon" },
  { id: 6, name: "Charizard" },
  { id: 7, name: "Squirtle" },
  { id: 8, name: "Wartortle" },
  { id: 9, name: "Blastoise" },
];

// Estado interno do jogo (por enquanto em memória)
let currentPokemon = null;
let attemptCounter = 0;

// 👉 Sorteia um Pokémon
export function startNewRound() {
  attemptCounter = 0;
  currentPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
  return currentPokemon;
}

// 👉 Registra tentativa (para calcular medalha depois)
export function registerAttempt() {
  attemptCounter++;
  return attemptCounter;
}

// 👉 Verifica resposta do usuário
export function checkAnswer(userAnswer) {
  if (!currentPokemon) return { error: "Nenhum round iniciado." };

  registerAttempt();

  const correct =
    userAnswer.trim().toLowerCase() === currentPokemon.name.toLowerCase();

  if (!correct) {
    return {
      correct: false,
      attempts: attemptCounter,
    };
  }

  // Se acertou → calcula shine
  const shine = isShiny();

  // Log TEMPORÁRIO enquanto não tem blockchain
  console.log("🎉 Pokémon acertado:", currentPokemon.name);
  console.log("📊 Tentativas:", attemptCounter);
  console.log("✨ Shine? ", shine ? "SIM" : "NÃO");

  return {
    correct: true,
    pokemon: currentPokemon,
    attempts: attemptCounter,
    shiny: shine,
  };
}

// 👉 Chance de 0.05% (0.0005)
export function isShiny() {
  const chance = 0.0005; // 0,05%
  return Math.random() < chance;
}
