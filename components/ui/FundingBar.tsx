"use client";

import React from "react";
import { motion } from "framer-motion";

interface FundingBarProps {
  current: number;
  goal: number;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function FundingBar({
  current,
  goal,
  animated = true,
  showLabel = true,
  className = "",
}: FundingBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-2 text-xs font-bold uppercase font-arial-black">
          <span className="text-fg">${current.toLocaleString()}</span>
          <span className="text-gray-600">${goal.toLocaleString()}</span>
        </div>
      )}

      <div className="relative b border-[3px] border-fg bg-bg overflow-hidden h-6">
        {/* Diagonal stripe background pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255, 255, 0, 0.1) 0px, rgba(255, 255, 0, 0.1) 10px, transparent 10px, transparent 20px)",
          }}
        />

        {/* Animated fill bar */}
        {animated ? (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: percentage / 100 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ originX: 0 }}
            className="absolute inset-y-0 left-0 bg-accent-yellow"
          />
        ) : (
          <div
            className="absolute inset-y-0 left-0 bg-accent-yellow transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        )}

        {/* Percentage label */}
        {percentage > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-xs text-fg uppercase font-mono">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="mt-2 text-xs text-gray-600 uppercase">
        {percentage >= 100 ? (
          <span className="text-accent-yellow font-bold">✓ FUNDED</span>
        ) : (
          <span>${(goal - current).toLocaleString()} remaining</span>
        )}
      </div>
    </div>
  );
}

export default FundingBar;
