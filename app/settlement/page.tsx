'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { Badge } from '@/components/ui/Badge'
import { BrutalInput } from '@/components/ui/BrutalInput'

interface SettledBid {
  id: string
  amount: number
  riskPercent: number
  prediction: 'YES' | 'NO'
  status: 'WON' | 'LOST' | 'PENDING'
  outcome: number // Payout or loss amount
  payout: number // Final amount user receives
  project: {
    id: string
    title: string
    status: 'OPEN' | 'FUNDED' | 'CLOSED'
  }
  createdAt: string
  settledAt?: string
}

function SettlementCard({ bid }: { bid: SettledBid }) {
  const isWin = bid.status === 'WON'
  const profitLoss = bid.payout - bid.amount
  const profitPercent = ((profitLoss / bid.amount) * 100).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <Link href={`/settlement/${bid.id}`}>
        <BrutalCard
          className={`p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
            isWin
              ? 'border-green-500 bg-green-500/5'
              : bid.status === 'LOST'
                ? 'border-red-500 bg-red-500/5'
                : 'border-yellow-500 bg-yellow-500/5'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-white">{bid.project.title}</h3>
                <Badge
                  variant={
                    bid.project.status === 'FUNDED'
                      ? 'success'
                      : bid.project.status === 'CLOSED'
                        ? 'danger'
                        : 'info'
                  }
                  className="text-xs"
                >
                  {bid.project.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                Prediction: {bid.prediction === 'YES' ? '✓ Project succeeds' : '✗ Project fails'}
              </p>
            </div>

            <div className="text-right">
              <div
                className={`text-3xl font-black mb-2 ${
                  isWin ? 'text-green-400' : bid.status === 'LOST' ? 'text-red-400' : 'text-blue-400'
                }`}
              >
                {isWin ? '+' : bid.status === 'LOST' ? '−' : ''}$
                {(Math.abs(profitLoss) / 1000).toFixed(2)}K
              </div>
              <p
                className={`text-sm font-bold ${
                  isWin ? 'text-green-400' : bid.status === 'LOST' ? 'text-red-400' : 'text-blue-400'
                }`}
              >
                {profitPercent}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-400 mb-1">Your Bid</p>
              <p className="font-bold text-white">${(bid.amount / 1000).toFixed(2)}K</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Risk</p>
              <p className="font-bold text-white">{bid.riskPercent}%</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Payout</p>
              <p className={`font-bold ${isWin ? 'text-green-400' : 'text-white'}`}>
                ${(bid.payout / 1000).toFixed(2)}K
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              {bid.settledAt
                ? `Settled ${new Date(bid.settledAt).toLocaleDateString()}`
                : 'Settlement pending'}
            </p>
            <Badge
              variant={
                isWin ? 'success' : bid.status === 'LOST' ? 'danger' : 'warning'
              }
            >
              {bid.status === 'PENDING' ? 'AWAITING SETTLEMENT' : bid.status}
            </Badge>
          </div>
        </BrutalCard>
      </Link>
    </motion.div>
  )
}

function SettlementHistoryContent() {
  const [bids, setBids] = useState<SettledBid[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'WON' | 'LOST' | 'PENDING'>('ALL')
  const [search, setSearch] = useState('')

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('supabase_token')
      if (!token) return

      const response = await fetch('/api/bids', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch bids')
      const data = await response.json()
      // Filter to only settled bids (status !== PENDING) and sort by date
      const settledBids = (data.bids || [])
        .sort(
          (a: SettledBid, b: SettledBid) =>
            new Date(b.settledAt || b.createdAt).getTime() -
            new Date(a.settledAt || a.createdAt).getTime()
        )
      setBids(settledBids)
    } catch (error) {
      console.error('Error fetching bids:', error)
      setBids([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBids()
  }, [fetchBids])

  const filteredBids = bids.filter((bid) => {
    const matchesFilter = filter === 'ALL' || bid.status === filter
    const matchesSearch =
      bid.project.title.toLowerCase().includes(search.toLowerCase()) ||
      bid.prediction.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Calculate stats
  const stats = {
    totalBids: bids.length,
    won: bids.filter((b) => b.status === 'WON').length,
    lost: bids.filter((b) => b.status === 'LOST').length,
    pending: bids.filter((b) => b.status === 'PENDING').length,
    totalProfit: bids
      .filter((b) => b.status !== 'PENDING')
      .reduce((sum, b) => sum + (b.payout - b.amount), 0),
    winRate: bids.filter((b) => b.status !== 'PENDING').length > 0
      ? (
          (bids.filter((b) => b.status === 'WON').length /
            bids.filter((b) => b.status !== 'PENDING').length) *
          100
        ).toFixed(1)
      : '0.0',
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">
            Settlement History
          </h1>
          <p className="text-gray-400 text-lg">Track your predictions and outcomes</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <BrutalCard className="p-6">
            <p className="text-gray-400 text-sm mb-2">Total Bids</p>
            <p className="text-3xl font-black text-cyan-400">{stats.totalBids}</p>
          </BrutalCard>

          <BrutalCard className="p-6">
            <p className="text-gray-400 text-sm mb-2">Won</p>
            <p className="text-3xl font-black text-green-400">{stats.won}</p>
          </BrutalCard>

          <BrutalCard className="p-6">
            <p className="text-gray-400 text-sm mb-2">Lost</p>
            <p className="text-3xl font-black text-red-400">{stats.lost}</p>
          </BrutalCard>

          <BrutalCard className="p-6">
            <p className="text-gray-400 text-sm mb-2">Win Rate</p>
            <p className="text-3xl font-black text-purple-400">{stats.winRate}%</p>
          </BrutalCard>

          <BrutalCard className={`p-6 ${stats.totalProfit >= 0 ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <p className={`text-3xl font-black ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.totalProfit >= 0 ? '+' : '−'}${(Math.abs(stats.totalProfit) / 1000).toFixed(2)}K
            </p>
          </BrutalCard>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BrutalInput
            type="text"
            placeholder="Search by project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />

          <div className="flex gap-3 flex-wrap">
            {(['ALL', 'WON', 'LOST', 'PENDING'] as const).map((s) => (
              <motion.button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 border-2 font-bold transition-all uppercase text-sm ${
                  filter === s
                    ? 'border-purple-500 bg-purple-500 text-black'
                    : 'border-gray-700 text-gray-400 hover:border-purple-500'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {s}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Bids List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading settlement history...</p>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {bids.length === 0 ? 'No bids placed yet' : 'No results found'}
            </p>
            {bids.length === 0 && (
              <Link href="/projects">
                <motion.button
                  className="mt-6 px-6 py-3 bg-purple-500 text-black font-bold border-2 border-purple-500"
                  whileHover={{ scale: 1.05 }}
                >
                  Browse Projects
                </motion.button>
              </Link>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {filteredBids.map((bid) => (
              <SettlementCard key={bid.id} bid={bid} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function SettlementHistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SettlementHistoryContent />
    </Suspense>
  )
}
