import React from "react";

interface SectionDividerProps {
  variant?: "line" | "dashed" | "bar" | "stars";
  className?: string;
}

export function SectionDivider({
  variant = "line",
  className = "",
}: SectionDividerProps) {
  const variants = {
    line: (
      <div className="border-t-[3px] border-fg" />
    ),
    dashed: (
      <div
        className="border-t-[3px] border-fg"
        style={{
          borderTopStyle: "dashed",
          borderTopWidth: "3px",
        }}
      />
    ),
    bar: (
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 border-t-[3px] border-fg" />
        <div className="w-3 h-3 border-[3px] border-fg" />
        <div className="flex-1 border-t-[3px] border-fg" />
      </div>
    ),
    stars: (
      <div className="flex items-center justify-center gap-3">
        <div className="flex-1 border-t-[3px] border-fg" />
        <span className="text-accent-yellow font-bold">★</span>
        <div className="flex-1 border-t-[3px] border-fg" />
      </div>
    ),
  };

  return (
    <div
      className={`my-12 ${className}`}
    >
      {variants[variant]}
    </div>
  );
}

export default SectionDivider;
