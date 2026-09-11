"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export default function ResumeDropzone({
  selectedFile,
  onFileSelect,
  disabled = false,
}: ResumeDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileInput}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-violet-500 bg-violet-950/20 scale-[1.01]"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-400 mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-7 w-7" />
          </div>
          <h4 className="text-base font-semibold text-white">
            {isDragging ? "Drop your PDF resume here" : "Upload your resume"}
          </h4>
          <p className="mt-1.5 text-xs text-slate-400 max-w-xs">
            Drag and drop your PDF resume here, or click to browse from your device (Max 10MB).
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5 text-xs border-slate-700 pointer-events-none"
          >
            Select PDF File
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-violet-500/30 bg-violet-950/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate max-w-[200px] sm:max-w-xs">
              <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
