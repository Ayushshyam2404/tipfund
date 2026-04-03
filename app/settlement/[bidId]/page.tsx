'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { Badge } from '@/components/ui/Badge'

interface BidSettlement {
  id: string
  amount: number
  riskPercent: number
  prediction: 'YES' | 'NO'
  status: 'WON' | 'LOST' | 'PENDING'
  outcome: number
  payout: number
  project: {
    id: string
    title: string
    description: string
    status: 'OPEN' | 'FUNDED' | 'CLOSED'
    fundingGoal: number
    totalFunded: number
  }
  bidder: {
    email: string
  }
  createdAt: string
  settledAt?: string
}

function SettlementDetailContent() {
  const params = useParams()
  const bidId = params.bidId as string
  const [bid, setBid] = useState<BidSettlement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    const fetchBid = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('supabase_token')
        if (!token) {
          setError('Not authenticated')
          return
        }

        const response = await fetch(`/api/bids?bidId=${bidId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch bid')
        const data = await response.json()

        // Find the specific bid
        const foundBid = data.bids?.find((b: BidSettlement) => b.id === bidId)
        if (!foundBid) throw new Error('Bid not found')

        setBid(foundBid)
        // Trigger celebration animation for wins after 500ms
        if (foundBid.status === 'WON') {
          setTimeout(() => setShowCelebration(true), 500)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settlement')
      } finally {
        setLoading(false)
      }
    }

    fetchBid()
  }, [bidId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading settlement details...</p>
      </div>
    )
  }

  if (error || !bid) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-400 mb-6">{error || 'Settlement not found'}</p>
          <Link href="/settlement">
            <BrutalButton variant="primary">Back to History</BrutalButton>
          </Link>
        </div>
      </div>
    )
  }

  const isWin = bid.status === 'WON'
  const profitLoss = bid.payout - bid.amount
  const profitPercent = ((profitLoss / bid.amount) * 100).toFixed(1)
  const fundingPercent = (bid.project.totalFunded / bid.project.fundingGoal) * 100

  const settlementReason = (() => {
    if (bid.project.status === 'FUNDED') {
      return bid.prediction === 'YES'
        ? 'Project reached funding goal - your YES prediction WIN'
        : 'Project reached funding goal - your NO prediction LOST'
    } else if (bid.project.status === 'CLOSED') {
      return bid.prediction === 'NO'
        ? 'Project failed to fund - your NO prediction WIN'
        : 'Project failed to fund - your YES prediction LOST'
    }
    return 'Settlement pending'
  })()

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      {/* Celebration/Disappointment Animations */}
      <AnimatePresence>
        {showCelebration && isWin && (
          <>
            {Array.from({ length: 20 }, (_, i) => {
              const maxWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
              const maxHeight = typeof window !== 'undefined' ? window.innerHeight : 800
              return (
                <motion.div
                  key={`confetti-${i}`}
                  className="fixed pointer-events-none"
                  initial={{
                    x: Math.random() * maxWidth,
                    y: -20,
                    opacity: 1,
                  }}
                  animate={{
                    y: maxHeight + 20,
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 0.5,
                    ease: 'easeIn',
                  }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-3xl">
                    {['🎉', '✨', '⭐', '💫', '🌟', '💎'][Math.floor(Math.random() * 6)]}
                  </span>
                </motion.div>
              )
            })}
          </>
        )}

        {bid.status === 'LOST' && !showCelebration && (
          <>
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={`sad-${i}`}
                className="fixed pointer-events-none left-1/2 top-1/3"
                initial={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: 0,
                  x: (Math.random() - 0.5) * 300,
                  y: 150 + Math.random() * 150,
                  rotate: Math.random() * 180 - 90,
                }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                }}
                exit={{ opacity: 0 }}
              >
                <span className="text-4xl">{i === 0 ? '💔' : i === 1 ? '😞' : '❌'}</span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/settlement" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to History
          </Link>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-5xl font-black text-white tracking-tighter">
              Settlement Result
            </h1>
            <Badge
              variant={
                isWin ? 'success' : bid.status === 'LOST' ? 'danger' : 'warning'
              }
              className="text-lg px-6 py-3"
            >
              {bid.status === 'PENDING' ? 'AWAITING SETTLEMENT' : bid.status}
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Result */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Result Card */}
            <BrutalCard
              className={`p-8 border-2 mb-8 ${
                isWin
                  ? 'border-green-500 bg-green-500/5'
                  : bid.status === 'LOST'
                    ? 'border-red-500 bg-red-500/5'
                    : 'border-yellow-500 bg-yellow-500/5'
              }`}
            >
              <div className="text-center mb-6">
                <motion.div
                  className={`text-5xl font-black mb-3 ${
                    isWin
                      ? 'text-green-400'
                      : bid.status === 'LOST'
                        ? 'text-red-400'
                        : 'text-blue-400'
                  }`}
                  animate={isWin ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
                  transition={isWin ? { duration: 0.8, delay: 0.5 } : {}}
                >
                  {isWin ? '🎉 YOU WIN!' : bid.status === 'LOST' ? '❌ YOU LOST' : '⏳ PENDING'}
                </motion.div>
                <motion.p
                  className="text-gray-400 text-lg mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {settlementReason}
                </motion.p>
              </div>

              <motion.div
                className="grid grid-cols-2 gap-6 mb-8 border-t border-gray-700 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Your Bid</p>
                  <motion.p
                    className="text-3xl font-black text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
                  >
                    ${(bid.amount / 1000).toFixed(2)}K
                  </motion.p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Risk Multiplier</p>
                  <motion.p
                    className="text-3xl font-black text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.6 }}
                  >
                    {bid.riskPercent}%
                  </motion.p>
                </div>
              </motion.div>

              <motion.div
                className="bg-black/50 p-6 border-2 border-gray-700 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="font-bold text-white mb-4">Calculation</h3>
                <div className="space-y-2 text-sm font-mono">
                  <motion.div
                    className="flex justify-between"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="text-gray-400">Original Bid:</span>
                    <span className="text-white">${(bid.amount / 1000).toFixed(2)}K</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <span className="text-gray-400">Risk Payout:</span>
                    <span className="text-white">
                      ${((bid.amount * bid.riskPercent) / 100 / 1000).toFixed(2)}K
                    </span>
                  </motion.div>
                  <div className="h-px bg-gray-700 my-2" />
                  <motion.div
                    className="flex justify-between"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <span className="text-gray-300 font-bold">
                      {isWin ? 'You Receive:' : 'You Lose:'}
                    </span>
                    <span
                      className={`text-lg font-black ${
                        isWin ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      ${(bid.payout / 1000).toFixed(2)}K
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                className="p-4 bg-gray-900 border-2 border-gray-700"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Profit / Loss:</span>
                  <motion.span
                    className={`text-2xl font-black ${
                      profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                    animate={profitLoss >= 0 ? { x: [0, 5, 0] } : { x: [0, -5, 0] }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                  >
                    {profitLoss >= 0 ? '+' : '−'}${(Math.abs(profitLoss) / 1000).toFixed(2)}K
                    ({profitPercent}%)
                  </motion.span>
                </div>
              </motion.div>
            </BrutalCard>

            {/* Project Info */}
            <BrutalCard className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Project Details</h2>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">{bid.project.title}</h3>
                <p className="text-gray-400 mb-4">{bid.project.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Funding Status</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          bid.project.status === 'FUNDED'
                            ? 'success'
                            : bid.project.status === 'CLOSED'
                              ? 'danger'
                              : 'info'
                        }
                      >
                        {bid.project.status}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {fundingPercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Funded</p>
                    <p className="text-white font-bold">
                      ${(bid.project.totalFunded / 1000).toFixed(1)}K /{' '}
                      <span className="text-gray-400">
                        ${(bid.project.fundingGoal / 1000).toFixed(1)}K
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <Link href={`/projects/${bid.project.id}`}>
                <BrutalButton variant="secondary" className="w-full">
                  View Project
                </BrutalButton>
              </Link>
            </BrutalCard>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BrutalCard className="p-6 sticky top-20">
              <h3 className="text-lg font-bold text-white mb-4">Bid Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Your Prediction</p>
                  <p
                    className={`text-lg font-bold ${
                      bid.prediction === 'YES'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {bid.prediction === 'YES'
                      ? '✓ Project Succeeds'
                      : '✗ Project Fails'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Bid Amount</p>
                  <p className="text-white font-bold">
                    ${(bid.amount / 1000).toFixed(2)}K
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Risk Level</p>
                  <p className="text-white font-bold">{bid.riskPercent}%</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Placed On</p>
                  <p className="text-white font-bold">
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {bid.settledAt && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Settled On</p>
                    <p className="text-white font-bold">
                      {new Date(bid.settledAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="h-px bg-gray-700 my-4" />

                <div
                  className={`p-4 border-2 text-center ${
                    profitLoss >= 0
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                  }`}
                >
                  <p className="text-gray-400 text-xs mb-2">Total Return</p>
                  <p
                    className={`text-2xl font-black ${
                      profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    ${(bid.payout / 1000).toFixed(2)}K
                  </p>
                </div>
              </div>

              <Link href="/settlement" className="mt-6 block">
                <BrutalButton variant="secondary" className="w-full">
                  Back to History
                </BrutalButton>
              </Link>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function SettlementDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SettlementDetailContent />
    </Suspense>
  )
}
