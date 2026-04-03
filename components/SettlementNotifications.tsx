'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SettlementNotification {
  id: string
  type: 'WON' | 'LOST' | 'PENDING_SETTLEMENT'
  bidAmount: number
  payout: number
  projectTitle: string
  timestamp: number
}

export function SettlementNotificationCenter() {
  const [notifications, setNotifications] = useState<SettlementNotification[]>([])

  const addNotification = useCallback(
    (notification: Omit<SettlementNotification, 'id' | 'timestamp'>) => {
      const id = Math.random().toString(36).substring(7)
      const newNotification: SettlementNotification = {
        ...notification,
        id,
        timestamp: Date.now(),
      }

      setNotifications((prev) => [...prev, newNotification])

      // Auto-remove after 6 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== id)
        )
      }, 6000)

      return id
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <>
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <SettlementNotification
            key={notification.id}
            notification={notification}
            index={index}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>

      {/* Expose methods globally for testing */}
      {typeof window !== 'undefined' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__settlementNotifications = {
                add: (notification) => {
                  // This will be set by the component
                }
              }
            `,
          }}
        />
      )}
    </>
  )
}

interface NotificationProps {
  notification: SettlementNotification
  index: number
  onClose: () => void
}

function SettlementNotification({
  notification,
  index,
  onClose,
}: NotificationProps) {
  const isWin = notification.type === 'WON'
  const profitLoss = notification.payout - notification.bidAmount
  const profitPercent = ((profitLoss / notification.bidAmount) * 100).toFixed(1)

  const colors = {
    WON: {
      bg: 'bg-green-500/20',
      border: 'border-green-500',
      text: 'text-green-400',
      icon: '🎉',
    },
    LOST: {
      bg: 'bg-red-500/20',
      border: 'border-red-500',
      text: 'text-red-400',
      icon: '❌',
    },
    PENDING_SETTLEMENT: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500',
      text: 'text-yellow-400',
      icon: '⏳',
    },
  }

  const color = colors[notification.type]

  // Celebration particles for wins
  const celebrationParticles = isWin
    ? Array.from({ length: 8 }, (_, i) => i)
    : []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, x: 400 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 400 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        duration: 0.5,
      }}
      className={`fixed right-6 z-50 pointer-events-auto`}
      style={{
        top: `${24 + index * 120}px`,
      }}
    >
      {/* Celebration particles */}
      <AnimatePresence>
        {celebrationParticles.map((i) => (
          <motion.div
            key={`particle-${i}`}
            className="fixed pointer-events-none"
            initial={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 50,
              opacity: 1,
            }}
            animate={{
              x: Math.random() * 200 - 100,
              y: Math.random() * 300,
              opacity: 0,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            exit={{ opacity: 0 }}
          >
            <span className="text-xl">{['✨', '⭐', '💫'][Math.floor(Math.random() * 3)]}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      <div
        className={`
          ${color.bg} ${color.border} border-2 rounded-sm p-4
          max-w-sm backdrop-blur-sm cursor-pointer
          hover:border-purple-400 transition-colors
          shadow-lg
        `}
        onClick={onClose}
      >
        <motion.div
          className="flex items-start gap-3"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.span
            className="text-2xl flex-shrink-0"
            animate={isWin ? { rotate: [0, 10, -10, 0] } : {}}
            transition={isWin ? { duration: 0.6, delay: 0.2 } : {}}
          >
            {color.icon}
          </motion.span>

          <div className="flex-1 min-w-0">
            <p className={`font-black text-sm ${color.text}`}>
              {notification.type === 'WON'
                ? 'Bid Won!'
                : notification.type === 'LOST'
                  ? 'Bid Lost'
                  : 'Settlement Pending'}
            </p>

            <p className="text-white text-xs mt-1 truncate">
              {notification.projectTitle}
            </p>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-400">
                ${(notification.bidAmount / 1000).toFixed(2)}K bid
              </span>
              <motion.span
                className={`font-bold ${
                  profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
              >
                {profitLoss >= 0 ? '+' : '−'}${(Math.abs(profitLoss) / 1000).toFixed(2)}K
              </motion.span>
            </div>

            {notification.type !== 'PENDING_SETTLEMENT' && (
              <div className="mt-2 h-1 bg-black rounded-full overflow-hidden">
                <motion.div
                  className={
                    isWin ? 'bg-green-500 h-full' : 'bg-red-500 h-full'
                  }
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5.5 }}
                />
              </div>
            )}
          </div>

          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Context hook for using notifications throughout the app
interface SettlementNotificationContextType {
  addNotification: (notification: Omit<SettlementNotification, 'id' | 'timestamp'>) => void
}

const SettlementNotificationContext = createContext<
  SettlementNotificationContextType | undefined
>(undefined)

export function SettlementNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<SettlementNotification[]>([])

  const addNotification = useCallback(
    (notification: Omit<SettlementNotification, 'id' | 'timestamp'>) => {
      const id = Math.random().toString(36).substring(7)
      const newNotification: SettlementNotification = {
        ...notification,
        id,
        timestamp: Date.now(),
      }

      setNotifications((prev) => [...prev, newNotification])

      // Auto-remove after 6 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== id)
        )
      }, 6000)
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <SettlementNotificationContext.Provider value={{ addNotification }}>
      {children}

      {/* Render all notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <SettlementNotification
            key={notification.id}
            notification={notification}
            index={index}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </SettlementNotificationContext.Provider>
  )
}

export function useSettlementNotifications() {
  const context = useContext(SettlementNotificationContext)
  if (!context) {
    throw new Error(
      'useSettlementNotifications must be used within SettlementNotificationProvider'
    )
  }
  return context
}
