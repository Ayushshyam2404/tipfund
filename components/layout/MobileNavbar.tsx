'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BrutalButton } from '../ui/BrutalButton'

interface NavbarLink {
  href: string
  label: string
}

interface MobileNavbarProps {
  links?: NavbarLink[]
  logo?: React.ReactNode
  actions?: React.ReactNode
}

const defaultLinks: NavbarLink[] = [
  { href: '/', label: 'HOME' },
  { href: '/projects', label: 'PROJECTS' },
  { href: '/dashboard', label: 'DASHBOARD' },
  { href: '/settlement', label: 'SETTLEMENT' },
  { href: '/leaderboard', label: 'LEADERBOARD' },
]

export function MobileNavbar({
  links = defaultLinks,
  logo,
  actions,
}: MobileNavbarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="border-b-[3px] border-fg bg-bg sticky top-0 z-50">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 font-arial-black text-xl font-black">
            {logo || (
              <span className="uppercase tracking-tight">
                FUND
                <span className="text-accent-yellow">FORGE</span>
              </span>
            )}
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4
                  py-2
                  font-bold
                  uppercase
                  text-xs
                  xl:text-sm
                  border-b-2
                  transition-all
                  ${
                    pathname === link.href
                      ? 'border-accent-yellow text-accent-yellow'
                      : 'border-transparent text-fg hover:border-gray-600'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {actions}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center border-[3px] border-fg hover:bg-accent-yellow hover:text-fg transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col gap-1.5">
              <motion.span
                className="w-5 h-0.5 bg-fg block"
                animate={isOpen ? { rotate: 45, y: 10 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-5 h-0.5 bg-fg block"
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-5 h-0.5 bg-fg block"
                animate={isOpen ? { rotate: -45, y: -10 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Menu - Slides down on mobile */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t-[3px] border-fg overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {links.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        block px-4 py-3 font-bold uppercase text-sm
                        border-l-[3px] transition-all
                        ${
                          pathname === link.href
                            ? 'border-accent-yellow text-accent-yellow bg-accent-yellow/10'
                            : 'border-transparent text-fg hover:border-gray-600'
                        }
                      `}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Actions */}
                {actions && (
                  <div className="pt-2 border-t border-gray-700 mt-2">
                    <div className="px-4">{actions}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default MobileNavbar
