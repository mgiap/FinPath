// src/components/donut-chart.tsx
"use client";

import { useEffect, useRef } from "react";

interface DonutChartProps {
  pct: number;
  stroke: string;
  size?: number;
}

export default function DonutChart({ pct, stroke, size = 120 }: DonutChartProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const gap = circ - filled;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.strokeDasharray = `0 ${circ}`;
    requestAnimationFrame(() => {
      circle.style.transition = "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)";
      circle.style.strokeDasharray = `${filled} ${gap}`;
    });
  }, [filled, gap, circ]);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle
        ref={circleRef}
        cx="50" cy="50" r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        strokeDasharray={`0 ${circ}`}
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="700" fill="#0f172a">
        {pct}%
      </text>
    </svg>
  );
}