"use client";

import React from "react";
import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const defaultColumns: FooterColumn[] = [
  {
    title: "PRODUCT",
    links: [
      { label: "Projects", href: "/projects" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "For Funders", href: "/for-funders" },
      { label: "For Bidders", href: "/for-bidders" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

interface FooterProps {
  columns?: FooterColumn[];
  customContent?: React.ReactNode;
}

export function Footer({
  columns = defaultColumns,
  customContent,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-[3px] border-fg bg-bg mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {customContent ? (
          customContent
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
              {columns.map((column) => (
                <div key={column.title}>
                  <h3 className="font-bold uppercase text-sm font-arial-black mb-4 text-accent-yellow">
                    {column.title}
                  </h3>
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm uppercase text-gray-600 hover:text-fg transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t-[3px] border-fg my-8" />

            {/* Bottom bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs uppercase text-gray-600 font-mono">
                © {currentYear} FundForge. All rights reserved.
              </p>

              {/* Social links */}
              <div className="flex gap-4">
                {["twitter", "github", "discord"].map((social) => (
                  <Link
                    key={social}
                    href={`#${social}`}
                    className="text-xs uppercase font-bold text-fg hover:text-accent-yellow transition-colors"
                  >
                    {social}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}

export default Footer;
