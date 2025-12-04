import hre from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";


  const Contract = await hre.ethers.getContractAt("PokemonNFT", CONTRACT_ADDRESS);

  const signer = await hre.ethers.provider.getSigner();
  const to = await signer.getAddress();

  const metadataURL = "https://ipfs.io/ipfs/SEU_ARQUIVO_AQUI"; // coloque o CID certo

  const tx = await Contract.mint(to, metadataURL);
  await tx.wait();

  console.log("NFT mintado com sucesso!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
