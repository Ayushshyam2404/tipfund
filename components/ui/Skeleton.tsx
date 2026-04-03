"use client";

import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "card" | "circle" | "rect";
  count?: number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  variant = "text",
  count = 1,
  className = "",
}: SkeletonProps) {
  const skeletons = Array(count).fill(null);

  const variantClasses = {
    text: "h-4 rounded-none w-full mb-2 last:mb-0",
    card: "h-48 rounded-none w-full mb-4 last:mb-0",
    circle: "h-12 w-12 rounded-full mb-2 last:mb-0",
    rect: "h-20 w-20 rounded-none mb-2 last:mb-0",
  };

  const variantWidth = variant === "circle" ? "w-12" : "w-full";
  const variantHeight = variant === "circle" ? "h-12" : "auto";

  return (
    <div className="space-y-2">
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className={`
            ${variantClasses[variant]}
            ${variantWidth}
            bg-bg
            border-[2px]
            border-gray-700
            relative
            overflow-hidden
            ${className}
          `}
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          {/* Shimmer animation */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(255, 255, 0, 0.2), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Skeleton;
