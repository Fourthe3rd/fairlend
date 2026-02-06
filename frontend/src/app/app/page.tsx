'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FairScoreData {
  fairScore: number;
  fairScoreBase: number;
  socialScore: number;
  tier: string;
  badges: Array<{
    id: string;
    label: string;
    description: string;
    tier: string;
  }>;
  creditTerms: {
    maxLoan: string;
    collateralRatio: number;
    interestRate: number;
  };
}

export default function AppDashboard() {
  const { address, isConnected } = useAccount();
  const [scoreData, setScoreData] = useState<FairScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchFairScore(address);
    }
  }, [address]);

  async function fetchFairScore(wallet: string) {
    setLoading(true);
    setError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/score/${wallet}`);
      if (!response.ok) throw new Error('Failed to fetch score');
      const data = await response.json();
      setScoreData(data);
    } catch (err) {
      setError('Failed to fetch FairScore. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'from-purple-500 to-purple-700';
      case 'gold': return 'from-yellow-500 to-yellow-700';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'bronze': return 'from-orange-500 to-orange-700';
      default: return 'from-gray-600 to-gray-800';
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
                <Link href="/app" className="text-emerald-400 font-medium">Dashboard</Link>
                <Link href="/app/borrow" className="text-gray-300 hover:text-white transition">Borrow</Link>
                <Link href="/app/lend" className="text-gray-300 hover:text-white transition">Lend</Link>
                <Link href="/app/vouch" className="text-gray-300 hover:text-white transition">Vouch</Link>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-6xl mb-6">🔗</div>
            <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-400 mb-8 text-center max-w-md">
              Connect your wallet to view your FairScore and access undercollateralized lending.
            </p>
            <ConnectButton />
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-6"></div>
            <p className="text-gray-400">Fetching your FairScore...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <button
              onClick={() => address && fetchFairScore(address)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition"
            >
              Try Again
            </button>
          </div>
        ) : scoreData ? (
          <div className="space-y-8">
            {/* Score Card */}
            <div className={`bg-gradient-to-r ${getTierColor(scoreData.tier)} rounded-3xl p-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-2">Your FairScore</p>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-6xl font-bold text-white">{scoreData.fairScore.toFixed(1)}</span>
                      <span className="text-2xl text-white/80 capitalize">{scoreData.tier}</span>
                    </div>
                    <div className="mt-2 text-white/60 text-sm">
                      Base: {scoreData.fairScoreBase?.toFixed(1) || '—'} | Social: {scoreData.socialScore || '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm mb-1">Wallet</p>
                    <p className="text-white font-mono text-sm">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                </div>
                
                {/* Badges */}
                {scoreData.badges && scoreData.badges.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scoreData.badges.map((badge, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-white/20 rounded-full text-white text-sm"
                        title={badge.description}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-white/80 text-sm">Max Loan</p>
                    <p className="text-2xl font-bold text-white">${scoreData.creditTerms.maxLoan}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Collateral Required</p>
                    <p className="text-2xl font-bold text-white">{scoreData.creditTerms.collateralRatio}%</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Interest Rate</p>
                    <p className="text-2xl font-bold text-white">{scoreData.creditTerms.interestRate}% APY</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Score Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Wallet Score</p>
                  <p className="text-2xl font-bold text-white">{scoreData.fairScoreBase?.toFixed(1) || '—'}</p>
                  <p className="text-emerald-400 text-xs">On-chain activity</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Social Score</p>
                  <p className="text-2xl font-bold text-white">{scoreData.socialScore || '—'}</p>
                  <p className="text-emerald-400 text-xs">Social reputation</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Combined</p>
                  <p className="text-2xl font-bold text-white">{scoreData.fairScore.toFixed(1)}</p>
                  <p className="text-emerald-400 text-xs">Final FairScore</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/app/borrow"
                className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-emerald-500/50 transition group"
              >
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition">
                  Borrow
                </h3>
                <p className="text-gray-400 text-sm">
                  Get an undercollateralized loan based on your FairScore
                </p>
              </Link>
              
              <Link
                href="/app/lend"
                className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-emerald-500/50 transition group"
              >
                <div className="text-3xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition">
                  Lend
                </h3>
                <p className="text-gray-400 text-sm">
                  Earn yield by providing liquidity to lending pools
                </p>
              </Link>
              
              <Link
                href="/app/vouch"
                className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-emerald-500/50 transition group"
              >
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition">
                  Vouch
                </h3>
                <p className="text-gray-400 text-sm">
                  Stake to vouch for borrowers and earn rewards
                </p>
              </Link>
            </div>

            {/* Active Positions */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Your Positions</h2>
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📋</div>
                <p>No active positions yet</p>
                <p className="text-sm mt-2">Borrow, lend, or vouch to get started</p>
              </div>
            </div>

            {/* Reputation Tips */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                💡 Improve Your FairScore
              </h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start space-x-3">
                  <span className="text-emerald-400">✓</span>
                  <span>Repay loans on time to build positive history</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-emerald-400">✓</span>
                  <span>Hold tokens long-term to show conviction</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-emerald-400">✓</span>
                  <span>Maintain consistent on-chain activity</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-emerald-400">✓</span>
                  <span>Use diverse DeFi platforms to show experience</span>
                </li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
