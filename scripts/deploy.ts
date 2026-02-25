import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const PrecompileExample =
    await ethers.getContractFactory("PrecompileExample");
  const precompileExample = await PrecompileExample.deploy();
  await precompileExample.waitForDeployment();

  const address = await precompileExample.getAddress();
  console.log(`PrecompileExample deployed to: ${address}`);

  const exists = await precompileExample.precompileExists();
  console.log(`XCM precompile exists: ${exists}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
