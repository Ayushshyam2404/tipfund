'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { Badge } from '@/components/ui/Badge'

interface PlatformStats {
  totalUsers: number
  totalProjects: number
  totalFunded: number
  totalBidsPlaced: number
  activeProjectsCount: number
  pendingSettlements: number
  recentProjects: Array<{
    id: string
    title: string
    status: string
    totalFunded: number
    fundingGoal: number
    createdAt: string
  }>
  recentBids: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
    project: { title: string }
  }>
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('supabase_token')
        if (!token) {
          setError('Not authenticated. Please login first.')
          return
        }

        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch platform stats')
        const data = await response.json()

        // Mock additional admin stats
        setStats({
          totalUsers: 247,
          totalProjects: 156,
          totalFunded: 2450000,
          totalBidsPlaced: 8934,
          activeProjectsCount: data.projectsOwned ? Math.max(1, data.projectsOwned) : 12,
          pendingSettlements: 34,
          recentProjects: data.recentProjects || [],
          recentBids: data.recentBids || [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading admin panel...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/dashboard">
            <BrutalButton variant="primary">Back to Dashboard</BrutalButton>
          </Link>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-400">
            Platform overview, project management, and settlement controls.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            {
              label: 'Total Users',
              value: stats.totalUsers,
              color: 'purple',
              icon: '👥',
            },
            {
              label: 'Total Projects',
              value: stats.totalProjects,
              color: 'cyan',
              icon: '📦',
            },
            {
              label: 'Total Funded',
              value: `$${(stats.totalFunded / 1000000).toFixed(2)}M`,
              color: 'green',
              icon: '💰',
            },
            {
              label: 'Bids Placed',
              value: stats.totalBidsPlaced,
              color: 'pink',
              icon: '🎯',
            },
            {
              label: 'Active Projects',
              value: stats.activeProjectsCount,
              color: 'yellow',
              icon: '🚀',
            },
            {
              label: 'Pending Settlements',
              value: stats.pendingSettlements,
              color: 'red',
              icon: '⏳',
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <BrutalCard className="p-6 hover:border-purple-500/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-gray-400 text-sm font-bold">{stat.label}</p>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p
                  className={`text-4xl font-black ${
                    stat.color === 'purple'
                      ? 'text-purple-400'
                      : stat.color === 'cyan'
                        ? 'text-cyan-400'
                        : stat.color === 'green'
                          ? 'text-green-400'
                          : stat.color === 'pink'
                            ? 'text-pink-400'
                            : stat.color === 'yellow'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                  }`}
                >
                  {stat.value}
                </p>
              </BrutalCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Admin Actions Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Settlements */}
          <BrutalCard className="p-8 border-2 border-purple-500/50">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Bid Settlements</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage and settle pending bids on your projects
                </p>
              </div>
              <span className="text-3xl">⚖️</span>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-gray-300 text-sm">
                <span className="font-bold text-yellow-400">{stats.pendingSettlements}</span>
                {' '}pending settlements awaiting your action
              </p>
            </div>

            <Link href="/admin/settlement" className="block">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <BrutalButton variant="primary" className="w-full">
                  Manage Settlements →
                </BrutalButton>
              </motion.div>
            </Link>
          </BrutalCard>

          {/* Projects */}
          <BrutalCard className="p-8 border-2 border-cyan-500/50">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Projects</h2>
                <p className="text-gray-400 text-sm mt-1">
                  View and manage all platform projects
                </p>
              </div>
              <span className="text-3xl">📊</span>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-gray-300 text-sm">
                <span className="font-bold text-cyan-400">{stats.totalProjects}</span>
                {' '}projects on the platform
              </p>
            </div>

            <Link href="/projects" className="block">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <BrutalButton variant="secondary" className="w-full">
                  View All Projects →
                </BrutalButton>
              </motion.div>
            </Link>
          </BrutalCard>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <BrutalCard className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Projects</h3>

              <div className="space-y-3">
                {stats.recentProjects.slice(0, 5).map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-gray-900/50 border-l-2 border-purple-500 hover:border-purple-400 hover:bg-gray-900/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-white truncate flex-1">{project.title}</h4>
                      <Badge variant={project.status === 'FUNDED' ? 'success' : 'info'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        ${(project.totalFunded / 1000).toFixed(1)}K /{' '}
                        ${(project.fundingGoal / 1000).toFixed(1)}K
                      </span>
                      <span>
                        {((project.totalFunded / project.fundingGoal) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </BrutalCard>
          </motion.div>

          {/* Recent Bids */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <BrutalCard className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Bids</h3>

              <div className="space-y-3">
                {stats.recentBids.slice(0, 5).map((bid, idx) => (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-gray-900/50 border-l-2 border-pink-500 hover:border-pink-400 hover:bg-gray-900/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-white truncate flex-1">
                        {bid.project.title}
                      </h4>
                      <Badge
                        variant={
                          bid.status === 'WON'
                            ? 'success'
                            : bid.status === 'LOST'
                              ? 'danger'
                              : 'info'
                        }
                      >
                        {bid.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-mono">${(bid.amount / 1000).toFixed(2)}K</span>
                      <span>
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AdminDashboardContent />
    </Suspense>
  )
}
