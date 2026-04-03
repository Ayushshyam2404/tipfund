"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  delayChildren?: boolean;
}

export function PageTransition({
  children,
  delayChildren = false,
}: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
    >
      {/* Black wipe overlay */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        exit={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ originX: 0 }}
        className="fixed inset-0 bg-black z-50 pointer-events-none"
      />

      {/* Page content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          delay: delayChildren ? 0.2 : 0,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default PageTransition;
