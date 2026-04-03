"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrutalCard, BrutalButton, BrutalInput } from "@/components/ui";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { signInWithEmail, signInWithGitHub } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await signInWithEmail(email, password);
      if (signInError) throw signInError;

      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await signInWithGitHub();
      if (signInError) throw signInError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub login failed");
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

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* ASCII Art Header */}
          <div className="mb-12 text-center font-mono text-xs leading-tight text-accent-yellow mb-8 overflow-x-auto">
            <pre>{`
 _____ _   _ _   _ _____ _____ _____ _____ _____ 
|  _  | | | | \\ | |  _  |  _  | ____|  _  |  _  |
| | | | | | |  \\| | | | | | | |  _  | | | | | | |
| | | | | | | |\\  | | | | | | | |___| | | | | | |
|_| |_|_|_|_|_| \\_|_| |_|_| |_|_____|_| |_|_| |_|
              `}</pre>
          </div>

          <BrutalCard className="p-8">
            <h1 className="text-3xl font-Arial-black font-black uppercase mb-2">
              SIGN IN
            </h1>
            <p className="text-sm text-gray-600 uppercase mb-8">
              Access your FundForge account
            </p>

            {error && (
              <div className="mb-6 p-4 border-[2px] border-accent-red bg-accent-red/10">
                <p className="text-accent-red text-sm uppercase font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-6 mb-6">
              <BrutalInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <BrutalInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <BrutalButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </BrutalButton>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 border-t-[2px] border-fg" />
              <span className="text-xs uppercase text-gray-600">OR</span>
              <div className="flex-1 border-t-[2px] border-fg" />
            </div>

            {/* GitHub Login */}
            <BrutalButton
              type="button"
              variant="secondary"
              onClick={handleGitHubLogin}
              disabled={loading}
              className="w-full mb-6"
            >
              {loading ? "..." : "SIGN IN WITH GITHUB"}
            </BrutalButton>

            {/* Footer */}
            <div className="text-center space-y-2 text-sm">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-accent-yellow font-bold hover:underline"
                >
                  REGISTER
                </Link>
              </p>
              <Link
                href="/"
                className="text-gray-600 hover:text-fg transition-colors inline-block"
              >
                ← Back to home
              </Link>
            </div>
          </BrutalCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <LoginContent />
    </Suspense>
  );
}
