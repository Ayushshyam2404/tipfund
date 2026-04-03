'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { Badge } from '@/components/ui/Badge'
import { FundingBar } from '@/components/ui/FundingBar'
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime'

interface DashboardStats {
  projectsOwned: number
  totalFunded: number
  fundingsMade: number
  bidsPlaced: number
  bidsWon: number
  roi: number
  recentProjects: Array<{
    id: string
    title: string
    status: string
    totalFunded: number
    fundingGoal: number
  }>
  recentFundings: Array<{
    id: string
    project: { title: string }
    amount: number
  }>
  recentBids: Array<{
    id: string
    project: { title: string }
    amount: number
    status: string
  }>
}

function OwnerTab({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Projects Owned</p>
          <p className="text-4xl font-black text-purple-400">{stats.projectsOwned}</p>
        </BrutalCard>

        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Total Funded</p>
          <p className="text-4xl font-black text-cyan-400">
            ${(stats.totalFunded / 1000).toFixed(1)}K
          </p>
        </BrutalCard>

        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Predictions on Projects</p>
          <p className="text-4xl font-black text-pink-400">{stats.bidsPlaced}</p>
        </BrutalCard>
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <BrutalCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Your Projects</h3>
            <Link href="/submit">
              <BrutalButton variant="primary" className="px-6 py-2">
                New Project
              </BrutalButton>
            </Link>
          </div>

          {stats.recentProjects.length === 0 ? (
            <p className="text-gray-400">No projects yet. Create one to get started!</p>
          ) : (
            <div className="space-y-4">
              {stats.recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <motion.div
                    className="p-4 border-2 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-white mb-1">{project.title}</p>
                        <FundingBar current={project.totalFunded} goal={project.fundingGoal} />
                      </div>
                      <Badge
                        variant={
                          project.status === 'OPEN'
                            ? 'info'
                            : project.status === 'FUNDED'
                              ? 'success'
                              : 'danger'
                        }
                        className="flex-shrink-0 ml-4"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>${(project.totalFunded / 1000).toFixed(1)}K funded</span>
                      <span>${(project.fundingGoal / 1000).toFixed(1)}K goal</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </BrutalCard>
      </motion.div>
    </div>
  )
}

function FunderTab({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Fundings Made</p>
          <p className="text-4xl font-black text-purple-400">{stats.fundingsMade}</p>
        </BrutalCard>

        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Total Invested</p>
          <p className="text-4xl font-black text-cyan-400">
            ${(stats.totalFunded / 1000).toFixed(1)}K
          </p>
        </BrutalCard>

        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Active Projects</p>
          <p className="text-4xl font-black text-pink-400">{stats.projectsOwned}</p>
        </BrutalCard>
      </motion.div>

      {/* Recent Fundings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <BrutalCard className="p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Your Fundings</h3>

          {stats.recentFundings.length === 0 ? (
            <p className="text-gray-400">You haven't funded any projects yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentFundings.map((funding) => (
                <Link key={funding.id} href={`/projects/${funding.id}`}>
                  <motion.div
                    className="p-4 border-2 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer flex items-center justify-between"
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <p className="font-bold text-white">{funding.project.title}</p>
                      <p className="text-xs text-gray-400">Funding contribution</p>
                    </div>
                    <p className="text-xl font-black text-cyan-400">
                      ${(funding.amount / 1000).toFixed(2)}K
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </BrutalCard>
      </motion.div>
    </div>
  )
}

function BidderTab({ stats }: { stats: DashboardStats }) {
  const winRate = stats.bidsPlaced > 0 ? ((stats.bidsWon / stats.bidsPlaced) * 100).toFixed(1) : 0

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Predictions</p>
          <p className="text-4xl font-black text-purple-400">{stats.bidsPlaced}</p>
        </BrutalCard>

        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Wins</p>
          <p className="text-4xl font-black text-green-400">{stats.bidsWon}</p>
        </BrutalCard>

        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">Win Rate</p>
          <p className="text-4xl font-black text-cyan-400">{winRate}%</p>
        </BrutalCard>

        <BrutalCard className="p-6">
          <p className="text-gray-400 text-sm mb-2">ROI</p>
          <p className="text-4xl font-black text-pink-400">{stats.roi.toFixed(0)}%</p>
        </BrutalCard>
      </motion.div>

      {/* Recent Bids */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <BrutalCard className="p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Your Predictions</h3>

          {stats.recentBids.length === 0 ? (
            <p className="text-gray-400">You haven't made any predictions yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentBids.map((bid) => (
                <Link key={bid.id} href={`/projects/${bid.id}`}>
                  <motion.div
                    className={`p-4 border-2 cursor-pointer flex items-center justify-between transition-colors ${
                      bid.status === 'WON'
                        ? 'border-green-500 hover:bg-green-500/10'
                        : bid.status === 'LOST'
                          ? 'border-red-500 hover:bg-red-500/10'
                          : 'border-yellow-500 hover:bg-yellow-500/10'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <p className="font-bold text-white">{bid.project.title}</p>
                      <p
                        className={`text-xs font-bold ${
                          bid.status === 'WON'
                            ? 'text-green-400'
                            : bid.status === 'LOST'
                              ? 'text-red-400'
                              : 'text-yellow-400'
                        }`}
                      >
                        {bid.status === 'PENDING' ? 'Awaiting Settlement' : bid.status}
                      </p>
                    </div>
                    <p className="text-xl font-black text-cyan-400">
                      ${(bid.amount / 1000).toFixed(2)}K
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </BrutalCard>
      </motion.div>
    </div>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'owner' | 'funder' | 'bidder'>('owner')

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('supabase_token')
      if (!token) return

      const response = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchStats()
      setLoading(false)
    }
    load()
  }, [fetchStats])

  // Set up real-time subscriptions for dashboard updates
  useDashboardRealtime({
    onLeaderboardChange: () => {
      console.log('Leaderboard updated, refreshing stats')
      fetchStats()
    },
    onBidChanges: () => {
      console.log('Bid changes, refreshing stats')
      fetchStats()
    },
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-20 px-6 flex items-center justify-center">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black text-white py-20 px-6 flex items-center justify-center">
        <p className="text-gray-400">Failed to load dashboard data</p>
      </div>
    )
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
            Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Manage your activity and track your progress</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex gap-3 mb-12 border-b-2 border-gray-800 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {(['owner', 'funder', 'bidder'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 border-b-4 font-bold text-lg transition-all uppercase ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {tab === 'owner'
                ? '🏗 Builder'
                : tab === 'funder'
                  ? '💰 Funder'
                  : '🎯 Predictor'}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'owner' && <OwnerTab stats={stats} />}
          {activeTab === 'funder' && <FunderTab stats={stats} />}
          {activeTab === 'bidder' && <BidderTab stats={stats} />}
        </motion.div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DashboardContent />
    </Suspense>
  )
}
