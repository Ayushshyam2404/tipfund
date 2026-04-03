'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { BrutalInput } from '@/components/ui/BrutalInput'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { FundingBar } from '@/components/ui/FundingBar'

interface Project {
  id: string
  title: string
  fundingGoal: number
  totalFunded: number
}

function FundProjectContent() {
  const params = useParams()
  const projectId = params.id as string
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [tip, setTip] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_token') || ''}`,
          },
        })
        if (!response.ok) throw new Error('Failed to fetch project')
        const data = await response.json()
        setProject(data)
      } catch (err) {
        setError('Project not found')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || Number(amount) < 5000) {
      setError('Minimum funding is $5,000')
      return
    }

    if (Number(amount) > 1000000) {
      setError('Maximum funding is $1,000,000')
      return
    }

    try {
      setSubmitting(true)

      const token = localStorage.getItem('supabase_token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/fundings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          amount: Number(amount),
          tip: tip ? Number(tip) : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create funding')
      }

      router.push(`/projects/${projectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/projects">
            <BrutalButton variant="primary">Back to Projects</BrutalButton>
          </Link>
        </div>
      </div>
    )
  }

  const fundingPercent = (project.totalFunded / project.fundingGoal) * 100
  const remainingGoal = Math.max(0, project.fundingGoal - project.totalFunded)

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href={`/projects/${projectId}`} className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Project
          </Link>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">
            Fund {project.title}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Form */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <BrutalCard className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Funding Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-400 font-bold">$</span>
                    <BrutalInput
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50000"
                      min="5000"
                      max="1000000"
                      step="1000"
                      className="w-full pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Min: $5K • Max: $1M • Remaining goal: ${(remainingGoal / 1000).toFixed(1)}K
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Platform Tip (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-400 font-bold">$</span>
                    <BrutalInput
                      type="number"
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="100"
                      className="w-full pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Help us maintain the platform. 100% goes to operations.
                  </p>
                </div>

                <div className="p-4 bg-gray-900 border-2 border-gray-700">
                  <h3 className="font-bold text-white mb-3">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Funding Amount:</span>
                      <span className="text-white font-bold">
                        ${Number(amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Fee (10%):</span>
                      <span className="text-white font-bold">
                        ${((Number(amount || 0) * 0.1) / 1000).toFixed(2)}K
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Project Receives:</span>
                      <span className="text-cyan-400 font-bold">
                        ${((Number(amount || 0) * 0.9) / 1000).toFixed(2)}K
                      </span>
                    </div>
                    {tip && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your Tip:</span>
                        <span className="text-white font-bold">
                          ${Number(tip).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-gray-700 my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-bold">Total Charge:</span>
                      <span className="text-purple-400 font-black text-lg">
                        ${(
                          (Number(amount || 0) + Number(tip || 0)) /
                          1000
                        ).toFixed(2)}K
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    className="p-4 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <BrutalButton
                  type="submit"
                  variant="primary"
                  disabled={submitting || !amount}
                  className="w-full py-4 text-lg"
                >
                  {submitting ? 'Processing...' : 'Fund Project'}
                </BrutalButton>

                <p className="text-xs text-gray-500 text-center">
                  💳 Payment processing will be handled in next phase (currently in test mode)
                </p>
              </form>
            </BrutalCard>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BrutalCard className="p-6 sticky top-20">
              <h3 className="text-lg font-bold text-white mb-4">Funding Progress</h3>

              <FundingBar current={project.totalFunded} goal={project.fundingGoal} />

              <div className="mt-6 space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Funded</p>
                  <p className="text-2xl font-black text-cyan-400">
                    ${(project.totalFunded / 1000).toFixed(1)}K
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Goal</p>
                  <p className="text-2xl font-black text-gray-400">
                    ${(project.fundingGoal / 1000).toFixed(1)}K
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Remaining</p>
                  <p className="text-2xl font-black text-purple-400">
                    ${(remainingGoal / 1000).toFixed(1)}K
                  </p>
                </div>

                <div className="h-px bg-gray-700 my-3" />

                <div>
                  <p className="text-gray-400 text-sm">Completion</p>
                  <p className="text-3xl font-black text-pink-400">
                    {fundingPercent.toFixed(0)}%
                  </p>
                </div>
              </div>

              <Link href={`/projects/${projectId}`} className="mt-6 block">
                <BrutalButton variant="secondary" className="w-full">
                  View Project
                </BrutalButton>
              </Link>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function FundProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <FundProjectContent />
    </Suspense>
  )
}
