"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1 text-xs font-medium text-violet-300 backdrop-blur-md mb-8 shadow-inner shadow-violet-500/10"
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
          <span>Next-Gen AI Resume & Job Description Matcher</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]"
        >
          Land More Interviews with{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Instant ATS Scoring
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Upload your resume, paste target job descriptions, and let AI reveal your exact match score, missing technical keywords, and actionable line-by-line recommendations.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/signup">
            <Button size="lg" variant="gradient" className="gap-2 text-base px-8 h-13 shadow-xl shadow-violet-600/30 group">
              Scan Your Resume Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline" className="gap-2 text-base border-slate-700 hover:bg-slate-900/80">
              <Zap className="h-4 w-4 text-violet-400" />
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 100% Free Trial
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Instant PDF Parsing
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Recruiter-Grade Feedback
          </span>
        </motion.div>

        {/* Mockup Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 mx-auto max-w-4xl"
        >
          <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-violet-950/20 text-left">
            {/* Top window bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs text-slate-400 font-mono">analysis_report_v1.json</span>
              </div>
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Analysis Complete
              </Badge>
            </div>

            {/* Inner Dashboard Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Score circle */}
              <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-4 border-violet-500 shadow-lg shadow-violet-500/20">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-white">88%</span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Match</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400 font-medium">Strong Fit for Senior Backend</p>
              </div>

              {/* Skills matched & missing */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Matched Core Skills (5)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "FastAPI", "PostgreSQL", "REST API", "Git"].map((skill) => (
                      <span key={skill} className="rounded-md bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-300 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                    Missing High-Priority Keywords (3)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["Kubernetes", "Redis", "Celery"].map((skill) => (
                      <span key={skill} className="rounded-md bg-amber-950/50 border border-amber-500/30 px-2.5 py-1 text-xs text-amber-300 font-medium">
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-violet-950/30 border border-violet-500/20 text-xs text-slate-300">
                  <span className="font-semibold text-violet-300">AI Recommendation:</span> Add experience with asynchronous task processing using Celery & Redis to bridge the top gap.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
