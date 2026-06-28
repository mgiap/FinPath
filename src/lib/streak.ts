export function getEffectiveStreak(
  currentCount: number,
  lastActivityAt: Date | null | undefined
): number {
  if (!lastActivityAt) return 0;

  const now = new Date();
  const last = new Date(lastActivityAt);
  const oneDayMs = 24 * 60 * 60 * 1000;

  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const daysSince = Math.round((startOfNow.getTime() - startOfLast.getTime()) / oneDayMs);

  // 0 = active today, 1 = active yesterday (streak still alive), 2+ = broken
  return daysSince >= 2 ? 0 : currentCount;
}