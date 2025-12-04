import hre from "hardhat";


async function main() {
  const Contract = await hre.ethers.deployContract("PokemonNFT");
  await Contract.waitForDeployment();
  console.log("NFT Deployado:", Contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
