'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { BrutalInput } from '@/components/ui/BrutalInput'
import { BrutalCard } from '@/components/ui/BrutalCard'

function SubmitProjectContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    githubRepoUrl: '',
    title: '',
    description: '',
    fundingGoal: '',
    deadline: '',
    techStack: [] as string[],
  })

  const [techInput, setTechInput] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()],
      }))
      setTechInput('')
    }
  }

  const removeTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }))
  }

  const validateStep = () => {
    if (step === 1) {
      if (!formData.githubRepoUrl.trim()) {
        setError('GitHub URL is required')
        return false
      }
      if (!formData.githubRepoUrl.includes('github.com')) {
        setError('Please enter a valid GitHub repository URL')
        return false
      }
    } else if (step === 2) {
      if (!formData.title.trim()) {
        setError('Project title is required')
        return false
      }
      if (!formData.description.trim()) {
        setError('Project description is required')
        return false
      }
      if (formData.description.length < 50) {
        setError('Description must be at least 50 characters')
        return false
      }
    } else if (step === 3) {
      if (!formData.fundingGoal) {
        setError('Funding goal is required')
        return false
      }
      const goal = Number(formData.fundingGoal)
      if (isNaN(goal) || goal < 5000 || goal > 1000000) {
        setError('Funding goal must be between $5,000 and $1,000,000')
        return false
      }
      if (!formData.deadline) {
        setError('Deadline is required')
        return false
      }
      const deadline = new Date(formData.deadline)
      if (deadline <= new Date()) {
        setError('Deadline must be in the future')
        return false
      }
    }

    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep()) return

    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('supabase_token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          githubRepoUrl: formData.githubRepoUrl,
          title: formData.title,
          description: formData.description,
          fundingGoal: Number(formData.fundingGoal),
          deadline: new Date(formData.deadline).toISOString(),
          techStack: formData.techStack.length > 0 ? formData.techStack : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const project = await response.json()
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">
            Submit Project
          </h1>
          <p className="text-gray-400 text-lg">
            Create a new funding round for your GitHub project
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-12 flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s
                    ? 'bg-purple-500 text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    step > s ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BrutalCard className="p-8 mb-8">
              {/* Step 1: GitHub Repository */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Step 1: Repository</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        GitHub Repository URL
                      </label>
                      <BrutalInput
                        type="url"
                        name="githubRepoUrl"
                        placeholder="https://github.com/username/repo"
                        value={formData.githubRepoUrl}
                        onChange={handleChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Enter the full GitHub repository URL
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Project Details */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Step 2: Project Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Project Title
                      </label>
                      <BrutalInput
                        type="text"
                        name="title"
                        placeholder="My Awesome Project"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Project Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Describe your project, its purpose, and why it needs funding..."
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-4 bg-black border-2 border-gray-700 text-white font-mono text-sm focus:border-purple-500 outline-none resize-none"
                        rows={6}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Minimum 50 characters ({formData.description.length}/50)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Tech Stack (Optional)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <BrutalInput
                          type="text"
                          placeholder="React, Node.js, etc."
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTech()
                            }
                          }}
                          className="flex-1"
                        />
                        <BrutalButton
                          type="button"
                          variant="secondary"
                          onClick={addTech}
                          className="px-4 py-2"
                        >
                          Add
                        </BrutalButton>
                      </div>

                      {formData.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.techStack.map((tech) => (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => removeTech(tech)}
                              className="px-3 py-1 bg-purple-500 text-black font-bold text-sm border-2 border-purple-500 hover:bg-purple-600"
                            >
                              {tech} ✕
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Funding & Timeline */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Step 3: Funding & Timeline</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Funding Goal (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-gray-400 font-bold">$</span>
                        <BrutalInput
                          type="number"
                          name="fundingGoal"
                          placeholder="50000"
                          value={formData.fundingGoal}
                          onChange={handleChange}
                          className="w-full pl-8"
                          min="5000"
                          max="1000000"
                          step="1000"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Must be between $5,000 and $1,000,000
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Campaign Deadline
                      </label>
                      <BrutalInput
                        type="datetime-local"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        When should the funding campaign close?
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-gray-900 border-2 border-gray-700">
                      <h3 className="font-bold text-white mb-3">Campaign Summary</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-400">Repository:</span>{' '}
                          <span className="text-white font-mono break-all">
                            {formData.githubRepoUrl}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-400">Title:</span>{' '}
                          <span className="text-white">{formData.title || '—'}</span>
                        </p>
                        <p>
                          <span className="text-gray-400">Goal:</span>{' '}
                          <span className="text-white">
                            ${Number(formData.fundingGoal || 0).toLocaleString()}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-400">Deadline:</span>{' '}
                          <span className="text-white">
                            {formData.deadline
                              ? new Date(formData.deadline).toLocaleDateString()
                              : '—'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mt-6 p-4 bg-red-500/20 border-2 border-red-500 text-red-400 font-bold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </BrutalCard>

            {/* Buttons */}
            <div className="flex gap-4 justify-between">
              {step > 1 && (
                <BrutalButton
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-3"
                >
                  ← Previous
                </BrutalButton>
              )}
              {step < 3 && (
                <BrutalButton
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  className="px-8 py-3 ml-auto"
                >
                  Next →
                </BrutalButton>
              )}
              {step === 3 && (
                <BrutalButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="px-8 py-3 ml-auto"
                >
                  {loading ? 'Submitting...' : 'Submit Project'}
                </BrutalButton>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

export default function SubmitProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SubmitProjectContent />
    </Suspense>
  )
}
