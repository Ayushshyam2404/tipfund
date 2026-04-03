"use client";

import React, { useState } from "react";
import {
  BrutalCard,
  BrutalButton,
  BrutalInput,
  FundingBar,
  Badge,
  Skeleton,
} from "@/components/ui";
import { SectionDivider } from "@/components/layout/SectionDivider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function StyleGuidePage() {
  const [inputValue, setInputValue] = useState("");
  const [currentFunding, setCurrentFunding] = useState(45000);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <section className="mb-20">
          <h1 className="text-5xl md:text-7xl font-Arial-black font-black uppercase mb-4 tracking-tight">
            DESIGN <span className="text-accent-yellow">SYSTEM</span>
          </h1>
          <p className="text-lg text-gray-600 uppercase font-mono">
            Neo-Brutalist UI Components & Layout Elements
          </p>
        </section>

        <SectionDivider variant="bar" />

        {/* Cards */}
        <section className="mb-20">
          <h2 className="text-3xl font-Arial-black font-black uppercase mb-8 text-accent-yellow">
            BRUTAL CARDS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BrutalCard variant="default">
              <h3 className="font-bold uppercase mb-2">Default State</h3>
              <p className="text-sm text-gray-600">
                Hover over me to see the transformation
              </p>
            </BrutalCard>

            <BrutalCard variant="hover">
              <h3 className="font-bold uppercase mb-2">Hover State</h3>
              <p className="text-sm text-gray-600">
                Yellow shadow, offset translation
              </p>
            </BrutalCard>

            <BrutalCard variant="active">
              <h3 className="font-bold uppercase mb-2">Active State</h3>
              <p className="text-sm text-gray-600">
                Minimal shadow, compressed look
              </p>
            </BrutalCard>
          </div>
        </section>

        <SectionDivider variant="stars" />

        {/* Buttons */}
        <section className="mb-20">
          <h2 className="text-3xl font-Arial-black font-black uppercase mb-8 text-accent-yellow">
            BRUTAL BUTTONS
          </h2>

          <div className="space-y-8">
            {/* Primary */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Primary
              </h3>
              <div className="flex gap-4 flex-wrap">
                <BrutalButton size="sm">Small</BrutalButton>
                <BrutalButton size="md">Medium</BrutalButton>
                <BrutalButton size="lg">Large</BrutalButton>
              </div>
            </div>

            {/* Secondary */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Secondary
              </h3>
              <div className="flex gap-4 flex-wrap">
                <BrutalButton variant="secondary" size="sm">
                  Small
                </BrutalButton>
                <BrutalButton variant="secondary" size="md">
                  Medium
                </BrutalButton>
                <BrutalButton variant="secondary" size="lg">
                  Large
                </BrutalButton>
              </div>
            </div>

            {/* Danger */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Danger
              </h3>
              <div className="flex gap-4 flex-wrap">
                <BrutalButton variant="danger" size="sm">
                  Delete
                </BrutalButton>
                <BrutalButton variant="danger" size="md">
                  Remove
                </BrutalButton>
                <BrutalButton variant="danger" size="lg">
                  Reject
                </BrutalButton>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider variant="dashed" />

        {/* Inputs */}
        <section className="mb-20">
          <h2 className="text-3xl font-Arial-black font-black uppercase mb-8 text-accent-yellow">
            BRUTAL INPUTS
          </h2>

          <div className="space-y-6 max-w-md">
            <BrutalInput
              label="Email Address"
              type="email"
              placeholder="user@example.com"
            />

            <BrutalInput
              label="Username"
              type="text"
              placeholder="awesome-dev"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <BrutalInput
              label="Funding Amount"
              type="number"
              placeholder="1000"
              error={inputValue === "bad" ? "Invalid input" : ""}
            />
          </div>
        </section>

        <SectionDivider variant="line" />

        {/* Funding Bar */}
        <section className="mb-20">
          <h2 className="text-3xl font-Arial-black font-black uppercase mb-8 text-accent-yellow">
            FUNDING BAR
          </h2>

          <div className="space-y-8 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                25% Funded
              </h3>
              <FundingBar current={25000} goal={100000} />
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                75% Funded
              </h3>
              <FundingBar current={75000} goal={100000} />
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                100% Funded
              </h3>
              <FundingBar current={100000} goal={100000} />
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Interactive (Click to adjust)
              </h3>
              <FundingBar current={currentFunding} goal={100000} />
              <div className="flex gap-2 mt-4">
                <BrutalButton
                  size="sm"
                  onClick={() =>
                    setCurrentFunding(Math.max(0, currentFunding - 10000))
                  }
                >
                  -10K
                </BrutalButton>
                <BrutalButton
                  size="sm"
                  onClick={() =>
                    setCurrentFunding(Math.min(100000, currentFunding + 10000))
                  }
                >
                  +10K
                </BrutalButton>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider variant="stars" />

        {/* Badges */}
        <section className="mb-20">
          <h2 className="text-3xl font-Arial-black font-black uppercase mb-8 text-accent-yellow">
            BADGES
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Status Badges
              </h3>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="success">✓ SUCCESS</Badge>
                <Badge variant="danger">✗ DANGER</Badge>
                <Badge variant="warning">⚠ WARNING</Badge>
                <Badge variant="info">ℹ INFO</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Role Badges
              </h3>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="owner">OWNER</Badge>
                <Badge variant="funder">FUNDER</Badge>
                <Badge variant="bidder">BIDDER</Badge>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider variant="line" />

        {/* Skeletons */}
        <section className="mb-20">
          <h2 className="text-3xl font-Arial-black font-black uppercase mb-8 text-accent-yellow">
            LOADING SKELETONS
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Text Lines
              </h3>
              <Skeleton count={3} />
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Card
              </h3>
              <Skeleton variant="card" count={1} />
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-gray-600">
                Circle
              </h3>
              <Skeleton variant="circle" count={3} />
            </div>
          </div>
        </section>

        <SectionDivider variant="bar" />

        {/* Typography */}
        <section className="mb-20">
          <h2 className="text-3xl font-Arial-black font-black uppercase mb-8 text-accent-yellow">
            TYPOGRAPHY
          </h2>

          <div className="space-y-4">
            <h1 className="text-5xl font-Arial-black font-black uppercase">
              Heading 1
            </h1>
            <h2 className="text-4xl font-Arial-black font-black uppercase">
              Heading 2
            </h2>
            <h3 className="text-3xl font-Arial-black font-black uppercase">
              Heading 3
            </h3>
            <p className="text-base font-mono text-gray-600">
              Body text with monospace font for code-like feel. Perfect for tech
              products.
            </p>
            <p className="text-sm font-mono text-gray-600 uppercase">
              Small text with uppercase styling
            </p>
          </div>
        </section>

        <SectionDivider variant="stars" />

        {/* Color Palette */}
        <section className="mb-20">
          <h2 className="text-3xl font-Arial-black font-black uppercase mb-8 text-accent-yellow">
            COLOR PALETTE
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-[3px] border-fg p-4">
              <div className="w-full h-20 bg-bg border-[2px] border-fg mb-2" />
              <p className="text-xs font-bold uppercase">Background</p>
              <p className="text-xs text-gray-600">#0a0a0a</p>
            </div>

            <div className="border-[3px] border-fg p-4">
              <div className="w-full h-20 bg-fg border-[2px] border-fg mb-2" />
              <p className="text-xs font-bold uppercase text-bg">Foreground</p>
              <p className="text-xs text-gray-600">#ffffff</p>
            </div>

            <div className="border-[3px] border-fg p-4">
              <div className="w-full h-20 bg-accent-yellow border-[2px] border-fg mb-2" />
              <p className="text-xs font-bold uppercase">Yellow</p>
              <p className="text-xs text-gray-600">#ffff00</p>
            </div>

            <div className="border-[3px] border-fg p-4">
              <div className="w-full h-20 bg-accent-red border-[2px] border-fg mb-2" />
              <p className="text-xs font-bold uppercase text-white">Red</p>
              <p className="text-xs text-gray-600">#ff0000</p>
            </div>

            <div className="border-[3px] border-fg p-4">
              <div className="w-full h-20 bg-accent-blue border-[2px] border-fg mb-2" />
              <p className="text-xs font-bold uppercase text-white">Blue</p>
              <p className="text-xs text-gray-600">#0080ff</p>
            </div>

            <div className="border-[3px] border-fg p-4">
              <div className="w-full h-20 bg-accent-lime border-[2px] border-fg mb-2" />
              <p className="text-xs font-bold uppercase">Lime</p>
              <p className="text-xs text-gray-600">#00ff00</p>
            </div>
          </div>
        </section>

        <SectionDivider variant="line" />
      </main>

      <Footer />
    </div>
  );
}
