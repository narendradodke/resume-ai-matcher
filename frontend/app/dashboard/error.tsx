"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/40 text-red-400 border border-red-800/40 mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        {error.message || "An unexpected error occurred while loading this view."}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => reset()} className="gap-2">
          <RefreshCcw className="h-3.5 w-3.5" />
          Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="gradient" size="sm" className="gap-2">
            <Home className="h-3.5 w-3.5" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
