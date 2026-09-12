"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Printer,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScoreRing from "@/components/charts/ScoreRing";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AnalysisResult {
  id: string;
  user_id: string;
  resume_id: string;
  job_description: string;
  match_score: number | null;
  missing_keywords: string[] | null;
  suggestions: string | null;
  status: string;
  engine_used?: string | null;
  created_at: string;
}

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/analysis/${id}`);
      if (res.data?.success && res.data?.data) {
        const data: AnalysisResult = res.data.data;
        setAnalysis(data);

        if (data.status === "pending" || data.status === "processing") {
          setTimeout(fetchAnalysis, 2000);
        } else {
          setLoading(false);
        }
      } else {
        throw new Error(res.data?.error || "Analysis not found.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load analysis result.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const copyFeedback = () => {
    if (!analysis) return;
    const content = `ATS Match Score: ${analysis.match_score}%\n\nMissing Keywords:\n${analysis.missing_keywords?.join(
      ", "
    )}\n\nSuggestions:\n${analysis.suggestions}`;
    navigator.clipboard.writeText(content);
    toast.success("Analysis report copied to clipboard!");
  };

  if (loading || (analysis && (analysis.status === "pending" || analysis.status === "processing"))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative flex items-center justify-center mb-6">
          <div className="h-20 w-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <Sparkles className="h-8 w-8 text-violet-400 absolute" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Resume Fit...</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Comparing skills, qualifications, and industry keywords against the job description using AI. This usually takes 3 to 10 seconds.
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="h-12 w-12 rounded-full bg-red-950/50 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Failed to Load Report</h2>
        <p className="text-sm text-slate-400 mb-6">{error || "The requested analysis could not be found."}</p>
        <Link href="/dashboard/upload">
          <Button variant="gradient" size="sm">
            Run New Analysis
          </Button>
        </Link>
      </div>
    );
  }

  const score = analysis.match_score ?? 0;
  const missingKeywords = analysis.missing_keywords || [];
  const suggestions = analysis.suggestions || "No suggestions provided.";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={copyFeedback} className="gap-2 text-xs">
            <Copy className="h-3.5 w-3.5" />
            Copy Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 text-xs hidden sm:flex"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Link href="/dashboard/upload">
            <Button variant="gradient" size="sm" className="gap-2 text-xs shadow-violet-600/30">
              <RefreshCw className="h-3.5 w-3.5" />
              Re-analyze New JD
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-violet-950/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center md:border-r border-slate-800/80 md:pr-8">
            <ScoreRing score={score} size={190} strokeWidth={15} />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="text-xs capitalize">
                Status: {analysis.status}
              </Badge>
              {analysis.engine_used && analysis.engine_used !== "ai" ? (
                <Badge variant="outline" className="text-xs border-amber-500/40 bg-amber-500/10 text-amber-300">
                  Fallback Engine ({analysis.engine_used === "fallback_after_error" ? "AI error fallback" : "no API key"})
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                  AI Powered
                </Badge>
              )}
              <span className="text-xs text-slate-500">
                Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
              </span>
            </div>

            {analysis.engine_used && analysis.engine_used !== "ai" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  Analysis generated using keyword-matching fallback (AI provider unavailable).
                </span>
              </div>
            )}

            <h2 className="text-2xl font-bold text-white">
              {score >= 80
                ? "Excellent Match! Your resume closely aligns with this role."
                : score >= 60
                ? "Good Match with High-Impact Optimization Potential."
                : "Significant Skill Gaps Detected Against This Target Role."}
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed">
              Based on ATS keyword matching and requirements parsing, your resume exhibits a{" "}
              <strong className="text-white">{score}% match</strong> against the core skills requested in the job
              description.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Missing Critical Keywords ({missingKeywords.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              These target skills and terms were requested in the job description but not detected in your resume.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {missingKeywords.length === 0 ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>Great job! No major critical skill omissions detected.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 italic">
                  💡 Tip: Incorporate these terms naturally into your bullet points, summary, or skills list to bypass ATS filtering.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              Actionable AI Improvement Advice
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Specific, recruiter-backed recommendations to maximize your interview conversion rate.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed whitespace-pre-line font-sans">
              {suggestions}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            Evaluated Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-slate-950/50 p-4 text-xs text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
            {analysis.job_description}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
