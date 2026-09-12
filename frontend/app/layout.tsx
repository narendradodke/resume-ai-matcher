import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AI Resume Matcher — ATS Scoring & Smart Resume Optimization",
  description:
    "Upload your resume, paste any target job description, and get instant AI-powered match scores, missing keywords, and recruiter-grade feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen antialiased bg-slate-950 text-slate-100 flex flex-col font-sans">
        {children}
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
