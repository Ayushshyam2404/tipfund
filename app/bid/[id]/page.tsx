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

function BidProjectContent() {
  const params = useParams()
  const projectId = params.id as string
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [prediction, setPrediction] = useState<'YES' | 'NO'>('YES')
  const [amount, setAmount] = useState('')
  const [riskPercent, setRiskPercent] = useState('25')

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

    if (!amount || Number(amount) < 10000) {
      setError('Minimum bid is $10,000')
      return
    }

    if (Number(amount) > 100000) {
      setError('Maximum bid is $100,000')
      return
    }

    const risk = Number(riskPercent)
    if (risk < 5 || risk > 50) {
      setError('Risk must be between 5% and 50%')
      return
    }

    try {
      setSubmitting(true)

      const token = localStorage.getItem('supabase_token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          amount: Number(amount),
          riskPercent: risk,
          prediction,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create bid')
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
  const potentialPayout =
    Number(amount || 0) + (Number(amount || 0) * Number(riskPercent || 0)) / 100

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
            Make a Prediction
          </h1>
          <p className="text-gray-400 text-lg">Bet on {project.title}</p>
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
                {/* Prediction Choice */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Your Prediction
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPrediction('YES')}
                      className={`p-4 border-2 font-bold text-lg transition-all ${
                        prediction === 'YES'
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-gray-700 text-gray-400 hover:border-green-500'
                      }`}
                    >
                      ✓ YES
                      <p className="text-xs font-normal mt-1 text-gray-400">
                        Project will succeed
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrediction('NO')}
                      className={`p-4 border-2 font-bold text-lg transition-all ${
                        prediction === 'NO'
                          ? 'border-red-500 bg-red-500/20 text-red-400'
                          : 'border-gray-700 text-gray-400 hover:border-red-500'
                      }`}
                    >
                      ✗ NO
                      <p className="text-xs font-normal mt-1 text-gray-400">
                        Project will fail
                      </p>
                    </button>
                  </div>
                </div>

                {/* Bid Amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Bid Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-400 font-bold">$</span>
                    <BrutalInput
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50000"
                      min="10000"
                      max="100000"
                      step="5000"
                      className="w-full pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Min: $10K • Max: $100K • You will risk this amount
                  </p>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Risk Multiplier: {riskPercent}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    className="w-full h-2 bg-gray-700 border-2 border-gray-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>5% (Safe)</span>
                    <span>50% (Risky)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Higher risk = higher potential payout if you win
                  </p>
                </div>

                {/* Summary */}
                <div className="p-4 bg-gray-900 border-2 border-gray-700">
                  <h3 className="font-bold text-white mb-3">Prediction Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your Prediction:</span>
                      <span
                        className={`font-bold ${
                          prediction === 'YES' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {prediction === 'YES'
                          ? '✓ Project will SUCCEED'
                          : '✗ Project will FAIL'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your Bid:</span>
                      <span className="text-white font-bold">
                        ${Number(amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Multiplier:</span>
                      <span className="text-white font-bold">{riskPercent}%</span>
                    </div>
                    <div className="h-px bg-gray-700 my-2" />
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-bold">If You WIN:</span>
                      <span className="text-green-400 font-black text-lg">
                        +${(potentialPayout / 1000).toFixed(2)}K
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-bold">If You LOSE:</span>
                      <span className="text-red-400 font-black text-lg">
                        -${(Number(amount || 0) / 1000).toFixed(2)}K
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border-2 border-blue-500 text-blue-400 text-sm">
                  <p className="font-bold mb-2">ℹ How Predictions Work</p>
                  <ul className="space-y-1 text-xs">
                    <li>• If project reaches funding goal and status = FUNDED:</li>
                    <li className="font-mono text-blue-300 ml-3">
                      YES predictions WIN • NO predictions LOSE
                    </li>
                    <li>• If project deadline passes without funding (CLOSED):</li>
                    <li className="font-mono text-blue-300 ml-3">
                      NO predictions WIN • YES predictions LOSE
                    </li>
                  </ul>
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
                  {submitting ? 'Processing...' : 'Place Prediction'}
                </BrutalButton>

                <p className="text-xs text-gray-500 text-center">
                  Your bid will be escrowed until project status changes
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
              <h3 className="text-lg font-bold text-white mb-4">Project Status</h3>

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

export default function BidProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <BidProjectContent />
    </Suspense>
  )
}
