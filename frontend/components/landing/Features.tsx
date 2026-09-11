"use client";

import React from "react";
import {
  FileSearch,
  Cpu,
  Target,
  History,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import FadeInSection from "@/components/animations/FadeInSection";

const features = [
  {
    icon: FileSearch,
    title: "Instant PDF Extraction",
    description:
      "Our multi-engine PDF parser extracts structured text from multi-column layouts, complex tables, and diverse resume styles without losing context.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Cpu,
    title: "Deep ATS Semantic Match",
    description:
      "Compare your qualifications against modern Applicant Tracking System algorithms. Understand your exact percentage score in seconds.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: Target,
    title: "Missing Skill Detection",
    description:
      "Discover crucial technical tools, certifications, and domain keywords present in the JD that are currently absent from your CV.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: TrendingUp,
    title: "Actionable AI Feedback",
    description:
      "Get tailored, bullet-by-bullet advice on how to rewrite experience statements to highlight high-impact metrics and quantified outcomes.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: History,
    title: "Full Analysis History",
    description:
      "Store and compare past analyses across different job applications. Monitor how your match score improves as you tailor your resume.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Security First",
    description:
      "Your resumes and personal data are strictly isolated, encrypted, and never used to train public models. You retain complete ownership.",
    color: "from-rose-500 to-red-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden border-t border-slate-900 bg-slate-950/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeInSection className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
            Why Job Seekers Choose Us
          </h2>
          <p className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Engineered to Beat Modern Screening Systems
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Over 75% of resumes are rejected by automated ATS filters before a human recruiter ever sees them. We give you the edge to pass every filter.
          </p>
        </FadeInSection>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <FadeInSection key={feature.title} delay={idx * 0.1}>
                <div className="group relative h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-violet-950/20">
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
