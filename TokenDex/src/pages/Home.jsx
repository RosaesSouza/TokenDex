import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { ethers } from "ethers";
import logo from "../assets/logo.png";
import sombra from "../assets/shadow.png";
import { NFTStorage, File } from "nft.storage";
import PokemonNFT from "../contracts/PokemonNFT.json"; // ABI do contrato

const NFT_STORAGE_KEY = 'c7b46df1.fde917733a3a4e4b9bb95f5d6625c3f6';
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const client = new NFTStorage({ token: NFT_STORAGE_KEY });

export default function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [answer, setAnswer] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // ==========================
  // 1) BUSCAR POKEMONS DO BD
  // ==========================
  useEffect(() => {
    async function loadPokemons() {
      try {
        const res = await fetch("http://localhost:3000/pokemons");
        const data = await res.json();

        const formatted = data.map((p) => ({
          id: p.id,
          name: p.name,
          src: p.Img_URL,
          unlocked: false,
        }));

        setPokemons(formatted);
        startRound(formatted);
      } catch (err) {
        console.error("Erro ao carregar Pokémons:", err);
      }
    }

    loadPokemons();
  }, []);

  // ==========================
  // 2) SORTEAR UM POKEMON
  // ==========================
  function startRound(list) {
    const pool = (list || pokemons).filter((p) => !p.unlocked);
    if (pool.length === 0) {
      setCurrentPokemon(null);
      console.log("Todos os Pokémons foram desbloqueados!");
      return;
    }
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentPokemon(random);
    console.log("Novo Pokémon sorteado:", random.name);
  }

  // ==========================
  // 3) MINTAR NFT (NFT.Storage + MetaMask)
  // ==========================
  async function mintNFT(pokemon) {
    if (!pokemon) return;

    try {
      if (!window.ethereum) {
        alert("MetaMask não encontrada!");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const wallet = await signer.getAddress();
      console.log("👤 Wallet conectada:", wallet);

      // 1️⃣ Envia a imagem + metadata para NFT.Storage
      const metadata = await client.store({
        name: pokemon.name,
        description: `Pokémon desbloqueado: ${pokemon.name}`,
        image: new File([await fetch(pokemon.src).then(r => r.blob())], 'pokemon.png', { type: 'image/png' }),
      });

      console.log("✅ Metadata enviada ao IPFS:", metadata.url);

      // 2️⃣ Mint no contrato
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PokemonNFT.abi, signer);
      const tx = await contract.mint(wallet, metadata.url);
      console.log("⏳ Aguardando confirmação da blockchain...");
      await tx.wait();

      console.log("✅ NFT mintado com sucesso!");
      alert(`NFT de ${pokemon.name} criado!\nTx: ${tx.hash}`);
    } catch (err) {
      console.error("❌ Erro ao mintar NFT:", err);
      alert("Erro ao mintar NFT");
    }
  }

  // ==========================
  // 4) VERIFICAR RESPOSTA
  // ==========================
  function checkAnswer(userInput) {
    if (!currentPokemon) return { correct: false };
    const correct = userInput.trim().toLowerCase() === currentPokemon.name.toLowerCase();
    return { correct, pokemon: currentPokemon };
  }

  // ==========================
  // 5) CONFIRMAR RESPOSTA
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPokemon) return;

    const result = checkAnswer(answer);

    if (result.correct) {
      setPokemons((prev) =>
        prev.map((p) =>
          p.id === result.pokemon.id ? { ...p, unlocked: true } : p
        )
      );

      setToast({ message: `Você desbloqueou ${result.pokemon.name}!`, pokemon: result.pokemon });

      await mintNFT(result.pokemon); // Mint direto na blockchain

      setTimeout(() => setToast(null), 3500);
      startRound(); // sorteia o próximo
    }

    setAnswer("");
  };

  const handleLogout = () => {
    logout();
    navigate("/start");
  };

  const unlockedCount = pokemons.filter((p) => p.unlocked).length;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-4 gap-8 relative">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition z-10"
      >
        Sair
      </button>

      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <img src={toast.pokemon.src} alt={toast.pokemon.name} className="w-12 h-12 object-contain" />
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
            disabled={!currentPokemon}
          />
          <button
            type="submit"
            className="w-60 block mx-auto ring-red-900 ring-4 bg-red-600 text-white py-2 rounded-sm hover:bg-red-700 transition"
            disabled={!currentPokemon}
          >
            Confirmar
          </button>
        </form>
      </div>

      <div className="w-full bg-default max-w-lg p-8 rounded-2xl shadow-xl flex-grow flex flex-col h-90">
        <h2 className="text-center text-xl mb-4 text-white">
          Pokédex ({unlockedCount}/{pokemons.length})
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
