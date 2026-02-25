// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IXcm.sol";

/// @title PrecompileExample
/// @dev Demonstrates calling the XCM precompile on Asset Hub
contract PrecompileExample {
    /// @dev XCM precompile address on Asset Hub
    address public constant XCM_PRECOMPILE = 0x00000000000000000000000000000000000a0000;

    /// @dev Estimate the weight of an XCM message via the precompile
    function estimateWeight(bytes calldata message) public view returns (uint64 refTime, uint64 proofSize) {
        IXcm.Weight memory weight = IXcm(XCM_PRECOMPILE).weighMessage(message);
        return (weight.refTime, weight.proofSize);
    }
}
