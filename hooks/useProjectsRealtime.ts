import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface UseProjectsRealtimeOptions {
  onProjectsChange?: () => void
}

/**
 * Hook to subscribe to real-time updates for projects listing
 * Refreshes when projects are created or updated
 */
export function useProjectsRealtime(options: UseProjectsRealtimeOptions = {}) {
  const unsubscribeRef = useRef<(() => void)[]>([])

  const cleanup = useCallback(() => {
    unsubscribeRef.current.forEach((unsub) => unsub())
    unsubscribeRef.current = []
  }, [])

  useEffect(() => {
    // Subscribe to project changes (INSERT and UPDATE events)
    const channel = supabase
      .channel('all-projects')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'Project',
        },
        () => {
          // Trigger refresh when any project changes
          if (options.onProjectsChange) {
            options.onProjectsChange()
          }
        }
      )
      .subscribe()

    unsubscribeRef.current = [() => channel.unsubscribe()]

    return cleanup
  }, [options, cleanup])

  return { cleanup }
}
