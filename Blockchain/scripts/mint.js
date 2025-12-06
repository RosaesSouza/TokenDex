import hre from "hardhat";

async function main() {
  // Endereço do contrato já deployado (Hardhat local ou outro)
  const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  // Nome do contrato exatamente como está no .sol
  const Contract = await hre.ethers.getContractAt("PokemonNFT", CONTRACT_ADDRESS);

  // Conta que vai assinar a transação
  const signer = await hre.ethers.provider.getSigner();
  const to = await signer.getAddress();

  // URL METADATA — depois o backend só injeta o CID aqui
const metadataCID = "QmExemploDeCID"; // seu CID real
const metadataURL = `https://ipfs.io/ipfs/${metadataCID}`;


  console.log("📦 Enviando mint...");
  const tx = await Contract.mint(to, metadataURL);
  await tx.wait();

  console.log("✅ NFT mintado com sucesso!");
  await nft.tokenURI(1)
  await nft.ownerOf(1)

  console.log(`👤 Dono: ${to}`);
  console.log(`🔗 Metadata: ${metadataURL}`);
}

main().catch((error) => {
  console.error("Erro ao mintar NFT:", error);
  process.exit(1);
});
