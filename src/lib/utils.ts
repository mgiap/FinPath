// src/lib/utils.ts
export function progressColor(pct: number): string {
  if (pct === 100) return "#34d399"; // green
  if (pct === 0) return "#e2e8f0";   // gray
  return "#fbbf24";                   // amber
}