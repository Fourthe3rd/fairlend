'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import Link from 'next/link';

export default function LendPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'senior' | 'junior'>('senior');
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsDepositing(true);
    
    // Simulate transaction for now
    // In production: call contract depositSenior() or depositJunior()
    setTimeout(() => {
      setIsDepositing(false);
      setSuccess(true);
      setAmount('');
    }, 2000);
  };

  const poolData = {
    senior: {
      name: 'Senior Pool',
      description: 'Lower risk, stable returns. Protected from first losses.',
      apy: '6-8%',
      tvl: '$0',
      risk: 'Lower',
      color: 'emerald'
    },
    junior: {
      name: 'Junior Pool', 
      description: 'Higher risk, higher returns. First to absorb losses.',
      apy: '12-15%',
      tvl: '$0',
      risk: 'Higher',
      color: 'orange'
    }
  };

  const currentPool = poolData[activeTab];

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
                <Link href="/app/lend" className="text-emerald-400 font-medium">Lend</Link>
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
            <p className="text-gray-400 mb-8">Connect to start earning yield</p>
            <ConnectButton />
          </div>
        ) : success ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">Deposit Successful!</h1>
            <p className="text-gray-400 mb-8">
              You're now earning yield in the {currentPool.name}.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition"
              >
                Deposit More
              </button>
              <Link
                href="/app"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Lend</h1>
              <p className="text-gray-400">Earn yield by providing liquidity to borrowers</p>
            </div>

            {/* Pool Tabs */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab('senior')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition ${
                  activeTab === 'senior'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🛡️ Senior Pool
              </button>
              <button
                onClick={() => setActiveTab('junior')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition ${
                  activeTab === 'junior'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🔥 Junior Pool
              </button>
            </div>

            {/* Pool Info Card */}
            <div className={`bg-gray-800/50 border ${activeTab === 'senior' ? 'border-emerald-500/30' : 'border-orange-500/30'} rounded-2xl p-6 mb-6`}>
              <h2 className="text-xl font-semibold text-white mb-2">{currentPool.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{currentPool.description}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">APY</p>
                  <p className={`text-xl font-bold ${activeTab === 'senior' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {currentPool.apy}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">TVL</p>
                  <p className="text-xl font-bold text-white">{currentPool.tvl}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Risk</p>
                  <p className={`text-xl font-bold ${activeTab === 'senior' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {currentPool.risk}
                  </p>
                </div>
              </div>
            </div>

            {/* Deposit Form */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Deposit USDC</h3>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    USDC
                  </span>
                </div>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="bg-gray-900 rounded-xl p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Estimated APY</span>
                    <span className={activeTab === 'senior' ? 'text-emerald-400' : 'text-orange-400'}>
                      {currentPool.apy}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Est. Monthly Earnings</span>
                    <span className="text-white">
                      ${(parseFloat(amount) * (activeTab === 'senior' ? 0.07 : 0.13) / 12).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0 || isDepositing}
                className={`w-full py-4 font-semibold rounded-xl transition flex items-center justify-center ${
                  activeTab === 'senior'
                    ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700'
                    : 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700'
                } disabled:cursor-not-allowed text-white`}
              >
                {isDepositing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Deposit to ${currentPool.name}`
                )}
              </button>
            </div>

            {/* Risk Warning */}
            {activeTab === 'junior' && (
              <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <p className="text-orange-400 text-sm">
                  ⚠️ <strong>Higher Risk:</strong> Junior pool deposits absorb losses first if borrowers default. Only deposit what you can afford to lose.
                </p>
              </div>
            )}

            {activeTab === 'senior' && (
              <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-400 text-sm">
                  🛡️ <strong>Protected:</strong> Senior pool is protected by borrower collateral, voucher stakes, insurance fund, and junior pool.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}