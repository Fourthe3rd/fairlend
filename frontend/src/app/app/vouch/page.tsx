'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FairScoreData {
  fairScore: number;
  tier: string;
}

export default function VouchPage() {
  const { address, isConnected } = useAccount();
  const [scoreData, setScoreData] = useState<FairScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [vouchAmount, setVouchAmount] = useState('');
  const [isVouching, setIsVouching] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const canVouch = scoreData && scoreData.fairScore >= 40;

  const handleVouch = async () => {
    if (!borrowerAddress || !vouchAmount || parseFloat(vouchAmount) <= 0) return;
    
    setIsVouching(true);
    
    // Simulate transaction for now
    // In production: call contract vouchFor()
    setTimeout(() => {
      setIsVouching(false);
      setSuccess(true);
      setBorrowerAddress('');
      setVouchAmount('');
    }, 2000);
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
                <Link href="/app/borrow" className="text-gray-300 hover:text-white transition">Borrow</Link>
                <Link href="/app/lend" className="text-gray-300 hover:text-white transition">Lend</Link>
                <Link href="/app/vouch" className="text-yellow-400 font-medium">Vouch</Link>
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
            <p className="text-gray-400 mb-8">Connect to vouch for borrowers</p>
            <ConnectButton />
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mb-6"></div>
            <p className="text-gray-400">Checking your eligibility...</p>
          </div>
        ) : success ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🤝</div>
            <h1 className="text-3xl font-bold text-white mb-4">Vouch Submitted!</h1>
            <p className="text-gray-400 mb-8">
              You're now vouching for this borrower. You'll earn rewards when they repay!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-xl transition"
              >
                Vouch for Another
              </button>
              <Link
                href="/app"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : !canVouch ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-4">FairScore Too Low</h1>
            <p className="text-gray-400 mb-4">
              You need a FairScore of at least <span className="text-yellow-400 font-bold">40</span> to vouch for others.
            </p>
            <p className="text-gray-500 mb-8">
              Your current score: <span className="text-white font-bold">{scoreData?.fairScore?.toFixed(1) || '—'}</span>
            </p>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-left max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">How to Improve Your Score</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Hold tokens long-term</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Use DeFi protocols regularly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Maintain consistent activity</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Don't dump tokens instantly</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Vouch</h1>
              <p className="text-gray-400">Stake to vouch for borrowers and earn rewards</p>
            </div>

            {/* Eligibility Card */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 text-sm font-medium">✓ Eligible to Vouch</p>
                  <p className="text-white text-lg font-bold">FairScore: {scoreData?.fairScore?.toFixed(1)}</p>
                </div>
                <div className="text-4xl">🤝</div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">How Vouching Works</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold">1</div>
                  <p className="text-gray-300">You stake USDC to vouch for a borrower</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold">2</div>
                  <p className="text-gray-300">If they <span className="text-emerald-400">repay</span>: You earn 10% of the interest</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold">3</div>
                  <p className="text-gray-300">If they <span className="text-red-400">default</span>: Your stake is slashed</p>
                </div>
              </div>
            </div>

            {/* Vouch Form */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vouch for a Borrower</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Borrower Address
                  </label>
                  <input
                    type="text"
                    value={borrowerAddress}
                    onChange={(e) => setBorrowerAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Stake Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={vouchAmount}
                    onChange={(e) => setVouchAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                {vouchAmount && parseFloat(vouchAmount) > 0 && (
                  <div className="bg-gray-900 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Your Stake</span>
                      <span className="text-white">${vouchAmount} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Potential Reward (if repaid)</span>
                      <span className="text-emerald-400">~${(parseFloat(vouchAmount) * 0.1).toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Risk (if default)</span>
                      <span className="text-red-400">-${vouchAmount} USDC</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleVouch}
                  disabled={!borrowerAddress || !vouchAmount || parseFloat(vouchAmount) <= 0 || isVouching}
                  className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition flex items-center justify-center"
                >
                  {isVouching ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    '🤝 Vouch for Borrower'
                  )}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm">
                ⚠️ <strong>Risk Warning:</strong> Only vouch for people you trust. If they default, you lose your entire stake.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}