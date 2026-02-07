# FairLend 🏦

> **Undercollateralized lending powered by on-chain reputation**

[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://fairlend-eight.vercel.app/)
[![Contract](https://img.shields.io/badge/Contract-BaseScan-blue)](https://basescan.org/address/0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34)
[![Built with FairScale](https://img.shields.io/badge/Built%20with-FairScale-purple)](https://fairscale.xyz)

## 🎯 What is FairLend?

FairLend lets you borrow crypto with **less collateral** based on your **FairScore** — your on-chain reputation. No banks, no KYC, just your wallet history.

## 🔗 Live Demo

| Resource | Link |
|----------|------|
| **Live App** | https://fairlend-eight.vercel.app |
| **Smart Contract** | [View on BaseScan](https://basescan.org/address/0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34) |
| **API Docs** | [API.md](docs/API.md) |
| **User Guide** | [USER_GUIDE.md](docs/USER_GUIDE.md) |

## 📊 FairScore Tiers

| Tier | Score | Collateral | Max Loan | Interest |
|------|-------|------------|----------|----------|
| 🟣 Platinum | 80+ | 100% | $50,000 | 8% APY |
| 🟡 Gold | 60-79 | 120% | $25,000 | 10% APY |
| ⚪ Silver | 40-59 | 135% | $10,000 | 12% APY |
| 🟠 Bronze | 20-39 | 150% | $5,000 | 14% APY |

## 🏗️ Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Solana Wallet  │────▶│   FairScale     │────▶│    FairLend     │
│  (reputation)   │     │   API (scores)  │     │   on Base       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**How it works:**
1. FairScale analyzes your Solana wallet history
2. You get a FairScore (0-100)
3. FairLend uses that score to set your loan terms on Base

## 🔗 FairScore Integration

FairLend uses FairScore as a **core primitive**, not a decorative add-on:

| Integration Point | Description |
|-------------------|-------------|
| Credit Limits | FairScore determines max loan amount |
| Collateral Ratio | Higher scores = lower collateral required |
| Interest Rates | Better scores = cheaper borrowing |
| Vouch Eligibility | Only 40+ FairScore users can vouch |
| Outcome Reporting | Repayments/defaults reported to FairScale |

See [FAIRSCORE_INTEGRATION.md](docs/FAIRSCORE_INTEGRATION.md) for technical details.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- MetaMask wallet

### Local Development
```bash
# Clone the repo
git clone https://github.com/Fourthe3rd/fairlend.git
cd fairlend

# Start Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev

# Start Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run dev
```

Open http://localhost:3000

### Environment Variables

**Backend (.env):**
```
PORT=3001
FAIRSCALE_API_KEY=your_api_key
ATTESTATION_SIGNER_KEY=0xyour_private_key
CHAIN_ID=8453
CONTRACT_ADDRESS=0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_WALLET_CONNECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34
NEXT_PUBLIC_CHAIN_ID=8453
```

## 📁 Project Structure
```
fairlend/
├── backend/           # Express.js API server
│   └── src/
│       └── server.ts  # Main API + attestation service
├── frontend/          # Next.js application
│   └── src/
│       └── app/       # App router pages
├── contracts/         # Solidity smart contracts
│   └── src/
│       └── FairLendCore.sol
└── docs/              # Documentation
    ├── API.md
    ├── USER_GUIDE.md
    └── FAIRSCORE_INTEGRATION.md
```

## 🔐 Smart Contracts

| Network | Contract | Address |
|---------|----------|---------|
| Base Mainnet | FairLendCore | `0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34` |
| Base Sepolia | FairLendCore | `0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34` |

### Contract Features

- **Signed Attestations** — Gas-efficient credit limit updates
- **Tranched Pools** — Senior (safe) and Junior (high-yield) lending
- **Vouching System** — Stake to vouch for borrowers
- **Insurance Fund** — 20% of revenue for loss protection
- **Liquidation** — Permissionless with keeper rewards

## 🛡️ Risk Management

4-layer loss waterfall protects lenders:
```
Layer 1: Borrower Collateral (100-175%)
    ↓
Layer 2: Voucher Stakes (slashed on default)
    ↓
Layer 3: Insurance Fund (20% of revenue)
    ↓
Layer 4: Junior Tranche (absorbs remaining loss)
```

## 🚢 Deployment

### Deploy Contracts
```bash
cd contracts
forge build
forge script script/Deploy.s.sol --rpc-url https://mainnet.base.org --broadcast --legacy
```

### Deploy Backend

Deploy to Railway or Render with root directory set to `backend`.

### Deploy Frontend

Deploy to Vercel with root directory set to `frontend`.

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Live App:** https://fairlend-eight.vercel.app
- **GitHub:** https://github.com/Fourthe3rd/fairlend
- **Contract:** https://basescan.org/address/0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34
- **FairScale:** https://fairscale.xyz

---

Built with ❤️ for the FairScale ecosystem.