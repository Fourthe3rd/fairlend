import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ============ Configuration ============

const PORT = process.env.PORT || 3001;
const FAIRSCALE_API_URL = 'https://api2.fairscale.xyz'; // Production Solana API
const FAIRSCALE_API_KEY = process.env.FAIRSCALE_API_KEY || '';
const ATTESTATION_SIGNER_KEY = process.env.ATTESTATION_SIGNER_KEY || '';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '8453'); // Base mainnet for our contracts
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const ATTESTATION_VALIDITY_HOURS = 24;

// ============ Types ============

interface FairScoreResponse {
  wallet: string;
  fairscore_base: number;
  social_score: number;
  fairscore: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  timestamp: string;
  badges: Array<{
    id: string;
    label: string;
    description: string;
    tier: string;
  }>;
  features: {
    lst_percentile_score: number;
    major_percentile_score: number;
    native_sol_percentile: number;
    stable_percentile_score: number;
    tx_count: number;
    active_days: number;
    median_gap_hours: number;
    tempo_cv: number;
    burst_ratio: number;
    net_sol_flow_30d: number;
    median_hold_days: number;
    no_instant_dumps: number;
    conviction_ratio: number;
    platform_diversity: number;
    wallet_age_days: number;
  };
}

interface CreditTerms {
  maxLoan: bigint;
  collateralRatio: number;
  interestRate: number;
  expiry: number;
  fairScore: number;
}

interface AttestationResponse {
  wallet: string;
  fairScore: number;
  tier: string;
  terms: {
    maxLoan: string;
    collateralRatio: number;
    interestRate: number;
    expiry: number;
  };
  signature: string;
  chainId: number;
  contract: string;
}

// ============ FairScale API Service ============

