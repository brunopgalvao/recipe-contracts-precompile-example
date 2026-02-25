# Contracts Precompile Example

A minimal Hardhat project demonstrating how to interact with Asset Hub precompiles from Solidity smart contracts.

## Overview

This recipe deploys a contract that interacts with the [XCM precompile](https://docs.polkadot.com/develop/smart-contracts/precompiles/xcm-precompile/) on Asset Hub at address `0x00000000000000000000000000000000000A0000`.

## Prerequisites

- Node.js 22+
- A running Chopsticks fork of Asset Hub with eth-rpc (see [Polkadot Cookbook](https://github.com/polkadot-developers/polkadot-cookbook) for CI setup)

## Usage

```bash
npm ci
npx hardhat compile
npx hardhat test --network localhost
```

## What This Demonstrates

- Defining a Solidity interface (`IXcm.sol`) for the XCM precompile
- Checking that a precompile exists at its expected address
- Calling precompile functions from a deployed contract

## License

MIT OR Apache-2.0
