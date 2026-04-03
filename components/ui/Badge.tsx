import React from "react";

interface BadgeProps {
  variant?:
    | "default"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "owner"
    | "funder"
    | "bidder";
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  const variantClasses = {
    default:
      "bg-bg border-fg text-fg",
    success:
      "bg-accent-lime border-accent-lime text-fg",
    danger:
      "bg-accent-red border-accent-red text-white",
    warning:
      "bg-accent-yellow border-accent-yellow text-fg",
    info: "bg-accent-blue border-accent-blue text-white",
    owner: "bg-accent-red border-accent-red text-white",
    funder: "bg-accent-yellow border-accent-yellow text-fg",
    bidder: "bg-accent-blue border-accent-blue text-white",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        px-3
        py-1
        border-2
        ${variantClasses[variant]}
        font-bold
        text-xs
        uppercase
        font-arial-black
        letter-spacing-wider
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;
