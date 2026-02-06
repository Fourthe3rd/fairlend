'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="text-white font-semibold text-xl">FairLend</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/app" className="text-gray-300 hover:text-white transition">
                Launch App
              </Link>
              <a href="https://docs.fairlend.xyz" className="text-gray-300 hover:text-white transition">
                Docs
              </a>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <span className="text-emerald-400 text-sm font-medium">
              Powered by FairScale Reputation
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your On-Chain History
            <br />
            <span className="text-emerald-400">Is Your Credit Score</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Borrow crypto with less collateral based on your FairScore. 
            No banks, no KYC, just your wallet history.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition transform hover:scale-105"
            >
              Check Your Borrowing Power
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition border border-gray-700"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Total Value Locked', value: '$0', subtext: 'Launching soon' },
              { label: 'Loans Originated', value: '0', subtext: 'Be first' },
              { label: 'Default Rate', value: '0%', subtext: 'Protected by reputation' },
              { label: 'Avg FairScore', value: '—', subtext: 'Your score matters' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
                <div className="text-emerald-500 text-xs mt-1">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            How FairLend Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Connect Wallet',
                description: 'Link your wallet and we fetch your FairScore from your on-chain history.',
                icon: '🔗',
              },
              {
                step: '2',
                title: 'See Your Terms',
                description: 'Higher FairScore = lower collateral requirements and better interest rates.',
                icon: '📊',
              },
              {
                step: '3',
                title: 'Borrow & Repay',
                description: 'Get your loan instantly. Repay on time to build your reputation.',
                icon: '💰',
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 hover:border-emerald-500/50 transition">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-emerald-400 text-sm font-medium mb-2">Step {item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier Table */}
      <section className="py-24 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            FairScore Tiers
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Your reputation unlocks better terms
          </p>

          <div className="overflow-hidden rounded-2xl border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">FairScore</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Collateral</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Max Loan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { tier: 'Platinum', score: '80+', collateral: '100%', maxLoan: '$50,000', color: 'text-purple-400' },
                  { tier: 'Gold', score: '60-79', collateral: '120%', maxLoan: '$25,000', color: 'text-yellow-400' },
                  { tier: 'Silver', score: '40-59', collateral: '135%', maxLoan: '$10,000', color: 'text-gray-300' },
                  { tier: 'Bronze', score: '20-39', collateral: '150%', maxLoan: '$5,000', color: 'text-orange-400' },
                ].map((row, i) => (
                  <tr key={i} className="bg-gray-800/30 hover:bg-gray-800/50 transition">
                    <td className={`px-6 py-4 font-semibold ${row.color}`}>{row.tier}</td>
                    <td className="px-6 py-4 text-white">{row.score}</td>
                    <td className="px-6 py-4 text-emerald-400">{row.collateral}</td>
                    <td className="px-6 py-4 text-white">{row.maxLoan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to unlock your borrowing power?
          </h2>
          <p className="text-gray-400 mb-10">
            Connect your wallet to see what your on-chain reputation is worth.
          </p>
          <Link
            href="/app"
            className="inline-flex px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition transform hover:scale-105"
          >
            Launch App →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-gray-400">FairLend © 2024</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="https://twitter.com/FairLendXYZ" className="text-gray-400 hover:text-white transition">
              Twitter
            </a>
            <a href="https://github.com/fairscale/fairlend" className="text-gray-400 hover:text-white transition">
              GitHub
            </a>
            <a href="https://t.me/fairlend" className="text-gray-400 hover:text-white transition">
              Telegram
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
