# FairScore Integration Guide

This document explains how FairLend integrates with the FairScale API to power reputation-based lending.

## Overview

FairLend uses FairScore as the **core underwriting primitive**. Without FairScore, the protocol cannot function — it would have no way to assess borrower creditworthiness without falling back to excessive collateral requirements or centralized KYC.

## Integration Points

### 1. Credit Limit Determination

When a user wants to borrow, they first need to establish their credit limit based on their FairScore.

**Flow:**
```
User → Backend API → FairScale API → Credit Terms → Signed Attestation → Smart Contract
```

**Backend Code:**
```typescript
// Fetch score from FairScale
const scoreData = await axios.get(
  `${FAIRSCALE_API}/v1/score/${walletAddress}`,
  { headers: { 'Authorization': `Bearer ${API_KEY}` } }
);

// Calculate credit terms
const terms = calculateCreditTerms(scoreData.score);

// Sign attestation
const signature = await signer.signMessage(messageHash);
```

### 2. Collateral Ratio Calculation

FairScore directly determines how much collateral a borrower must post:

| FairScore Range | Collateral Ratio | Explanation |
|-----------------|------------------|-------------|
| 800+ | 100% | Excellent history, minimal risk |
| 650-799 | 120% | Good history, low risk |
| 500-649 | 135% | Moderate history, medium risk |
| 350-499 | 150% | Limited history, higher risk |
| <350 | 175% | Insufficient history, maximum risk |

### 3. Interest Rate Pricing

Higher FairScores unlock lower interest rates:

| FairScore Range | Interest Rate | vs. Base |
|-----------------|---------------|----------|
| 800+ | 8% APY | -4% |
| 650-799 | 10% APY | -2% |
| 500-649 | 12% APY | Base |
| 350-499 | 14% APY | +2% |
| <350 | 16% APY | +4% |

### 4. Loan Limit Caps

Maximum borrowing capacity scales with reputation:

| FairScore Range | Max Loan |
|-----------------|----------|
| 800+ | $50,000 |
| 650-799 | $25,000 |
| 500-649 | $10,000 |
| 350-499 | $5,000 |
| <350 | $2,000 |

### 5. Vouch Eligibility

Only users with FairScore ≥ 500 can vouch for other borrowers. This ensures that vouchers themselves have established on-chain reputation.

### 6. Outcome Reporting

When loans are repaid or defaulted, FairLend reports the outcome back to FairScale:

```typescript
// After repayment
await axios.post(`${FAIRSCALE_API}/v1/report`, {
  wallet: borrowerAddress,
  protocol: 'fairlend',
  event: 'loan_repaid',
  amount: loanAmount,
  timestamp: new Date().toISOString()
});

// After default
await axios.post(`${FAIRSCALE_API}/v1/report`, {
  wallet: borrowerAddress,
  protocol: 'fairlend',
  event: 'loan_defaulted',
  amount: loanAmount,
  timestamp: new Date().toISOString()
});
```

This creates a feedback loop where FairLend behavior affects future FairScores across the ecosystem.

## API Endpoints Used

### GET /v1/score/{wallet}

Fetches the FairScore for a wallet address.

**Response:**
```json
{
  "score": 742,
  "tier": "gold",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "components": {
    "walletAge": 85,
    "transactionHistory": 72,
    "defiActivity": 68,
    "governance": 45
  }
}
```

### POST /v1/report

Reports protocol events that may affect a user's score.

**Request:**
```json
{
  "wallet": "0x1234...abcd",
  "protocol": "fairlend",
  "event": "loan_repaid",
  "amount": 5000,
  "timestamp": "2024-01-20T15:45:00Z"
}
```

## Signed Attestation Format

The attestation is a signed message that proves:
1. The FairScale backend verified the user's score
2. The credit terms are authentic and not spoofed
3. The attestation is fresh (expires after 24 hours)

**Message Structure:**
```solidity
bytes32 messageHash = keccak256(abi.encodePacked(
    walletAddress,
    maxLoan,
    collateralRatio,
    interestRate,
    expiry,
    fairScore,
    chainId,
    contractAddress
));
```

**Contract Verification:**
```solidity
bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
address signer = ethSignedHash.recover(signature);
require(signer == fairScaleSigner, "Invalid signature");
```

## Why FairScore Over Alternatives?

| Alternative | Problem | FairScore Advantage |
|-------------|---------|---------------------|
| **KYC** | Privacy-violating, excludes unbanked, slow | Permissionless, instant, global |
| **Overcollateralization** | Capital inefficient, treats everyone the same | Rewards good behavior with better terms |
| **Social vouching** | Gameable, not quantified | Objective, on-chain, verifiable |
| **Manual whitelists** | Doesn't scale, centralized | Automated, decentralized, composable |

## Security Considerations

1. **Signature Verification** — All attestations are cryptographically signed and verified on-chain
2. **Expiry** — Attestations expire after 24 hours to ensure fresh data
3. **Chain ID** — Signatures include chain ID to prevent cross-chain replay
4. **Contract Address** — Signatures include contract address to prevent use on unauthorized contracts

## Error Handling

If the FairScale API is unavailable:
1. Backend returns cached score if available (< 1 hour old)
2. If no cache, returns error asking user to retry
3. Users cannot update credit limits during outage
4. Existing loans continue to function normally

## Rate Limits

- API calls: 100/minute per API key
- Attestation generation: 10/minute per wallet

## Support

For FairScale API issues:
- Telegram: https://t.me/+XF23ay9aY1AzYzlk
- Documentation: https://swagger.api.fairscale.xyz/
