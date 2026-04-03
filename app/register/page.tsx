"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrutalCard, BrutalButton, BrutalInput } from "@/components/ui";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { signUpWithEmail, signInWithGitHub } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

function RegisterContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/onboarding/role-select");
    }
  }, [user, authLoading, router]);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (email.length < 5 || !email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error: signUpError } = await signUpWithEmail(email, password);
      if (signUpError) throw signUpError;

      setSuccess("Account created! Please check your email to confirm.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      const { error: signUpError } = await signInWithGitHub();
      if (signUpError) throw signUpError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub signup failed");
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
          <div className="mb-12 text-center font-mono text-xs leading-tight text-accent-yellow overflow-x-auto">
            <pre>{`
_____ _____ _____ _____ _____ _____ _____ _____ _____ 
|  _  | ____|  _  |  _  |_   _| ____|  _  |  _  |_   _|
| |_| |  _  | | | | | | | | | |  _  | |_| | | | | | |
|  _  | |___| | | | | | | | | | |___| |   _| | | | | |
|_| |_|_____|_| |_|_| |_| |_| |_____|_| \\____|_| |_| |_|
              `}</pre>
          </div>

          <BrutalCard className="p-8">
            <h1 className="text-3xl font-Arial-black font-black uppercase mb-2">
              CREATE ACCOUNT
            </h1>
            <p className="text-sm text-gray-600 uppercase mb-8">
              Join FundForge and start your journey
            </p>

            {error && (
              <div className="mb-6 p-4 border-[2px] border-accent-red bg-accent-red/10">
                <p className="text-accent-red text-sm uppercase font-bold">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 border-[2px] border-accent-lime bg-accent-lime/10">
                <p className="text-accent-lime text-sm uppercase font-bold">{success}</p>
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-4 mb-6">
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

              <BrutalInput
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />

              <div className="text-xs text-gray-600 uppercase font-mono">
                <p>✓ At least 8 characters</p>
                <p>✓ Passwords must match</p>
              </div>

              <BrutalButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "CREATING..." : "CREATE ACCOUNT"}
              </BrutalButton>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 border-t-[2px] border-fg" />
              <span className="text-xs uppercase text-gray-600">OR</span>
              <div className="flex-1 border-t-[2px] border-fg" />
            </div>

            {/* GitHub SignUp */}
            <BrutalButton
              type="button"
              variant="secondary"
              onClick={handleGitHubSignUp}
              disabled={loading}
              className="w-full mb-6"
            >
              {loading ? "..." : "SIGN UP WITH GITHUB"}
            </BrutalButton>

            {/* Footer */}
            <div className="text-center space-y-2 text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-accent-yellow font-bold hover:underline"
                >
                  SIGN IN
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <RegisterContent />
    </Suspense>
  );
}
