# Energy-Aware Agent — Deployment Guide

## Supported Networks
- Ethereum Sepolia (default)
- OP Sepolia (Optimism testnet)
- Base Sepolia (Base testnet)

## Quick Start
1. Install dependencies:
	```bash
	npm install
	```
2. Set up your `.env` file (never commit this file):
	```
	SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
	OP_SEPOLIA_RPC_URL=https://sepolia.optimism.io
	BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
	PRIVATE_KEY=0xYOUR_PRIVATE_KEY
	```
	- Fund your deployer address with test ETH on the target network.
3. Compile contracts:
	```bash
	npx hardhat compile
	```
4. Deploy to Sepolia:
	```bash
	npx hardhat run scripts/deploy.js --network sepolia
	```
	Deploy to OP Sepolia:
	```bash
	npx hardhat run scripts/deploy.js --network opSepolia
	```
	Deploy to Base Sepolia:
	```bash
	npx hardhat run scripts/deploy.js --network baseSepolia
	```
5. Copy the deployed EnergyAwareAgent address and update `frontend/scripts/app.js`.
6. Commit and push frontend changes for GitHub Pages.

## Notes
- Public RPCs are rate-limited; for production, use a provider key.
- Never commit `.env` or private keys.
- For MetaMask integration, use Sepolia, OP Sepolia, or Base Sepolia in your wallet.
# Test-AIZ