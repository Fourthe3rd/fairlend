'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FairScoreData {
  fairScore: number;
  tier: string;
  creditTerms: {
    maxLoan: string;
    maxLoanRaw: string;
    collateralRatio: number;
    interestRate: number;
  };
}

interface AttestationData {
  terms: {
    maxLoan: string;
    collateralRatio: number;
    interestRate: number;
    expiry: number;
  };
  signature: string;
}

export default function BorrowPage() {
  const { address, isConnected } = useAccount();
  const [scoreData, setScoreData] = useState<FairScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');

  useEffect(() => {
    if (address) {
      fetchFairScore(address);
    }
  }, [address]);

  async function fetchFairScore(wallet: string) {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/score/${wallet}`);
      const data = await response.json();
      setScoreData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const collateralRequired = scoreData && borrowAmount
    ? (parseFloat(borrowAmount) * scoreData.creditTerms.collateralRatio / 100).toFixed(2)
    : '0';

  const estimatedInterest = scoreData && borrowAmount
    ? (parseFloat(borrowAmount) * scoreData.creditTerms.interestRate / 100 * parseInt(duration) / 365).toFixed(2)
    : '0';

  const handleBorrow = async () => {
    if (!address || !scoreData) return;
    
    setStep('confirm');
    
    // In production: 
    // 1. Fetch attestation from backend
    // 2. Call updateCreditLimit on contract
    // 3. Approve collateral token
    // 4. Call borrow() on contract
    
    // For demo, simulate success
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'gold': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'silver': return 'text-gray-300 bg-gray-500/10 border-gray-500/20';
      case 'bronze': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
                <span className="text-white font-semibold text-xl">FairLend</span>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/app" className="text-gray-300 hover:text-white transition">Dashboard</Link>
                <Link href="/app/borrow" className="text-emerald-400 font-medium">Borrow</Link>
                <Link href="/app/lend" className="text-gray-300 hover:text-white transition">Lend</Link>
                <Link href="/app/vouch" className="text-gray-300 hover:text-white transition">Vouch</Link>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="text-6xl mb-6">🔗</div>
            <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-400 mb-8">Connect to view your borrowing terms</p>
            <ConnectButton />
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-6"></div>
            <p className="text-gray-400">Loading your credit limit...</p>
          </div>
        ) : step === 'success' ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">Loan Requested!</h1>
            <p className="text-gray-400 mb-8">
              Your loan request for ${borrowAmount} USDC has been submitted.
            </p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Amount</p>
                  <p className="text-white font-medium">${borrowAmount} USDC</p>
                </div>
                <div>
                  <p className="text-gray-400">Collateral</p>
                  <p className="text-white font-medium">{collateralRequired} ETH</p>
                </div>
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="text-white font-medium">{duration} days</p>
                </div>
                <div>
                  <p className="text-gray-400">Interest</p>
                  <p className="text-white font-medium">${estimatedInterest} USDC</p>
                </div>
              </div>
            </div>
            <Link
              href="/app"
              className="inline-flex px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Borrow</h1>
              <p className="text-gray-400">Get an undercollateralized loan based on your FairScore</p>
            </div>

            {/* Credit Info Card */}
            {scoreData && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Your FairScore</p>
                    <p className="text-2xl font-bold text-white">{scoreData.fairScore}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full border capitalize font-medium ${getTierColor(scoreData.tier)}`}>
                    {scoreData.tier}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-gray-400 text-xs">Max Loan</p>
                    <p className="text-white font-medium">${scoreData.creditTerms.maxLoan}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Collateral</p>
                    <p className="text-emerald-400 font-medium">{scoreData.creditTerms.collateralRatio}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Rate</p>
                    <p className="text-white font-medium">{scoreData.creditTerms.interestRate}% APY</p>
                  </div>
                </div>
              </div>
            )}

            {/* Borrow Form */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Borrow Amount (USDC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      placeholder="0.00"
                      max={scoreData?.creditTerms.maxLoan}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setBorrowAmount(scoreData?.creditTerms.maxLoan || '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-sm font-medium hover:text-emerald-300"
                    >
                      MAX
                    </button>
                  </div>
                  {scoreData && (
                    <p className="text-gray-500 text-xs mt-2">
                      Max: ${scoreData.creditTerms.maxLoan} USDC
                    </p>
                  )}
                </div>

                {/* Duration Select */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Loan Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>

                {/* Summary */}
                {borrowAmount && parseFloat(borrowAmount) > 0 && (
                  <div className="bg-gray-900 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Collateral Required</span>
                      <span className="text-white">{collateralRequired} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Interest ({duration} days)</span>
                      <span className="text-white">${estimatedInterest} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t border-gray-700">
                      <span className="text-gray-400">Total Repayment</span>
                      <span className="text-white font-medium">
                        ${(parseFloat(borrowAmount) + parseFloat(estimatedInterest)).toFixed(2)} USDC
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleBorrow}
                  disabled={!borrowAmount || parseFloat(borrowAmount) <= 0 || step === 'confirm'}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center"
                >
                  {step === 'confirm' ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Request Loan'
                  )}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-400 text-sm">
                💡 Your collateral will be locked until repayment. Repaying on time improves your FairScore for better future terms.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
