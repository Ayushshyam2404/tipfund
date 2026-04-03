'use client'

import { useEffect, useRef, useState } from 'react'

interface TouchPosition {
  x: number
  y: number
}

/**
 * Hook for detecting swipe gestures
 */
export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) {
  const ref = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null)
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart({
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      })
    }

    const handleTouchEnd = (e: TouchEvent) => {
      setTouchEnd({
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      })

      if (touchStart) {
        const distance = {
          x: Math.abs(e.changedTouches[0].clientX - touchStart.x),
          y: Math.abs(e.changedTouches[0].clientY - touchStart.y),
        }

        if (distance.x > threshold && distance.x > distance.y) {
          if (e.changedTouches[0].clientX < touchStart.x) {
            onSwipeLeft?.()
          } else {
            onSwipeRight?.()
          }
        } else if (distance.y > threshold && distance.y > distance.x) {
          if (e.changedTouches[0].clientY < touchStart.y) {
            onSwipeUp?.()
          } else {
            onSwipeDown?.()
          }
        }
      }
    }

    const element = ref.current
    if (element) {
      element.addEventListener('touchstart', handleTouchStart)
      element.addEventListener('touchend', handleTouchEnd)

      return () => {
        element.removeEventListener('touchstart', handleTouchStart)
        element.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [touchStart, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])

  return ref
}

/**
 * Hook for detecting long press
 */
export function useLongPress(
  callback: () => void,
  delay = 500
) {
  const ref = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const handleTouchStart = () => {
      setIsPressed(true)
      timeoutRef.current = setTimeout(callback, delay)
    }

    const handleTouchEnd = () => {
      setIsPressed(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    const element = ref.current
    if (element) {
      element.addEventListener('touchstart', handleTouchStart)
      element.addEventListener('touchend', handleTouchEnd)
      element.addEventListener('touchcancel', handleTouchEnd)

      return () => {
        element.removeEventListener('touchstart', handleTouchStart)
        element.removeEventListener('touchend', handleTouchEnd)
        element.removeEventListener('touchcancel', handleTouchEnd)
      }
    }
  }, [callback, delay])

  return { ref, isPressed }
}

/**
 * Hook for detecting device orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<
    'portrait' | 'landscape' | 'unknown'
  >('unknown')

  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.matchMedia('(orientation: portrait)').matches) {
        setOrientation('portrait')
      } else if (window.matchMedia('(orientation: landscape)').matches) {
        setOrientation('landscape')
      }
    }

    handleOrientationChange()
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [])

  return orientation
}

/**
 * Hook for detecting if device is mobile
 */
export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      const isTabletDevice = /iPad|Android/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth < 768

      setIsMobile(isMobileDevice || isSmallScreen)
      setIsTablet(isTabletDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isTablet }
}

/**
 * Hook for safe viewport
 */
export function useSafeViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
  })

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)

    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return viewport
}
