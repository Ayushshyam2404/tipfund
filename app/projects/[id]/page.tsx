'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { Badge } from '@/components/ui/Badge'
import { FundingBar } from '@/components/ui/FundingBar'
import { useRealtimeProject } from '@/hooks/useRealtimeProject'

interface ProjectDetail {
  id: string
  title: string
  description: string
  fundingGoal: number
  totalFunded: number
  status: 'OPEN' | 'FUNDED' | 'CLOSED'
  deadline: string
  techStack: string[]
  githubRepoUrl: string
  owner: {
    id: string
    email: string
  }
  fundings: Array<{
    id: string
    amount: number
    createdAt: string
    funder: {
      email: string
    }
  }>
  bids: Array<{
    id: string
    amount: number
    riskPercent: number
    prediction: 'YES' | 'NO'
    status: 'PENDING' | 'WON' | 'LOST'
    bidder: {
      email: string
    }
  }>
}

function ProjectDetailContent() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token') || ''}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch project')
      const data = await response.json()
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }, [projectId])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchProject()
      setLoading(false)
    }
    load()
  }, [projectId, fetchProject])

  // Set up real-time subscriptions
  useRealtimeProject(projectId, {
    onProjectUpdate: (updatedProject) => {
      setProject((prev) => {
        if (!prev) return null
        return {
          ...prev,
          // Only update fields that can come from subscription
          ...(updatedProject.status && { status: updatedProject.status as 'OPEN' | 'FUNDED' | 'CLOSED' }),
          ...(updatedProject.totalFunded !== undefined && { totalFunded: updatedProject.totalFunded }),
        }
      })
    },
    onNewBid: () => {
      // Just log for now, could trigger notification
      console.log('New bid placed')
    },
    onNewFunding: () => {
      // Just log for now, could trigger notification
      console.log('New funding received')
    },
    onBidsChange: () => {
      // Refetch project to get updated bids
      fetchProject()
    },
    onFundingsChange: () => {
      // Refetch project to get updated fundings
      fetchProject()
    },
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Project not found</p>
      </div>
    )
  }

  const fundingPercent = (project.totalFunded / project.fundingGoal) * 100
  const daysLeft = Math.ceil(
    (new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const statusColor = {
    OPEN: 'text-blue-400',
    FUNDED: 'text-green-400',
    CLOSED: 'text-red-400',
  }

  const statusText = {
    OPEN: 'Open for Funding',
    FUNDED: 'Fully Funded',
    CLOSED: 'Closed',
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/projects" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Projects
          </Link>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">{project.title}</h1>
          <p className="text-xl text-gray-400 mb-4">{project.description}</p>

          <div className="flex gap-3 items-center flex-wrap">
            <Badge variant={project.status === 'OPEN' ? 'info' : 'default'}>
              {statusText[project.status]}
            </Badge>
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="default" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Funding Progress */}
            <BrutalCard className="mb-8 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Funding Progress</h2>
              <FundingBar current={project.totalFunded} goal={project.fundingGoal} />
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400 mb-2">
                    ${(project.totalFunded / 1000).toFixed(1)}K
                  </div>
                  <p className="text-gray-400 text-sm">Funded</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-gray-400 mb-2">
                    ${(project.fundingGoal / 1000).toFixed(1)}K
                  </div>
                  <p className="text-gray-400 text-sm">Goal</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-cyan-400 mb-2">
                    {fundingPercent.toFixed(0)}%
                  </div>
                  <p className="text-gray-400 text-sm">Complete</p>
                </div>
              </div>
            </BrutalCard>

            {/* Recent Activity */}
            <BrutalCard className="mb-8 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>

              {/* Recent Fundings */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Recent Fundings</h3>
                {project.fundings.length === 0 ? (
                  <p className="text-gray-400 text-sm">No fundings yet</p>
                ) : (
                  <div className="space-y-3">
                    {project.fundings.slice(0, 5).map((funding) => (
                      <div
                        key={funding.id}
                        className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800"
                      >
                        <span className="text-sm text-gray-400">{funding.funder.email}</span>
                        <span className="font-bold text-white">${(funding.amount / 1000).toFixed(2)}K</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Predictions */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Predictions</h3>
                {project.bids.length === 0 ? (
                  <p className="text-gray-400 text-sm">No predictions yet</p>
                ) : (
                  <div className="space-y-3">
                    {project.bids.slice(0, 5).map((bid) => (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between p-3 bg-gray-900 border-2 ${
                          bid.status === 'WON'
                            ? 'border-green-500'
                            : bid.status === 'LOST'
                              ? 'border-red-500'
                              : 'border-gray-800'
                        }`}
                      >
                        <div>
                          <p className="text-sm text-gray-400">{bid.bidder.email}</p>
                          <p className="text-xs text-gray-500">
                            {bid.prediction} • Risk: {bid.riskPercent}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">${(bid.amount / 1000).toFixed(2)}K</p>
                          <p
                            className={`text-xs font-bold ${
                              bid.status === 'WON'
                                ? 'text-green-400'
                                : bid.status === 'LOST'
                                  ? 'text-red-400'
                                  : 'text-yellow-400'
                            }`}
                          >
                            {bid.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </BrutalCard>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BrutalCard className="p-6 sticky top-20">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Info</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Deadline</p>
                    <p className="text-white font-bold">
                      {new Date(project.deadline).toLocaleDateString()}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Total Fundees</p>
                    <p className="text-white font-bold">{project.fundings.length}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Total Predictions</p>
                    <p className="text-white font-bold">{project.bids.length}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Repository</p>
                    <a
                      href={project.githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm truncate block"
                    >
                      View on GitHub →
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {project.status === 'OPEN' && (
                  <>
                    <Link href={`/fund/${project.id}`}>
                      <BrutalButton variant="primary" className="w-full">
                        Fund This Project
                      </BrutalButton>
                    </Link>
                    <Link href={`/bid/${project.id}`}>
                      <BrutalButton variant="secondary" className="w-full">
                        Make a Prediction
                      </BrutalButton>
                    </Link>
                  </>
                )}
                {project.status !== 'OPEN' && (
                  <p className="text-gray-400 text-sm text-center">
                    This project is no longer accepting funds
                  </p>
                )}
              </div>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ProjectDetailContent />
    </Suspense>
  )
}
