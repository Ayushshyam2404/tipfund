"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { BrutalCard, BrutalButton, Badge } from "@/components/ui";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

const ROLES = [
  {
    id: "OWNER",
    title: "Project Owner",
    description: "Submit your GitHub projects, manage funding goals, and track progress",
    perks: ["Submit projects", "Set funding goals", "Track contributions", "Receive funding"],
    color: "accent-red",
  },
  {
    id: "FUNDER",
    title: "Funder",
    description: "Invest in promising projects and support developers you believe in",
    perks: ["Browse projects", "Fund projects", "Track investments", "Get updates"],
    color: "accent-yellow",
  },
  {
    id: "BIDDER",
    title: "Bidder",
    description: "Wager on project success with risk-based predictions and payouts",
    perks: ["Place bids", "Predict outcomes", "Earn rewards", "Compete on leaderboard"],
    color: "accent-blue",
  },
];

function RoleSelectContent() {
  const router = useRouter();
  const { user, loading: authLoading, refetchUser } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
    setError("");
  };

  const handleConfirm = async () => {
    if (selectedRoles.length === 0) {
      setError("Please select at least one role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/set-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to set roles");
      }

      await refetchUser();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set roles");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-12 h-12 border-3 border-fg border-t-accent-yellow rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-Arial-black font-black uppercase mb-4">
              CHOOSE YOUR <span className="text-accent-yellow">ROLE</span>
            </h1>
            <p className="text-lg text-gray-600 uppercase font-mono">
              Select one or more roles to get started
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 border-[2px] border-accent-red bg-accent-red/10 max-w-2xl mx-auto">
              <p className="text-accent-red text-sm uppercase font-bold">{error}</p>
            </div>
          )}

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {ROLES.map((role) => (
              <div
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <BrutalCard
                  variant={selectedRoles.includes(role.id) ? "active" : "default"}
                  className={`h-full border-4 ${
                    selectedRoles.includes(role.id)
                      ? `border-${role.color}`
                      : "border-fg"
                  } transition-all`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-Arial-black font-black uppercase">
                        {role.title}
                      </h3>
                      <div className="text-2xl">
                        {selectedRoles.includes(role.id) ? "✓" : "○"}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">{role.description}</p>

                    <div className="border-t-[2px] border-fg pt-4">
                      <p className="text-xs font-bold uppercase text-gray-600 mb-2">
                        PERKS:
                      </p>
                      <ul className="space-y-2">
                        {role.perks.map((perk) => (
                          <li key={perk} className="text-xs text-gray-600 flex gap-2">
                            <span className="text-accent-yellow">→</span>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={role.id.toLowerCase() as any}>
                        {role.id}
                      </Badge>
                    </div>
                  </div>
                </BrutalCard>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 uppercase font-mono mb-4">
                {selectedRoles.length > 0
                  ? `Selected: ${selectedRoles.join(", ")}`
                  : "Select at least one role to continue"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="max-w-2xl mx-auto flex gap-4 justify-center">
            <BrutalButton
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              BACK
            </BrutalButton>
            <BrutalButton
              onClick={handleConfirm}
              disabled={loading || selectedRoles.length === 0}
              className="px-8"
            >
              {loading ? "SAVING..." : "CONTINUE"}
            </BrutalButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RoleSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <RoleSelectContent />
    </Suspense>
  );
}
