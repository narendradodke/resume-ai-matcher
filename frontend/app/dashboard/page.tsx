"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  TrendingUp,
  History,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface AnalysisItem {
  id: string;
  resume_id: string;
  job_description: string;
  match_score: number | null;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisItem[]>([]);
  const [totalScans, setTotalScans] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/analysis/history?page=1&limit=5");
        if (res.data?.success && res.data?.data) {
          const items: AnalysisItem[] = res.data.data.items || [];
          setRecentAnalyses(items);
          setTotalScans(res.data.data.total || 0);

          const scored = items.filter((i) => i.match_score !== null);
          if (scored.length > 0) {
            const sum = scored.reduce((acc, curr) => acc + (curr.match_score || 0), 0);
            setAvgScore(Math.round(sum / scored.length));
          }
        }
      } catch {
        // Fallback for empty/offline
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300 mb-3">
              <Sparkles className="h-3 w-3" /> Dashboard Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || "Job Seeker"}!
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Optimize your resume against target job descriptions and monitor your ATS score progression over time.
            </p>
          </div>

          <Link href="/dashboard/upload">
            <Button variant="gradient" size="lg" className="gap-2 shadow-violet-600/30">
              <UploadCloud className="h-4 w-4" />
              New Resume Match
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Analyses</CardTitle>
            <History className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-white">{totalScans}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">Total job descriptions evaluated</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Average Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-white">
                {avgScore > 0 ? `${avgScore}%` : "—"}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Across your recent evaluations</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Account Plan</CardTitle>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white capitalize">{user?.plan || "Free"}</div>
            <p className="text-xs text-slate-500 mt-1">
              {user?.plan === "pro" ? "Unlimited analyses active" : "Starter tier active"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Analyses</h2>
          {recentAnalyses.length > 0 && (
            <Link href="/dashboard/history" className="text-xs text-violet-400 hover:text-violet-300 font-medium">
              View all history →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40"
              >
                <div className="space-y-2 flex-1 mr-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : recentAnalyses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No resume analyses yet</h3>
            <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
              Upload your PDF resume and paste any target job description to get your first instant match score.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/upload">
                <Button variant="gradient" size="sm" className="gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Run First Analysis
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            {recentAnalyses.map((analysis) => {
              const snippet = analysis.job_description.slice(0, 100) + "...";
              const dateStr = new Date(analysis.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={analysis.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-900/70 transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-200 line-clamp-1">{snippet}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dateStr}
                      </span>
                      <span className="capitalize text-slate-400">{analysis.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    {analysis.match_score !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{analysis.match_score}%</span>
                        <span className="text-xs text-slate-400">Match</span>
                      </div>
                    ) : (
                      <Badge variant="secondary">Processing</Badge>
                    )}

                    <Link href={`/dashboard/result/${analysis.id}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        View Report
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