async function getFairScore(walletAddress: string): Promise<FairScoreResponse> {
  try {
    // Check if API key is set
    if (!FAIRSCALE_API_KEY) {
      console.log('⚠️  No FairScale API key set, using mock score');
      return getMockFairScore(walletAddress);
    }

    // Call the FairScale API with correct header
    const response = await axios.get(
      `${FAIRSCALE_API_URL}/score`,
      {
        params: { wallet: walletAddress },
        headers: {
          'fairkey': FAIRSCALE_API_KEY,  // Correct header name
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('FairScale API error:', error?.response?.data || error.message);
    // Fallback to mock for development
    return getMockFairScore(walletAddress);
  }
}

// Get just the FairScore number (simpler endpoint)
async function getFairScoreOnly(walletAddress: string): Promise<number> {
  try {
    if (!FAIRSCALE_API_KEY) {
      const mock = getMockFairScore(walletAddress);
      return mock.fairscore;
    }

    const response = await axios.get(
      `${FAIRSCALE_API_URL}/fairScore`,
      {
        params: { wallet: walletAddress },
        headers: { 'fairkey': FAIRSCALE_API_KEY }
      }
    );

    return response.data.fair_score;
  } catch (error) {
    console.error('FairScale API error:', error);
    return getMockFairScore(walletAddress).fairscore;
  }
}

function getMockFairScore(walletAddress: string): FairScoreResponse {
  // Generate deterministic mock score based on wallet address
  const hash = ethers.keccak256(ethers.toUtf8Bytes(walletAddress));
  const hashNum = parseInt(hash.slice(2, 10), 16);
  const baseScore = 20 + (hashNum % 80); // Base score 20-100
  const socialScore = 10 + (hashNum % 50); // Social score 10-60
  const fairscore = baseScore + (socialScore * 0.3); // Combined

  let tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  if (fairscore >= 80) tier = 'platinum';
  else if (fairscore >= 60) tier = 'gold';
  else if (fairscore >= 40) tier = 'silver';
  else tier = 'bronze';

  return {
    wallet: walletAddress,
    fairscore_base: baseScore,
    social_score: socialScore,
    fairscore: Math.round(fairscore * 10) / 10,
    tier,
    timestamp: new Date().toISOString(),
    badges: [],
    features: {
      lst_percentile_score: Math.random() * 100,
      major_percentile_score: Math.random() * 100,
      native_sol_percentile: Math.random() * 100,
      stable_percentile_score: Math.random() * 100,
      tx_count: Math.floor(Math.random() * 1000),
      active_days: Math.floor(Math.random() * 365),
      median_gap_hours: Math.random() * 48,
      tempo_cv: Math.random(),
      burst_ratio: Math.random(),
      net_sol_flow_30d: (Math.random() - 0.5) * 100,
      median_hold_days: Math.floor(Math.random() * 90),
      no_instant_dumps: Math.random() > 0.5 ? 1 : 0,
      conviction_ratio: Math.random(),
      platform_diversity: Math.floor(Math.random() * 10),
      wallet_age_days: Math.floor(Math.random() * 730)
    }
  };
}

// ============ Credit Terms Calculator ============

/**
 * FairScale scores are on a 0-100 scale with tiers:
 * - platinum: 80+
 * - gold: 60-79
 * - silver: 40-59
 * - bronze: <40
 * 
 * We map these to lending terms accordingly.
 */
function calculateCreditTerms(fairScore: number): CreditTerms {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + (ATTESTATION_VALIDITY_HOURS * 60 * 60);

  // Normalize score to integer for contract (multiply by 10 for precision)
  const scoreForContract = Math.round(fairScore * 10);

  // Platinum: 80+
  if (fairScore >= 80) {
    return {
      maxLoan: ethers.parseUnits('50000', 6), // 50k USDC
      collateralRatio: 10000, // 100%
      interestRate: 800,      // 8% APY
      expiry,
      fairScore: scoreForContract
    };
  }

  // Gold: 60-79
  if (fairScore >= 60) {
    return {
      maxLoan: ethers.parseUnits('25000', 6), // 25k USDC
      collateralRatio: 12000, // 120%
      interestRate: 1000,     // 10% APY
      expiry,
      fairScore: scoreForContract
    };
  }

  // Silver: 40-59
  if (fairScore >= 40) {
    return {
      maxLoan: ethers.parseUnits('10000', 6), // 10k USDC
      collateralRatio: 13500, // 135%
      interestRate: 1200,     // 12% APY
      expiry,
      fairScore: scoreForContract
    };
  }

  // Bronze: 20-39
  if (fairScore >= 20) {
    return {
      maxLoan: ethers.parseUnits('5000', 6), // 5k USDC
      collateralRatio: 15000, // 150%
      interestRate: 1400,     // 14% APY
      expiry,
      fairScore: scoreForContract
    };
  }

  // Very low score: <20
  return {
    maxLoan: ethers.parseUnits('1000', 6), // 1k USDC
    collateralRatio: 17500, // 175%
    interestRate: 1600,     // 16% APY
    expiry,
    fairScore: scoreForContract
  };
}

function getTierName(fairScore: number): string {
  if (fairScore >= 80) return 'platinum';
  if (fairScore >= 60) return 'gold';
  if (fairScore >= 40) return 'silver';
  return 'bronze';
}

// ============ Attestation Signer ============

async function signAttestation(
  wallet: string,
  terms: CreditTerms
): Promise<string> {
  if (!ATTESTATION_SIGNER_KEY) {
    throw new Error('Attestation signer key not configured');
  }

  const signer = new ethers.Wallet(ATTESTATION_SIGNER_KEY);

  // Message must match contract exactly
  const messageHash = ethers.solidityPackedKeccak256(
    ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'address'],
    [
      wallet,
      terms.maxLoan,
      terms.collateralRatio,
      terms.interestRate,
      terms.expiry,
      terms.fairScore,
      CHAIN_ID,
      CONTRACT_ADDRESS
    ]
  );

  const signature = await signer.signMessage(ethers.getBytes(messageHash));
  return signature;
}

// ============ API Routes ============

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    chainId: CHAIN_ID,
    contract: CONTRACT_ADDRESS || 'not set',
    fairscaleApi: FAIRSCALE_API_URL
  });
});

