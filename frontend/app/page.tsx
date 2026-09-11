import React from "react";
import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FadeInSection from "@/components/animations/FadeInSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Github } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />

        {/* Bottom CTA Banner */}
        <section className="py-20 relative overflow-hidden border-t border-slate-900">
          <div className="container mx-auto max-w-5xl px-4 text-center">
            <FadeInSection>
              <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/50 via-slate-900/80 to-indigo-950/50 p-12 backdrop-blur-2xl shadow-2xl shadow-violet-950/30">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/20 px-3 py-1 text-xs text-violet-300 mb-6">
                  <Sparkles className="h-3.5 w-3.5" /> Start Analyzing in 30 Seconds
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto">
                  Ready to optimize your resume for your dream company?
                </h2>
                <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                  Join thousands of software engineers, analysts, and students getting more interview invites every week.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link href="/signup">
                    <Button size="lg" variant="gradient" className="gap-2 px-8 h-12 shadow-xl shadow-violet-600/30">
                      Get Started Free Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-12 text-sm text-slate-500">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white font-bold text-xs">
              AI
            </div>
            <span className="font-semibold text-slate-300">Resume AI Matcher</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-xs">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Create Account
            </Link>
            <a
              href="https://github.com/narendradodke/resume-ai-matcher"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
