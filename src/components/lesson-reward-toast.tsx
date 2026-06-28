"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LessonRewardToast({
  pointsEarned,
  badgesUnlocked,
  streakCount,
  newLevel,
  pathname,
}: {
  pointsEarned: number | null;
  badgesUnlocked: string[];
  streakCount: number | null;
  newLevel: number | null;
  pathname: string;
}) {
  const router = useRouter();

  // captured once on first mount — never updates again, even if the
  // props later change (e.g. after router.replace strips the URL params)
  const [reward] = useState(() => ({
    pointsEarned,
    badgesUnlocked,
    streakCount,
    newLevel,
  }));
  const [visible, setVisible] = useState(false);

  const hasReward = reward.pointsEarned !== null && reward.pointsEarned > 0;

  useEffect(() => {
    if (!hasReward) return;

    setVisible(true);
    router.replace(pathname, { scroll: false });

    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasReward) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎉</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">+{reward.pointsEarned} points earned!</p>

          {reward.badgesUnlocked.length > 0 && (
            <p className="mt-1 text-xs text-emerald-700">
              Badge unlocked: {reward.badgesUnlocked.join(", ")}
            </p>
          )}

          {reward.streakCount !== null && reward.streakCount > 1 && (
            <p className="mt-1 text-xs text-slate-500">🔥 {reward.streakCount}-day streak</p>
          )}

          {reward.newLevel !== null && (
            <p className="mt-1 text-xs font-medium text-violet-700">
              Level up! You're now Level {reward.newLevel}
            </p>
          )}
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-auto text-slate-400 hover:text-slate-600"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}