"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUp } from "@/lib/supabase/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Film, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) setError(result.error);
      if (result?.success) setSuccess(result.success);
    });
  }

  function handleGoogle() {
    window.location.href = "/api/auth/google";
  }

  if (success) {
    return (
      <div className="min-h-screen bg-studio-bg flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-brand-success/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-brand-success" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">
            Check your email
          </h2>
          <p className="text-white/40 text-sm mb-8">{success}</p>
          <Link
            href="/auth/login"
            className="text-brand-primary hover:text-brand-primary/80 text-sm transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-studio-bg flex items-center justify-center relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-brand-accent/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #4A6CF7 1px, transparent 1px), linear-gradient(to bottom, #4A6CF7 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            PropGo <span className="text-brand-primary">Studio</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-studio-surface border border-studio-border rounded-2xl p-8">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Create your account
          </h1>
          <p className="text-sm text-white/40 mb-8">
            Start with 20 free credits — no credit card required
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-brand-error/10 border border-brand-error/20 rounded-lg text-sm text-brand-error">
              {error}
            </div>
          )}

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 bg-transparent border-studio-border text-white/70 hover:bg-studio-muted hover:text-white hover:border-white/20 transition-all h-11"
            onClick={handleGoogle}
            disabled={isPending}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.45 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-studio-border" />
            <span className="text-xs text-white/25">or</span>
            <div className="flex-1 h-px bg-studio-border" />
          </div>

          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/60 text-sm">
                Full name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Ahmad Syahril"
                required
                autoComplete="name"
                className="bg-studio-bg border-studio-border text-white placeholder:text-white/20 focus:border-brand-primary/50 focus:ring-brand-primary/20 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60 text-sm">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="bg-studio-bg border-studio-border text-white placeholder:text-white/20 focus:border-brand-primary/50 focus:ring-brand-primary/20 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60 text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="bg-studio-bg border-studio-border text-white placeholder:text-white/20 focus:border-brand-primary/50 focus:ring-brand-primary/20 h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-xs text-white/25 text-center">
              By signing up, you agree to our{" "}
              <Link
                href="/terms"
                className="text-white/40 hover:text-white/60 transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-white/40 hover:text-white/60 transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-white/60 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
