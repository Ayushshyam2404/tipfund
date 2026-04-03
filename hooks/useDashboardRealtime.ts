import { useEffect, useRef, useCallback } from 'react'
import { subscribeToLeaderboardUpdates } from '@/lib/realtime'

interface UseDashboardRealtimeOptions {
  onLeaderboardChange?: () => void
  onProjectChanges?: () => void
  onFundingChanges?: () => void
  onBidChanges?: () => void
}

/**
 * Hook to subscribe to real-time updates for dashboard
 * Refreshes stats when there are changes to leaderboard, projects, fundings, or bids
 */
export function useDashboardRealtime(options: UseDashboardRealtimeOptions = {}) {
  const unsubscribeRef = useRef<(() => void)[]>([])

  const cleanup = useCallback(() => {
    unsubscribeRef.current.forEach((unsub) => unsub())
    unsubscribeRef.current = []
  }, [])

  useEffect(() => {
    // Subscribe to leaderboard (bids) changes
    const unsubLeaderboard = subscribeToLeaderboardUpdates(() => {
      if (options.onLeaderboardChange) {
        options.onLeaderboardChange()
      }
      if (options.onBidChanges) {
        options.onBidChanges()
      }
    })

    unsubscribeRef.current = [unsubLeaderboard]

    return cleanup
  }, [options, cleanup])

  return { cleanup }
}
