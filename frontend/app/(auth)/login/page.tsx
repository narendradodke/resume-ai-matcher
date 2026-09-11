"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back! Redirecting to dashboard...");
    } catch (err: unknown) {
      const msg = formatApiError(err, "Invalid email or password. Please try again.");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-slate-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand logo */}
      <Link href="/" className="mb-8 flex items-center gap-2.5 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-600/30 group-hover:scale-105 transition-transform">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">
          Resume<span className="text-violet-400">AI</span>
        </span>
      </Link>

      <Card className="w-full max-w-md border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-violet-950/25 relative z-10">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-white">Sign In to ResumeAI</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Password
                </label>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-sm font-semibold shadow-violet-600/30 gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-semibold underline-offset-4 hover:underline">
                Create free account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
