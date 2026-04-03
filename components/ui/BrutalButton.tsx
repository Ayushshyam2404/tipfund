'use client'

import React from "react";
import { motion } from "framer-motion";

interface BrutalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function BrutalButton({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: BrutalButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary: "brutal-button bg-fg text-white hover:bg-accent-yellow hover:text-fg",
    secondary: "brutal-button bg-bg text-fg border-fg hover:bg-fg hover:text-white",
    danger: "brutal-button bg-accent-red text-white hover:bg-fg hover:text-white",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <button
        className={`
          ${variantClasses[variant]} 
          ${sizeClasses[size]}
          border-[3px]
          font-arial-black
          font-black
          uppercase
          letter-spacing-wider
          cursor-pointer
          transition-all
          duration-200
          active:translate-x-1
          active:translate-y-1
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}

export default BrutalButton;
