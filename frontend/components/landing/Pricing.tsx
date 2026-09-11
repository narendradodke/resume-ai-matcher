"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FadeInSection from "@/components/animations/FadeInSection";

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden border-t border-slate-900 bg-slate-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Invest in Your Next Career Move
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Start for free, test your resume against any job description, and upgrade when you are ready to accelerate your interview pipeline.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <FadeInSection delay={0.1}>
            <div className="relative flex flex-col justify-between h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl hover:border-slate-700 transition-colors">
              <div>
                <h3 className="text-xl font-bold text-white">Free Starter</h3>
                <p className="mt-2 text-sm text-slate-400">Perfect for exploring and tuning your primary resume.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-sm font-medium text-slate-400">/ month</span>
                </div>

                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>3 Free AI Analyses per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Instant PDF text extraction</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>ATS Match percentage score</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Top missing keywords detection</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-500">
                    <span className="h-4 w-4 text-slate-600 shrink-0">✕</span>
                    <span>Historical revision comparisons</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link href="/signup" className="w-full block">
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </FadeInSection>

          {/* Pro Tier */}
          <FadeInSection delay={0.2}>
            <div className="relative flex flex-col justify-between h-full rounded-2xl border-2 border-violet-500 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-violet-950/20 p-8 backdrop-blur-xl shadow-2xl shadow-violet-600/20">
              <div className="absolute -top-3 right-8">
                <Badge variant="default" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
                  <Sparkles className="h-3 w-3 mr-1" /> Most Popular
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Pro Job Seeker</h3>
                <p className="mt-2 text-sm text-slate-300">For ambitious candidates applying to competitive roles.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$19</span>
                  <span className="text-sm font-medium text-slate-400">/ month</span>
                </div>

                <ul className="mt-8 space-y-4 text-sm text-slate-200">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span className="font-medium text-white">Unlimited AI analyses & scans</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>Line-by-line ATS bullet point optimization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>Priority background Celery processing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>Full history & revision re-screening</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>PDF Analysis Export (Phase 2 ready)</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link href="/signup" className="w-full block">
                  <Button variant="gradient" className="w-full shadow-violet-600/30">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
