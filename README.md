# FairLend 🏦

> **Undercollateralized lending powered by on-chain reputation**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Built with FairScale](https://img.shields.io/badge/Built%20with-FairScale-blue)](https://fairscale.xyz)
[![Live on Base](https://img.shields.io/badge/Live-Base%20Mainnet-0052FF)](https://base.org)

## 🎯 What is FairLend?

FairLend lets you borrow crypto with **less collateral** based on your **FairScore** — your on-chain reputation. No banks, no KYC, just your wallet history.

| FairScore | Collateral Required | Max Loan | Interest Rate |
|-----------|---------------------|----------|---------------|
| 🟣 **80+** (Platinum) | 100% | $50,000 | 8% APY |
| 🟡 **60-79** (Gold) | 120% | $25,000 | 10% APY |
| ⚪ **40-59** (Silver) | 135% | $10,000 | 12% APY |
| 🟠 **20-39** (Bronze) | 150% | $5,000 | 14% APY |

**On Aave, everyone pays 150%+ collateral. On FairLend, your reputation earns you better terms.**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- A wallet with testnet ETH (for Base Sepolia)

### Clone & Install

```bash
git clone https://github.com/fairscale/fairlend.git
cd fairlend

# Install all dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd contracts && forge install && cd ..
```

### Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your FairScale API key

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your WalletConnect project ID
```

### Run Locally

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Visit http://localhost:3000
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FAIRLEND STACK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Frontend   │────▶│   Backend    │────▶│  FairScale   │   │
│  │   Next.js    │     │   Express    │     │     API      │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│         │                    │                                  │
│         │                    │ Signed Attestation               │
│         ▼                    ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Smart Contracts                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ FairLendCore│  │  Tranched   │  │  Insurance  │      │  │
│  │  │   (Loans)   │  │   Pools     │  │    Fund     │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Base Blockchain                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 FairScore Integration

FairLend uses FairScore as a **core primitive**, not a decorative add-on. Here's how:

### Integration Points

1. **Credit Limit Calculation** — FairScore determines max loan amount
2. **Collateral Ratio** — Higher scores = lower collateral requirements
3. **Interest Rate** — Better scores = cheaper borrowing
4. **Vouch Eligibility** — Only 500+ FairScore users can vouch
5. **Outcome Reporting** — Repayments/defaults are reported back to FairScale

### Signed Attestation Flow

```
User clicks "Update Credit Limit"
         │
         ▼
Backend fetches FairScore from API
         │
         ▼
Backend calculates terms (maxLoan, collateralRatio, interestRate)
         │
         ▼
Backend signs attestation with private key
         │
         ▼
User submits signed attestation to contract
         │
         ▼
Contract verifies signature and stores credit limit
         │
         ▼
User can now borrow based on their verified FairScore
```

### Why This Architecture?

- **Gas Efficient** — No on-chain oracle calls during borrow
- **Secure** — Backend signature prevents spoofing
- **Fresh Data** — Attestations expire after 24 hours
- **Verifiable** — Anyone can check the signer address

---

## 🛡️ Risk Management

FairLend has a **four-layer loss waterfall** to protect lenders:

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOSS WATERFALL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: BORROWER COLLATERAL (100-175%)                       │
│  └── First loss absorbed by borrower's posted collateral       │
│                                                                 │
│  Layer 2: VOUCHER STAKES                                        │
│  └── Community members who vouched get slashed                 │
│                                                                 │
│  Layer 3: INSURANCE FUND (20% of protocol revenue)             │
│  └── Protocol-level backstop for unexpected losses             │
│                                                                 │
│  Layer 4: JUNIOR TRANCHE                                        │
│  └── High-yield depositors absorb catastrophic losses          │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  SENIOR TRANCHE: Protected (only touched if all above fail)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Default Scenario

**Q: What happens if a Platinum user borrows $50k and disappears?**

1. ✅ Seize their $50k collateral (100% for Platinum)
2. ✅ If market dropped and collateral < debt, slash vouchers
3. ✅ If still short, use Insurance Fund
4. ✅ If still short, Junior Tranche absorbs loss
5. ✅ Report default to FairScale API — user's score nuked to 0
6. ✅ Wallet permanently blacklisted from FairLend

---

## 📁 Project Structure

```
fairlend/
├── contracts/                 # Solidity smart contracts
│   ├── src/
│   │   └── FairLendCore.sol  # Main lending contract
│   ├── test/                  # Foundry tests
│   └── script/                # Deployment scripts
│
├── backend/                   # Express.js API server
│   ├── src/
│   │   └── server.ts         # API + attestation service
│   ├── package.json
│   └── .env.example
│
├── frontend/                  # Next.js 14 application
│   ├── src/
│   │   └── app/              # App router pages
│   ├── package.json
│   └── .env.example
│
└── docs/                      # Documentation
    ├── FAIRSCORE_INTEGRATION.md
    └── DEPLOYMENT.md
```

---

## 🧪 Testing

### Smart Contracts

```bash
cd contracts
forge test -vvv
```

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

---

## 🚢 Deployment

### Testnet (Base Sepolia)

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast
```

### Mainnet (Base)

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url base --broadcast --verify
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full deployment guide.

---

## 📊 Contract Addresses

| Network | Contract | Address |
|---------|----------|---------|
| Base Sepolia | FairLendCore | `0x...` |
| Base Mainnet | FairLendCore | `0x...` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🔗 Links

- **Website**: https://fairlend.xyz
- **Twitter**: https://twitter.com/FairLendXYZ
- **Documentation**: https://docs.fairlend.xyz
- **FairScale**: https://fairscale.xyz

---

## 💡 Why FairLend?

> "Right now, FairScore is just a number. FairLend turns FairScore into money."

By assigning a dollar value to reputation — a score of 800 grants $50,000 credit at 100% collateral — we create the first **Cost of Corruption** in DeFi.

If a user ruins their score, they lose access to future capital. This creates the incentive loop that makes on-chain reputation actually matter.

**Betting on FairLend is betting on a mature crypto economy where your history is worth something.**

---

Built with ❤️ for the FairScale ecosystem.
