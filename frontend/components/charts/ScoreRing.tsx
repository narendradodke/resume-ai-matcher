"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({
  score,
  size = 180,
  strokeWidth = 14,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Color selection based on score threshold
  const getScoreColor = (val: number) => {
    if (val >= 80) {
      return {
        stroke: "#10b981", // emerald-500
        text: "text-emerald-400",
        label: "Excellent Fit",
        badge: "bg-emerald-950/40 text-emerald-300 border-emerald-500/30",
      };
    }
    if (val >= 60) {
      return {
        stroke: "#8b5cf6", // violet-500
        text: "text-violet-400",
        label: "Moderate Fit",
        badge: "bg-violet-950/40 text-violet-300 border-violet-500/30",
      };
    }
    return {
      stroke: "#f59e0b", // amber-500
      text: "text-amber-400",
      label: "Needs Improvement",
      badge: "bg-amber-950/40 text-amber-300 border-amber-500/30",
    };
  };

  const colorMeta = getScoreColor(score);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplayScore(Math.round(latest)),
    });
    return () => controls.stop();
  }, [score]);

  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorMeta.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            strokeLinecap="round"
          />
        </svg>

        {/* Centered counter text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${colorMeta.text}`}>
            {displayScore}%
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            ATS Match
          </span>
        </div>
      </div>

      <div className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${colorMeta.badge}`}>
        {colorMeta.label}
      </div>
    </div>
  );
}
