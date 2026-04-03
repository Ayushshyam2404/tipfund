import { useEffect, useRef, useCallback } from 'react'
import {
  subscribeToBidsOnProject,
  subscribeToProjectUpdates,
  subscribeToFundingsOnProject,
} from '@/lib/realtime'

interface RealtimeProject {
  id: string
  title: string
  status: string
  totalFunded: number
  fundingGoal: number
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
    prediction: string
    status: string
    bidder: {
      email: string
    }
  }>
}

interface UseRealtimeProjectOptions {
  onProjectUpdate?: (project: Partial<RealtimeProject>) => void
  onNewBid?: (bid: unknown) => void
  onNewFunding?: (funding: unknown) => void
  onBidsChange?: () => void
  onFundingsChange?: () => void
}

/**
 * Hook to subscribe to real-time updates for a project
 * Handles project status changes, new bids, and new fundings
 */
export function useRealtimeProject(projectId: string, options: UseRealtimeProjectOptions = {}) {
  const unsubscribeRef = useRef<(() => void)[]>([])

  const cleanup = useCallback(() => {
    unsubscribeRef.current.forEach((unsub) => unsub())
    unsubscribeRef.current = []
  }, [])

  useEffect(() => {
    if (!projectId) return

    // Subscribe to project status/funding updates
    const unsubProject = subscribeToProjectUpdates(projectId, (project) => {
      if (options.onProjectUpdate) {
        options.onProjectUpdate(project as Partial<RealtimeProject>)
      }
    })

    // Subscribe to new bids
    const unsubBids = subscribeToBidsOnProject(projectId, (bid) => {
      if (options.onNewBid) {
        options.onNewBid(bid)
      }
      // Trigger bids refetch
      if (options.onBidsChange) {
        options.onBidsChange()
      }
    })

    // Subscribe to new fundings
    const unsubFundings = subscribeToFundingsOnProject(projectId, (funding) => {
      if (options.onNewFunding) {
        options.onNewFunding(funding)
      }
      // Trigger fundings refetch
      if (options.onFundingsChange) {
        options.onFundingsChange()
      }
    })

    unsubscribeRef.current = [unsubProject, unsubBids, unsubFundings]

    return cleanup
  }, [projectId, options, cleanup])

  return { cleanup }
}
