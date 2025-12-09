import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getLoggedUser } from "../services/authService";
import { ethers } from "ethers";
import logo from "../assets/logo.png";
import PokemonNFT from "../contracts/PokemonNFT.json";

// === CONFIG DO CONTRATO ===
const CONTRACT_ADDRESS = "0xc0b954E50cC3e7cB526A888B60A18b52928E4B21"; // Sepolia
const METADATA_CID = "bafybeibf6cjabzzmielr6rqysb4j6nylir6kpa7nkbtmqufbzltr6pmrme";

// Converte ipfs:// → gateway
function ipfsToHttp(ipfsUrl) {
  return ipfsUrl.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
}

export default function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [answer, setAnswer] = useState("");
  const [toast, setToast] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false); // ⬅ novo estado
  const navigate = useNavigate();

  const user = getLoggedUser();

  // ==========================
  // 1) Carregar pokemons + NFTs do usuário
  // ==========================
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("http://localhost:3000/pokemons");
        const data = await res.json();

        const formatted = data.map((p) => ({
          id: p.id,
          name: p.name,
        }));

        setPokemons(formatted);

        const nftRes = await fetch(`http://localhost:3000/user/${user.id}/nfts`);
        const nftData = await nftRes.json();

        setUserNFTs(nftData);

        startRound(formatted);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }

    loadData();
  }, []);

  // ==========================
  // 2) Sortear Pokémon + sombra
  // ==========================
  function startRound(list) {
    const pool = list || pokemons;
    if (!pool.length) return;

    const randomPokemon = pool[Math.floor(Math.random() * pool.length)];
    const name = randomPokemon.name.toLowerCase();

    const shadow = new URL(
      `../assets/shadows/${name}/shadow.png`,
      import.meta.url
    ).href;

    setCurrentPokemon(randomPokemon);
    setCurrentImage(shadow);
    setAnswer("");      // reset do input
    setIsAnswered(false); // desbloqueia o input
  }

  // ==========================
  // 3) MINT NFT → retorna tokenId
  // ==========================
  async function mintNFT(pokemon) {
    if (!pokemon) return false;

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const wallet = await signer.getAddress();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PokemonNFT.abi,
        signer
      );

      const fileName = `${pokemon.name.toLowerCase()}.json`;
      const tokenURI = `ipfs://${METADATA_CID}/${fileName}`;

      const nextIdBefore = Number(await contract.nextTokenId());
      console.log("Mintando ID:", nextIdBefore);

      const tx = await contract.mint(wallet, tokenURI);
      await tx.wait();

      return nextIdBefore;

    } catch (err) {
      console.error("ERRO REAL AO MINTAR:", err);
      return false;
    }
  }

  // ==========================
  // 4) Validar resposta
  // ==========================
  function checkAnswer(userInput) {
    return (
      userInput.trim().toLowerCase() ===
      currentPokemon.name.toLowerCase()
    );
  }

  // ==========================
  // 5) Confirmar resposta
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkAnswer(answer)) {
      alert("❌ Resposta errada!");
      setAnswer("");
      return;
    }

    setIsAnswered(true); // ⬅ bloqueia o input

    const pokemon = currentPokemon;
    const name = pokemon.name.toLowerCase();

    const realImg = new URL(
      `../assets/shadows/${name}/default.png`,
      import.meta.url
    ).href;
    setCurrentImage(realImg);

    const tokenId = await mintNFT(pokemon);
    if (!tokenId) {
      alert("Erro ao mintar!");
      return;
    }

    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${METADATA_CID}/${name}.json`;
    const metadata = await fetch(metadataUrl).then((r) => r.json());
    const nftImage = ipfsToHttp(metadata.image);

    await fetch("http://localhost:3000/save-nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        pokemonName: pokemon.name,
        tokenId,
        imageUrl: nftImage,
      }),
    });

    setUserNFTs((prev) => [
      ...prev,
      {
        token_id: tokenId,
        pokemon_name: pokemon.name,
        image_url: nftImage,
      },
    ]);

    setToast({
      message: `Você desbloqueou ${pokemon.name}!`,
    });
    setTimeout(() => setToast(null), 3000);

    setAnswer(""); 
  };

  const handleLogout = () => {
    logout();
    navigate("/start");
  };

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-4 gap-8 relative">

      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition z-10"
      >
        Sair
      </button>

      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg z-50 font-bold text-lg">
          {toast.message}
        </div>
      )}

      {/* CARD DO JOGO */}
      <div className="w-full bg-default max-w-lg p-8 rounded-2xl shadow-xl flex flex-col">
        <img src={logo} alt="Logo" className="mx-auto mb-6 w-40" />

        <div className="bg-secondary w-full h-72 rounded-xl flex items-center justify-center mb-4">
          {currentImage && (
            <img src={currentImage} className="w-60 object-contain" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="text"
            placeholder="Quem é esse Pokémon?"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 ring-red-900 ring-4 bg-secondary rounded-sm mb-4 text-center text-black"
            disabled={isAnswered} // ⬅ bloqueio após acertar
          />

          <button
            type="submit"
            className="w-60 block mx-auto ring-red-900 ring-4 bg-red-600 text-white py-2 rounded-sm hover:bg-red-700 transition"
          >
            Confirmar
          </button>
        </form>
      </div>

      {/* POKÉDEX */}
      <div className="w-full bg-default max-w-lg p-8 rounded-2xl shadow-xl flex flex-col">
        <h2 className="text-center text-xl mb-4 text-black">
          NFTs conquistados ({userNFTs.length})
        </h2>

        <div className="bg-secondary p-4 rounded-xl grid grid-cols-4 gap-2">
          {userNFTs.map((n, idx) => (
            <img
              key={idx}
              src={n.image_url}
              alt={n.pokemon_name}
              className="w-24 h-24 rounded-lg object-contain"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
