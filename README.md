# Energy-Aware Agent — AIZ Protocol

A blockchain-based intelligent task management system powered by the AIZ (Autonomous AI Zone) Protocol.

## 🌐 Live Demo

The frontend is automatically deployed to GitHub Pages: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## 📋 Features

- 🤖 **Energy-Aware Task Agent**: Intelligent task evaluation based on agent vitality and network efficiency
- 💼 **Wallet Integration**: Connect with MetaMask for blockchain interactions
- 📊 **Real-time Monitoring**: Console-style logs with copy/clear functionality
- 🔑 **Proof of Thought**: Decision ID tracking with clipboard support
- 🎨 **Modern UI**: Dark theme, responsive design (320px-1200px), accessible

## 🚀 Quick Start

### Frontend Development (Local Preview)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start a local server:
   ```bash
   npx http-server -p 8080 -c-1
   ```

3. Open your browser to `http://localhost:8080`

### Smart Contract Deployment

#### Supported Networks
- Ethereum Sepolia (default)
- OP Sepolia (Optimism testnet)
- Base Sepolia (Base testnet)

#### Deployment Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env` file (never commit this file):
   ```env
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   OP_SEPOLIA_RPC_URL=https://sepolia.optimism.io
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   ```
   - Fund your deployer address with test ETH on the target network

3. Compile contracts:
   ```bash
   npx hardhat compile
   ```

4. Deploy to your chosen network:
   ```bash
   # Ethereum Sepolia
   npx hardhat run scripts/deploy.js --network sepolia
   
   # OP Sepolia
   npx hardhat run scripts/deploy.js --network opSepolia
   
   # Base Sepolia
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

5. Copy the deployed EnergyAwareAgent address and update `frontend/scripts/app.js`:
   ```javascript
   const AGENT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
   ```

6. Commit and push frontend changes to deploy to GitHub Pages

## 📦 GitHub Pages Deployment

The frontend is automatically deployed to GitHub Pages when you push changes to the `main` branch.

### Setup GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will automatically deploy the `frontend/` directory

### Manual Deployment

You can also trigger a manual deployment:
1. Go to **Actions** tab in your repository
2. Select **Deploy Frontend to GitHub Pages**
3. Click **Run workflow**

## 🛠️ Project Structure

```
.
├── contracts/              # Smart contracts
│   ├── EnergyAwareAgent.sol
│   ├── interfaces/
│   └── mocks/
├── frontend/              # Static website (deployed to GitHub Pages)
│   ├── index.html
│   ├── style.css
│   └── scripts/
│       └── app.js
├── scripts/               # Deployment scripts
│   └── deploy.js
├── test/                  # Contract tests
└── .github/
    └── workflows/
        ├── deploy.yml           # Contract deployment
        └── deploy-pages.yml     # GitHub Pages deployment
```

## 🔐 Security Notes

- ⚠️ **Never commit `.env` files or private keys**
- 🔒 The `.env` file is already in `.gitignore`
- 🌐 Only static frontend files are deployed to GitHub Pages
- 🔑 All sensitive operations require MetaMask wallet connection

## 📝 Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Submit Task**: Enter task description and energy cost
3. **Monitor**: Watch the console logs for real-time updates
4. **Track Decisions**: View and copy Decision IDs (Proof of Thought)
5. **Configure Agent**: Update Agent ID as needed

## 🧪 Testing

Run contract tests:
```bash
npm test
```

## 📚 Documentation

For more information about the AIZ Protocol and Zentix ecosystem, see:
- `zentix-protocol/AIZ_PROTOCOL_IMPLEMENTATION.md`
- `zentix-protocol/IMPLEMENTATION_SUMMARY.md`
- `zentix-protocol/DEFI_AUTOMATION_GUIDE.md`

## 🤝 Contributing

Contributions are welcome! Please ensure:
- No secrets or private keys in commits
- Frontend changes are tested locally before pushing
- Smart contract changes include tests

## 📄 License

MIT