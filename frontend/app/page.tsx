import React from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
        AI Resume Matcher
      </h1>
      <p className="text-slate-400 mb-6">Bootstrap Next.js + Tailwind + shadcn</p>
      <Button variant="gradient">Get Started</Button>
    </main>
  );
}
