'use client'

import React, { useState } from "react";
import { motion } from "framer-motion";

interface BrutalInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function BrutalInput({
  label,
  error,
  icon,
  className = "",
  ...props
}: BrutalInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <motion.label
          className="block text-sm font-bold uppercase mb-2 text-fg font-arial-black"
          animate={{ x: focused ? 2 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-3.5 text-accent-yellow">{icon}</div>}
        <motion.div
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <input
            className={`
              brutal-input
              w-full
              border-[3px]
              border-fg
              bg-bg
              text-fg
              px-4
              py-3
              font-mono
              text-sm
              placeholder-gray-600
              focus:outline-none
              focus:border-accent-yellow
              focus:shadow-lg
              focus:shadow-accent-yellow
              transition-all
              duration-200
              ${icon ? "pl-10" : ""}
              ${error ? "border-accent-red focus:border-accent-red focus:shadow-accent-red" : ""}
              ${className}
            `}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </motion.div>
      </div>
      {error && (
        <p className="text-accent-red text-xs font-bold uppercase mt-1">{error}</p>
      )}
    </div>
  );
}

export default BrutalInput;
