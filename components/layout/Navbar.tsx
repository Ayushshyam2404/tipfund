"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrutalButton } from "../ui/BrutalButton";

interface NavbarLink {
  href: string;
  label: string;
}

interface NavbarProps {
  links?: NavbarLink[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
}

const defaultLinks: NavbarLink[] = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/leaderboard", label: "LEADERBOARD" },
];

export function Navbar({
  links = defaultLinks,
  logo,
  actions,
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b-[3px] border-fg bg-bg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 font-Arial-black text-2xl font-black">
            {logo || (
              <span className="uppercase tracking-tight">
                FUND
                <span className="text-accent-yellow">FORGE</span>
              </span>
            )}
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4
                  py-2
                  font-bold
                  uppercase
                  text-sm
                  border-b-2
                  transition-all
                  ${
                    pathname === link.href
                      ? "border-accent-yellow text-accent-yellow"
                      : "border-transparent text-fg hover:border-gray-600"
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions || (
              <>
                <BrutalButton variant="secondary" size="sm" className="hidden sm:inline-block">
                  SIGN IN
                </BrutalButton>
                <BrutalButton variant="primary" size="sm" className="hidden sm:inline-block">
                  SUBMIT
                </BrutalButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
