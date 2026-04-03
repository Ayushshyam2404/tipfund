'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { BrutalInput } from '@/components/ui/BrutalInput'
import { Badge } from '@/components/ui/Badge'
import { FundingBar } from '@/components/ui/FundingBar'
import { useProjectsRealtime } from '@/hooks/useProjectsRealtime'

interface Project {
  id: string
  title: string
  description: string
  fundingGoal: number
  totalFunded: number
  status: 'OPEN' | 'FUNDED' | 'CLOSED'
  deadline: string
  owner: {
    id: string
    email: string
  }
  _count: {
    fundings: number
    bids: number
  }
}

function ProjectCard({ project }: { project: Project }) {
  const fundingPercent = (project.totalFunded / project.fundingGoal) * 100
  const daysLeft = Math.ceil(
    (new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const statusColor = {
    OPEN: 'border-blue-500 bg-blue-500/10',
    FUNDED: 'border-green-500 bg-green-500/10',
    CLOSED: 'border-red-500 bg-red-500/10',
  }

  const statusText = {
    OPEN: 'Accepting Funds',
    FUNDED: 'Fully Funded',
    CLOSED: 'Closed',
  }

  return (
    <motion.div
      className={`p-6 border-2 ${statusColor[project.status]} group hover:shadow-lg transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
        </div>
        <Badge variant="info" className="ml-4 flex-shrink-0">
          {statusText[project.status]}
        </Badge>
      </div>

      <div className="mb-4">
        <FundingBar current={project.totalFunded} goal={project.fundingGoal} />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>${(project.totalFunded / 1000).toFixed(1)}K funded</span>
          <span>${(project.fundingGoal / 1000).toFixed(1)}K goal</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>{project._count.fundings} funded • {project._count.bids} predictions</span>
        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
      </div>

      <Link href={`/projects/${project.id}`}>
        <BrutalButton variant="secondary" className="w-full">
          View Details
        </BrutalButton>
      </Link>
    </motion.div>
  )
}

function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | 'OPEN' | 'FUNDED' | 'CLOSED'>('ALL')
  const [page, setPage] = useState(1)

  const fetchProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(status !== 'ALL' && { status }),
      })

      const response = await fetch(`/api/projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token') || ''}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    }
  }, [page, status])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchProjects()
      setLoading(false)
    }
    load()
  }, [fetchProjects])

  // Set up real-time subscriptions for project updates
  useProjectsRealtime({
    onProjectsChange: () => {
      console.log('Projects updated, refreshing list')
      fetchProjects()
    },
  })

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">
            Browse Projects
          </h1>
          <p className="text-xl text-gray-400">
            Discover and fund innovative open-source projects
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-12 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <BrutalInput
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />

          <div className="flex gap-3 flex-wrap">
              {(['ALL', 'OPEN', 'FUNDED', 'CLOSED'] as const).map((s) => {
                const isActive = status === s
                return (
                  <Badge
                    key={s}
                    variant={isActive ? 'info' : 'default'}
                    className="cursor-pointer"
                  >
                    <button
                      onClick={() => {
                        setStatus(s)
                        setPage(1)
                      }}
                    >
                      {s === 'ALL' ? 'All Projects' : s}
                    </button>
                  </Badge>
                )
              })}
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No projects found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 items-center">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border-2 border-gray-700 text-gray-400 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-400">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={filteredProjects.length < 12}
                className="px-4 py-2 border-2 border-gray-700 text-gray-400 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ProjectsGrid />
    </Suspense>
  )
}
