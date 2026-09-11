"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ResumeDropzone from "@/components/upload/ResumeDropzone";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ExistingResume {
  id: string;
  file_url: string;
  uploaded_at: string;
}

export default function UploadAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingResumes, setExistingResumes] = useState<ExistingResume[]>([]);
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Fetch user resumes if any exist
    api
      .get("/resume/list")
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setExistingResumes(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedExistingId(res.data.data[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !selectedExistingId) {
      toast.error("Please upload a resume or select an existing one.");
      return;
    }

    if (jobDescription.trim().length < 20) {
      toast.error("Please provide a detailed job description (minimum 20 characters).");
      return;
    }

    setLoading(true);
    try {
      let targetResumeId = selectedExistingId;

      // 1. If user uploaded a new file, upload and parse it first
      if (selectedFile) {
        setStatusText("Uploading and parsing PDF resume...");
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await api.post("/resume/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (!uploadRes.data?.success) {
          throw new Error(uploadRes.data?.error || "Failed to upload resume.");
        }
        targetResumeId = uploadRes.data.data.id;
      }

      // 2. Trigger AI analysis
      setStatusText("Starting AI evaluation against job description...");
      const analysisRes = await api.post("/analysis/run", {
        resume_id: targetResumeId,
        job_description: jobDescription.trim(),
      });

      if (!analysisRes.data?.success) {
        throw new Error(analysisRes.data?.error || "Failed to initiate analysis.");
      }

      const analysisId = analysisRes.data.data.id;
      toast.success("Analysis initiated! Redirecting to report...");
      router.push(`/dashboard/result/${analysisId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Analysis failed. Please try again.";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Sparkles className="h-6 w-6 text-violet-400" />
          New AI Resume Match
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload your resume and paste the job description to run an automated ATS match score evaluation.
        </p>
      </div>

      <form onSubmit={handleStartAnalysis} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Step 1: Resume Selection */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-300">
                1
              </span>
              <CardTitle className="text-lg font-bold text-white">Your Resume (PDF)</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Provide your latest resume in PDF format.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <ResumeDropzone
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (file) setSelectedExistingId(null);
              }}
              disabled={loading}
            />

            {/* Option to choose existing resume if previously uploaded */}
            {existingResumes.length > 0 && !selectedFile && (
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-xs font-semibold text-slate-400 mb-2">Or select from previous resumes:</p>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {existingResumes.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setSelectedExistingId(r.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-colors ${
                        selectedExistingId === r.id
                          ? "border-violet-500 bg-violet-950/30 text-white"
                          : "border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-violet-400 shrink-0" />
                        <span className="truncate">Saved Resume ({r.id.slice(0, 8)})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(r.uploaded_at).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Job Description */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-300">
                2
              </span>
              <CardTitle className="text-lg font-bold text-white">Target Job Description</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Paste the full job posting requirements, roles, and responsibilities.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the job requirements, responsibilities, and required qualifications here..."
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={loading}
              className="font-sans text-xs sm:text-sm min-h-[220px]"
            />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{jobDescription.length} characters</span>
              <span>Min. 20 characters</span>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-12 text-sm font-semibold shadow-xl shadow-violet-600/30 gap-2"
              disabled={loading || (!selectedFile && !selectedExistingId) || jobDescription.trim().length < 20}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{statusText || "Analyzing..."}</span>
                </>
              ) : (
                <>
                  Run AI Match Analysis
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
