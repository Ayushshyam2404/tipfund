'use client'

import React from 'react'
import { ReactNode } from 'react'

interface ResponsiveFormProps {
  children: ReactNode
  className?: string
  columns?: number
}

/**
 * Responsive form component
 * Mobile: 1 column
 * Tablet: 2 columns (if columns specified)
 * Desktop: Full width or multi-column
 */
export function ResponsiveForm({
  children,
  className = '',
  columns = 1,
}: ResponsiveFormProps) {
  const colsClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'
      : columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
        : 'flex flex-col gap-4'

  return <form className={`${colsClass} ${className}`}>{children}</form>
}

interface ResponsiveCardGridProps {
  children: ReactNode
  className?: string
}

/**
 * Responsive card grid
 * Mobile: 1 card
 * Tablet: 2 cards
 * Desktop: 3 cards
 */
export function ResponsiveCardGrid({
  children,
  className = '',
}: ResponsiveCardGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 ${className}`}>
      {children}
    </div>
  )
}

interface ResponsiveLayoutProps {
  sidebar: ReactNode
  content: ReactNode
  className?: string
}

/**
 * Responsive two-column layout
 * Mobile: stacked
 * Desktop: sidebar + content
 */
export function ResponsiveLayout({
  sidebar,
  content,
  className = '',
}: ResponsiveLayoutProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 ${className}`}
    >
      <div className="lg:col-span-3">{content}</div>
      <div className="lg:col-span-1">{sidebar}</div>
    </div>
  )
}

interface ResponsiveSectionProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

/**
 * Responsive section with title and description
 */
export function ResponsiveSection({
  children,
  className = '',
  title,
  description,
}: ResponsiveSectionProps) {
  return (
    <section className={`py-6 md:py-8 lg:py-12 ${className}`}>
      {title && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2 md:mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-base md:text-lg text-gray-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

interface ResponsiveTablesProps {
  children: ReactNode
  className?: string
}

/**
 * Responsive table wrapper for small screens
 * Shows table normally on desktop
 * Converts to card layout on mobile
 */
export function ResponsiveTable({
  children,
  className = '',
}: ResponsiveTablesProps) {
  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="inline-block min-w-full">{children}</div>
    </div>
  )
}

interface MobileMenuItemProps {
  children: ReactNode
  className?: string
  divider?: boolean
}

/**
 * Mobile menu item with touch-friendly sizing
 */
export function MobileMenuItem({
  children,
  className = '',
  divider = false,
}: MobileMenuItemProps) {
  return (
    <>
      <div className={`px-4 py-3 md:px-6 md:py-4 min-h-[48px] flex items-center ${className}`}>
        {children}
      </div>
      {divider && <div className="h-px bg-gray-700" />}
    </>
  )
}

interface ResponsivePaddingProps {
  children: ReactNode
  className?: string
}

/**
 * Responsive padding that scales with screen size
 * Mobile: p-4
 * Tablet: p-6
 * Desktop: p-8
 */
export function ResponsivePadding({
  children,
  className = '',
}: ResponsivePaddingProps) {
  return (
    <div className={`p-4 sm:p-6 md:p-8 lg:p-12 ${className}`}>{children}</div>
  )
}

interface ResponsiveTextSizeProps {
  children: ReactNode
  className?: string
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small'
}

/**
 * Responsive text sizing
 */
export function ResponsiveTextSize({
  children,
  className = '',
  level = 'body',
}: ResponsiveTextSizeProps) {
  const textSizes = {
    h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter',
    h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight',
    h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
    h4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold',
    body: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm',
  }

  return <div className={`${textSizes[level]} ${className}`}>{children}</div>
}