// Get FairScore for a wallet (supports both Solana and EVM addresses)
app.get('/api/score/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    // Basic validation (Solana addresses are base58, ~44 chars)
    if (!wallet || wallet.length < 32) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const scoreData = await getFairScore(wallet);
    const terms = calculateCreditTerms(scoreData.fairscore);

    res.json({
      wallet: scoreData.wallet,
      fairScore: scoreData.fairscore,
      fairScoreBase: scoreData.fairscore_base,
      socialScore: scoreData.social_score,
      tier: scoreData.tier,
      timestamp: scoreData.timestamp,
      badges: scoreData.badges,
      features: scoreData.features,
      creditTerms: {
        maxLoan: ethers.formatUnits(terms.maxLoan, 6),
        maxLoanRaw: terms.maxLoan.toString(),
        collateralRatio: terms.collateralRatio / 100, // Convert to percentage
        interestRate: terms.interestRate / 100,       // Convert to percentage
      }
    });
  } catch (error) {
    console.error('Score fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch FairScore' });
  }
});

// Get signed attestation for credit limit update
app.get('/api/attestation/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    if (!wallet || wallet.length < 32) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (!ATTESTATION_SIGNER_KEY) {
      return res.status(500).json({ error: 'Attestation signing not configured' });
    }

    if (!CONTRACT_ADDRESS) {
      return res.status(500).json({ error: 'Contract address not configured' });
    }

    // Fetch FairScore from FairScale API
    const scoreData = await getFairScore(wallet);
    
    // Check minimum score (20 on 0-100 scale)
    if (scoreData.fairscore < 20) {
      return res.status(400).json({ 
        error: 'FairScore too low',
        score: scoreData.fairscore,
        minimumRequired: 20
      });
    }

    // Calculate credit terms
    const terms = calculateCreditTerms(scoreData.fairscore);

    // Sign attestation
    const signature = await signAttestation(wallet, terms);

    const response: AttestationResponse = {
      wallet,
      fairScore: scoreData.fairscore,
      tier: scoreData.tier,
      terms: {
        maxLoan: terms.maxLoan.toString(),
        collateralRatio: terms.collateralRatio,
        interestRate: terms.interestRate,
        expiry: terms.expiry
      },
      signature,
      chainId: CHAIN_ID,
      contract: CONTRACT_ADDRESS
    };

    res.json(response);
  } catch (error) {
    console.error('Attestation error:', error);
    res.status(500).json({ error: 'Failed to generate attestation' });
  }
});

// Report loan outcome (for updating reputation)
app.post('/api/report', async (req, res) => {
  try {
    const { wallet, outcome, loanId, amount } = req.body;

    if (!wallet || !outcome || !loanId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['repaid', 'defaulted'].includes(outcome)) {
      return res.status(400).json({ error: 'Invalid outcome' });
    }

    // Note: FairScale may add a reporting endpoint in the future
    // For now, we log locally and can batch report later
    console.log(`📊 Loan outcome: ${wallet} - ${outcome} - Loan #${loanId} - $${amount}`);

    res.json({ 
      success: true, 
      message: `Loan ${outcome} recorded`,
      wallet,
      loanId,
      outcome
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Failed to report outcome' });
  }
});

// Get protocol stats
app.get('/api/stats', (req, res) => {
  // In production, fetch from subgraph or contract
  res.json({
    tvl: '0',
    totalLoans: 0,
    activeLoans: 0,
    defaultRate: '0%',
    averageFairScore: 0
  });
});

// Test the FairScale API connection
app.get('/api/test-fairscale', async (req, res) => {
  try {
    const testWallet = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'; // Example from docs
    const scoreData = await getFairScore(testWallet);
    res.json({
      success: true,
      testWallet,
      result: scoreData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============ Start Server ============

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   FairLend Backend API                    ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port ${PORT}                              ║
║  Chain ID: ${CHAIN_ID}                                         ║
║  Contract: ${CONTRACT_ADDRESS || 'Not configured'}
║  FairScale API: ${FAIRSCALE_API_KEY ? '✓ Configured' : '✗ Using mock data'}
║  Signer: ${ATTESTATION_SIGNER_KEY ? '✓ Configured' : '✗ Not configured'}
╚═══════════════════════════════════════════════════════════╝

Endpoints:
  GET  /health                    - Health check
  GET  /api/score/:wallet         - Get FairScore and credit terms
  GET  /api/attestation/:wallet   - Get signed attestation for contract
  POST /api/report                - Report loan outcome
  GET  /api/stats                 - Protocol statistics
  `);
});

export default app;
