import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const PrecompileExample =
    await ethers.getContractFactory("PrecompileExample");
  const precompileExample = await PrecompileExample.deploy();
  await precompileExample.waitForDeployment();

  const address = await precompileExample.getAddress();
  console.log(`PrecompileExample deployed to: ${address}`);

  // Estimate weight for a ClearOrigin XCM v5 instruction
  const xcmMessage = "0x05040a"; // VersionedXcm::V5 with ClearOrigin
  const [refTime, proofSize] =
    await precompileExample.estimateWeight(xcmMessage);
  console.log(`Weight for ClearOrigin: refTime=${refTime}, proofSize=${proofSize}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
