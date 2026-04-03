'use client'

import React from "react";
import { motion } from "framer-motion";

interface BrutalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hover" | "active";
  onClick?: () => void;
}

export function BrutalCard({
  children,
  className = "",
  variant = "default",
  onClick,
}: BrutalCardProps) {
  const baseStyle =
    "border-[3px] border-fg bg-bg box-shadow shadow-brutal p-6";
  const variantStyle = {
    default: "hover:shadow-brutal-hover hover:-translate-x-1 hover:-translate-y-1",
    hover: "shadow-brutal-hover -translate-x-1 -translate-y-1",
    active: "shadow-sm translate-x-1 translate-y-1",
  };

  return (
    <motion.div
      className={`brutal-card ${baseStyle} ${variantStyle[variant]} transition-all duration-200 ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

export default BrutalCard;
