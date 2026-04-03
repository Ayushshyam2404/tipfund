'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { Badge } from '@/components/ui/Badge'
import { BrutalInput } from '@/components/ui/BrutalInput'

interface SettleableBid {
  id: string
  amount: number
  riskPercent: number
  prediction: 'YES' | 'NO'
  status: 'PENDING'
  project: {
    id: string
    title: string
    status: 'OPEN' | 'FUNDED' | 'CLOSED'
  }
  bidder: {
    email: string
  }
  createdAt: string
}

interface AdminProject {
  id: string
  title: string
  status: 'OPEN' | 'FUNDED' | 'CLOSED'
  totalFunded: number
  fundingGoal: number
  pendingBids: SettleableBid[]
}

function AdminSettlementContent() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settlingBidId, setSettlingBidId] = useState<string | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<'WON' | 'LOST' | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('supabase_token')
        if (!token) {
          setError('Not authenticated. Please login first.')
          return
        }

        const response = await fetch('/api/projects?ownerProjects=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch projects')
        const data = await response.json()
        setProjects(data.projects || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleSettleBid = async (bidId: string, outcome: 'WON' | 'LOST') => {
    try {
      const token = localStorage.getItem('supabase_token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch(`/api/bids?bidId=${bidId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: outcome }),
      })

      if (!response.ok) throw new Error('Failed to settle bid')

      setSuccessMessage(`Bid settled as ${outcome}`)
      setSettlingBidId(null)
      setSelectedOutcome(null)

      // Refresh projects
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to settle bid')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading your projects...</p>
      </div>
    )
  }

  const projectsWithPendingBids = projects.filter((p) => p.pendingBids.length > 0)

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Settle Bids
          </h1>
          <p className="text-gray-400">
            Finalize bid settlements on your projects. Determine winners based on
            your project&apos;s outcome.
          </p>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            className="mb-8 p-4 bg-red-500/10 border-2 border-red-500 text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            className="mb-8 p-4 bg-green-500/10 border-2 border-green-500 text-green-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            ✓ {successMessage}
          </motion.div>
        )}

        {projectsWithPendingBids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <BrutalCard className="p-12 text-center border-2 border-gray-700">
              <p className="text-gray-400 mb-4">
                No projects with pending bids to settle.
              </p>
              <p className="text-sm text-gray-500">
                Once your projects are FUNDED or CLOSED, you&apos;ll be able to settle
                pending bids here.
              </p>
            </BrutalCard>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {projectsWithPendingBids.map((project, projectIdx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: projectIdx * 0.1 }}
              >
                <BrutalCard className="p-8">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-700">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {project.title}
                      </h2>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            project.status === 'FUNDED'
                              ? 'success'
                              : project.status === 'CLOSED'
                                ? 'danger'
                                : 'info'
                          }
                        >
                          {project.status}
                        </Badge>
                        <span className="text-gray-400 text-sm">
                          {project.pendingBids.length} bids to settle
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Outcome Info */}
                  <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-gray-900 border-2 border-gray-700">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Project Status</p>
                      <p className="text-lg font-bold text-white">
                        {project.status === 'FUNDED'
                          ? '✓ Successfully Funded'
                          : '✗ Funding Failed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Funding Progress</p>
                      <p className="text-lg font-bold text-white">
                        ${(project.totalFunded / 1000).toFixed(1)}K / ${(project.fundingGoal / 1000).toFixed(1)}K
                      </p>
                    </div>
                  </div>

                  {/* Pending Bids */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Pending Bids
                    </h3>

                    {project.pendingBids.map((bid, bidIdx) => (
                      <motion.div
                        key={bid.id}
                        className="p-6 bg-black border-2 border-gray-700 hover:border-purple-500/50 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: bidIdx * 0.05 }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Bidder</p>
                            <p className="text-white font-mono text-sm">
                              {bid.bidder.email.split('@')[0]}...
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs mb-1">Bid Amount</p>
                            <p className="text-white font-bold">
                              ${(bid.amount / 1000).toFixed(2)}K
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs mb-1">Prediction</p>
                            <p
                              className={`font-bold ${
                                bid.prediction === 'YES'
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {bid.prediction === 'YES' ? 'YES (Success)' : 'NO (Failure)'}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs mb-1">Risk Level</p>
                            <p className="text-white font-bold">{bid.riskPercent}%</p>
                          </div>
                        </div>

                        {/* Settlement Controls */}
                        {settlingBidId === bid.id ? (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400 mb-4">
                              Did this bidder&apos;s prediction match the outcome?
                            </p>
                            <div className="flex gap-3">
                              <BrutalButton
                                variant="primary"
                                className="flex-1"
                                onClick={() => handleSettleBid(bid.id, 'WON')}
                              >
                                ✓ WON
                              </BrutalButton>
                              <BrutalButton
                                variant="danger"
                                className="flex-1"
                                onClick={() => handleSettleBid(bid.id, 'LOST')}
                              >
                                ✗ LOST
                              </BrutalButton>
                              <BrutalButton
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setSettlingBidId(null)}
                              >
                                Cancel
                              </BrutalButton>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex gap-3">
                            <BrutalButton
                              variant="primary"
                              className="flex-1"
                              onClick={() => setSettlingBidId(bid.id)}
                            >
                              Settle This Bid
                            </BrutalButton>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </BrutalCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminSettlementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AdminSettlementContent />
    </Suspense>
  )
}
