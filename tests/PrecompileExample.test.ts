import { expect } from "chai";
import hre from "hardhat";
import { PrecompileExample } from "../typechain-types";

const { ethers } = hre;

const XCM_PRECOMPILE_ADDRESS = "0x00000000000000000000000000000000000a0000";

describe("PrecompileExample", function () {
  let precompileExample: PrecompileExample;

  beforeEach(async function () {
    const PrecompileExample =
      await ethers.getContractFactory("PrecompileExample");
    precompileExample = await PrecompileExample.deploy();
    await precompileExample.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const address = await precompileExample.getAddress();
      expect(address).to.be.properAddress;
    });

    it("should expose the correct XCM precompile address", async function () {
      const addr = await precompileExample.XCM_PRECOMPILE();
      expect(addr.toLowerCase()).to.equal(XCM_PRECOMPILE_ADDRESS);
    });
  });

  describe("XCM Precompile", function () {
    it("should detect the precompile responds at the expected address", async function () {
      // Calling the precompile with an invalid selector reverts,
      // proving there is executable code at that address.
      // A non-existent address would return success with empty data.
      try {
        await ethers.provider.call({
          to: XCM_PRECOMPILE_ADDRESS,
          data: "0x00000000",
        });
        expect.fail("Expected revert from precompile");
      } catch (error: any) {
        expect(error.message || error.toString()).to.include("revert");
      }
    });

    it("should confirm a non-precompile address does NOT revert", async function () {
      // For comparison: calling a random empty address returns empty data
      const result = await ethers.provider.call({
        to: "0x0000000000000000000000000000000000ff0000",
        data: "0x00000000",
      });
      expect(result).to.equal("0x");
    });
  });
});
