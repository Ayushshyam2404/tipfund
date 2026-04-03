'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Portal } from '@/components/3d/Portal'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { Badge } from '@/components/ui/Badge'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
}

function HeroSection() {
  return (
    <section className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Portal background - positioned absolutely */}
      <div className="absolute inset-0 w-full h-full">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Portal />
        </Suspense>
      </div>

      {/* Content overlay */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Badge variant="info">The Future of Project Funding</Badge>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter"
        >
          Fund Your Ideas,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500">
            Predict the Future
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Decentralized prediction market meets project funding. Bet on GitHub projects, 
          fund the ones you believe in, and earn real returns.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/login">
            <BrutalButton variant="primary" className="px-8 py-4 text-lg">
              Sign In
            </BrutalButton>
          </Link>
          <Link href="/register">
            <BrutalButton variant="secondary" className="px-8 py-4 text-lg">
              Get Started
            </BrutalButton>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 text-gray-500 text-sm">
          <p>No credit card required • 3-minute setup • Start funding today</p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex items-center justify-center">
          <div className="w-1 h-2 bg-gray-500 rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      title: 'Fund Projects',
      description: 'Back GitHub projects with real capital and help them succeed',
      icon: '💰',
    },
    {
      title: 'Predict Outcomes',
      description: 'Use your market insight to predict project success and profit',
      icon: '🎯',
    },
    {
      title: 'Earn Returns',
      description: 'Win bets on project success and fund development simultaneously',
      icon: '📈',
    },
    {
      title: 'GitHub Native',
      description: 'Built for developers, powered by real GitHub repositories',
      icon: '🐙',
    },
  ]

  return (
    <section className="py-24 px-6 bg-black border-t-2 border-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg">
            A platform that combines DeFi mechanics with open-source development
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="p-8 border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black hover:border-purple-500 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { label: 'Active Projects', value: '324' },
    { label: 'Total Funded', value: '$2.4M' },
    { label: 'Community Members', value: '8.2K' },
    { label: 'Success Rate', value: '87%' },
  ]

  return (
    <section className="py-20 px-6 bg-black border-t-2 border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 mb-2">
                {stat.value}
              </div>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 px-6 bg-black border-t-2 border-gray-800">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
          Ready to Launch?
        </h2>
        <p className="text-xl text-gray-400 mb-8">
          Join hundreds of developers and investors shaping the future of open-source funding.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <BrutalButton variant="primary" className="px-8 py-4 text-lg">
              Create Account
            </BrutalButton>
          </Link>
          <Link href="/projects">
            <BrutalButton variant="secondary" className="px-8 py-4 text-lg">
              Browse Projects
            </BrutalButton>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="w-full bg-black text-white overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
    </div>
  )
}
