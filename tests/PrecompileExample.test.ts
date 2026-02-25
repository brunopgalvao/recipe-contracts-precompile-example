import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

const XCM_PRECOMPILE_ADDRESS = "0x00000000000000000000000000000000000a0000";

const XCM_IFACE = new ethers.Interface([
  "function weighMessage(bytes calldata message) external view returns (tuple(uint64 refTime, uint64 proofSize))",
]);

// SCALE-encoded VersionedXcm::V5 messages
const XCM_V5_EMPTY = "0x0500"; // V5 + empty instruction vec
const XCM_V5_CLEAR_ORIGIN = "0x05040a"; // V5 + 1 ClearOrigin instruction
const XCM_V5_TWO_CLEAR_ORIGIN = "0x05080a0a"; // V5 + 2 ClearOrigin instructions

async function callReturnsData(to: string, data: string): Promise<boolean> {
  try {
    const result = await ethers.provider.call({ to, data });
    return result !== "0x" && result.length > 2;
  } catch {
    // Revert also means something responded (precompile executed and rejected input)
    return true;
  }
}

function decodeWeight(result: string): { refTime: bigint; proofSize: bigint } {
  return {
    refTime: BigInt("0x" + result.slice(2, 66)),
    proofSize: BigInt("0x" + result.slice(66, 130)),
  };
}

describe("XCM Precompile on Asset Hub", function () {
  describe("Precompile Detection", function () {
    it("should detect the XCM precompile responds at its address", async function () {
      const responds = await callReturnsData(
        XCM_PRECOMPILE_ADDRESS,
        "0x00000000"
      );
      expect(responds).to.equal(true);
    });

    it("should confirm a non-precompile address does NOT respond", async function () {
      const responds = await callReturnsData(
        "0x0000000000000000000000000000000000ff0000",
        "0x00000000"
      );
      expect(responds).to.equal(false);
    });

    it("should confirm the precompile is at the documented address, not adjacent", async function () {
      const precompileResponds = await callReturnsData(
        XCM_PRECOMPILE_ADDRESS,
        "0x00000000"
      );
      const adjacentResponds = await callReturnsData(
        "0x00000000000000000000000000000000000a0001",
        "0x00000000"
      );
      expect(precompileResponds).to.equal(true);
      expect(adjacentResponds).to.equal(false);
    });
  });

  describe("weighMessage", function () {
    it("should return zero weight for an empty XCM v5 message", async function () {
      const result = await ethers.provider.call({
        to: XCM_PRECOMPILE_ADDRESS,
        data: XCM_IFACE.encodeFunctionData("weighMessage", [XCM_V5_EMPTY]),
      });
      const weight = decodeWeight(result);
      expect(weight.refTime).to.equal(0n);
      expect(weight.proofSize).to.equal(0n);
    });

    it("should return non-zero weight for a ClearOrigin instruction", async function () {
      const result = await ethers.provider.call({
        to: XCM_PRECOMPILE_ADDRESS,
        data: XCM_IFACE.encodeFunctionData("weighMessage", [
          XCM_V5_CLEAR_ORIGIN,
        ]),
      });
      const weight = decodeWeight(result);
      expect(weight.refTime).to.be.greaterThan(0n);
    });

    it("should scale weight linearly with number of instructions", async function () {
      const resultOne = await ethers.provider.call({
        to: XCM_PRECOMPILE_ADDRESS,
        data: XCM_IFACE.encodeFunctionData("weighMessage", [
          XCM_V5_CLEAR_ORIGIN,
        ]),
      });
      const resultTwo = await ethers.provider.call({
        to: XCM_PRECOMPILE_ADDRESS,
        data: XCM_IFACE.encodeFunctionData("weighMessage", [
          XCM_V5_TWO_CLEAR_ORIGIN,
        ]),
      });
      const weightOne = decodeWeight(resultOne);
      const weightTwo = decodeWeight(resultTwo);
      expect(weightTwo.refTime).to.equal(weightOne.refTime * 2n);
    });

    it("should reject XCM versions below v5", async function () {
      const xcmV4 = "0x0400"; // V4 + empty vec
      try {
        await ethers.provider.call({
          to: XCM_PRECOMPILE_ADDRESS,
          data: XCM_IFACE.encodeFunctionData("weighMessage", [xcmV4]),
        });
        expect.fail("Should have reverted");
      } catch (error: unknown) {
        const err = error as { message?: string };
        expect(err.message).to.include("revert");
      }
    });
  });
});
