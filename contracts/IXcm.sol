// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IXcm - Interface for the XCM precompile on Asset Hub
/// @dev Located at 0x00000000000000000000000000000000000a0000
interface IXcm {
    struct Weight {
        uint64 refTime;
        uint64 proofSize;
    }

    /// @dev Execute an XCM message locally with the caller's origin
    function execute(bytes calldata message, Weight calldata weight) external;

    /// @dev Send an XCM message to another parachain or consensus system
    function send(bytes calldata destination, bytes calldata message) external;

    /// @dev Estimate the weight required to execute an XCM message
    function weighMessage(bytes calldata message) external view returns (Weight memory);
}
