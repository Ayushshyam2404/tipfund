'use client'

import React from 'react'
import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  paddingMobile?: boolean
}

/**
 * Responsive container that handles mobile, tablet, and desktop layouts
 * Mobile: full-width with max-w-sm, padding-x-4
 * Tablet: max-w-2xl
 * Desktop: max-w-7xl
 */
export function ResponsiveContainer({
  children,
  className = '',
  paddingMobile = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={`
        mx-auto
        w-full
        px-4 sm:px-6 lg:px-8
        max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-7xl
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

/**
 * Responsive grid component
 * Default: 1 column mobile, 2 tablet, 3 desktop
 */
export function ResponsiveGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
}: ResponsiveGridProps) {
  const colsClass = `
    grid-cols-${cols.mobile}
    sm:grid-cols-${cols.tablet}
    lg:grid-cols-${cols.desktop}
  `

  // Use inline styles for dynamic column counts
  const gridCols = `repeat(auto-fit, minmax(${cols.mobile === 1 ? '100%' : cols.mobile === 2 ? '50%' : '33.333%'}, 1fr))`

  return (
    <div
      className={`grid gap-4 sm:gap-6 ${className}`}
      style={{
        gridTemplateColumns:
          typeof window !== 'undefined'
            ? window.innerWidth < 768
              ? `repeat(${cols.mobile}, 1fr)`
              : window.innerWidth < 1024
                ? `repeat(${cols.tablet}, 1fr)`
                : `repeat(${cols.desktop}, 1fr)`
            : `repeat(${cols.desktop}, 1fr)`,
      }}
    >
      {children}
    </div>
  )
}

interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  direction?: 'row' | 'col'
  gap?: 'sm' | 'md' | 'lg'
}

/**
 * Responsive stack component - vertical on mobile, horizontal on desktop
 */
export function ResponsiveStack({
  children,
  className = '',
  direction = 'col',
  gap = 'md',
}: ResponsiveStackProps) {
  const gapClass = gap === 'sm' ? 'gap-2 md:gap-4' : gap === 'md' ? 'gap-4 md:gap-6' : 'gap-6 md:gap-8'

  if (direction === 'row') {
    return (
      <div className={`flex flex-col md:flex-row ${gapClass} ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${gapClass} ${className}`}>
      {children}
    </div>
  )
}

interface ResponsiveHiddenProps {
  children: ReactNode
  className?: string
  from?: 'sm' | 'md' | 'lg' | 'xl'
  to?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Hide content at specific breakpoints
 * from: hide from this breakpoint and up
 * to: hide up to this breakpoint
 */
export function ResponsiveHidden({
  children,
  className = '',
  from,
  to,
}: ResponsiveHiddenProps) {
  if (from) {
    const hideClass =
      from === 'sm'
        ? 'sm:hidden'
        : from === 'md'
          ? 'md:hidden'
          : from === 'lg'
            ? 'lg:hidden'
            : 'xl:hidden'
    return <div className={`${hideClass} ${className}`}>{children}</div>
  }

  if (to) {
    const hideClass =
      to === 'sm'
        ? 'hidden sm:block'
        : to === 'md'
          ? 'hidden md:block'
          : to === 'lg'
            ? 'hidden lg:block'
            : 'hidden xl:block'
    return <div className={`${hideClass} ${className}`}>{children}</div>
  }

  return <div className={className}>{children}</div>
}

interface ResponsiveTextProps {
  children: ReactNode
  className?: string
  sizes?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

/**
 * Responsive text component with different sizes at breakpoints
 */
export function ResponsiveText({
  children,
  className = '',
  sizes = { mobile: 'text-base', tablet: 'text-lg', desktop: 'text-xl' },
}: ResponsiveTextProps) {
  return (
    <div className={`${sizes.mobile} sm:${sizes.tablet} lg:${sizes.desktop} ${className}`}>
      {children}
    </div>
  )
}
