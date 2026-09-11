"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  History,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  FileText,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface AnalysisItem {
  id: string;
  user_id: string;
  resume_id: string;
  job_description: string;
  match_score: number | null;
  status: string;
  created_at: string;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const limit = 8;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analysis/history?page=${page}&limit=${limit}`);
      if (res.data?.success && res.data?.data) {
        setAnalyses(res.data.data.items || []);
        setTotal(res.data.data.total || 0);
        setTotalPages(res.data.data.total_pages || 1);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredAnalyses = analyses.filter((item) =>
    item.job_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="secondary">Pending</Badge>;
    if (score >= 80) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
          {score}% Match
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-950/40 text-violet-300 border border-violet-500/30">
          {score}% Match
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30">
        {score}% Match
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <History className="h-6 w-6 text-violet-400" />
            Analysis History
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Review past evaluations, check previous match scores, and track your improvements.
          </p>
        </div>

        <Link href="/dashboard/upload">
          <Button variant="gradient" size="sm" className="gap-2 shadow-violet-600/30">
            <UploadCloud className="h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Filter / Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search keywords in job description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <span className="text-xs text-slate-500">{total} Total Evaluations</span>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-5 rounded-xl border border-slate-800 bg-slate-900/40"
            >
              <div className="space-y-2 flex-1 mr-4">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-400 mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-white">No analysis history found</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
            Your evaluated resumes and match scores will appear here. Start by uploading your first resume.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/upload">
              <Button variant="gradient" size="sm" className="gap-2">
                <UploadCloud className="h-4 w-4" />
                Scan Resume Now
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
            {filteredAnalyses.map((item) => {
              const snippet = item.job_description.slice(0, 160) + "...";
              const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-slate-900/70 transition-colors gap-4"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <p className="text-sm font-medium text-slate-200 line-clamp-2">{snippet}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formattedDate}
                      </span>
                      <span className="capitalize text-slate-400 font-mono text-[11px]">ID: {item.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    {getScoreBadge(item.match_score)}

                    <Link href={`/dashboard/result/${item.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        View Report
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="gap-1 text-xs"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
