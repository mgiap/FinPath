"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { styles } from "@/lib/styles";
import type { ChallengeData } from "@/lib/challenge";

type QuestionResult = { isCorrect: boolean; selected: number | null };

type SubmitResult = {
  correctCount: number;
  total: number;
  scorePercent: number;
  cleared: boolean;
  results: QuestionResult[];
  reward: {
    isFirstCompletion: boolean;
    pointsEarned: number;
    badgesUnlocked: string[];
    newStreakCount: number | null;
    leveledUp: boolean;
    newLevel: number | null;
  };
};

// safely extract option text whether it's a string or { text: string }
function getOptionText(opt: unknown): string {
  if (typeof opt === "string") return opt;
  if (opt && typeof opt === "object" && "text" in opt) return (opt as { text: string }).text;
  return "";
}

export default function ChallengeRunner({
  lessonId,
  challengeData,
  courseSlug,
  lessonSlug,
  previousScore,
}: {
  lessonId: string;
  challengeData: ChallengeData;
  courseSlug: string;
  lessonSlug: string;
  previousScore: number | null;
}) {
  const router = useRouter();

  const [activeIndices, setActiveIndices] = useState<number[]>(
    challengeData.questions.map((_, i) => i)
  );
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [retryMode, setRetryMode] = useState(false);

  const allActiveAnswered = activeIndices.every((i) => selected[i] !== undefined);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const answers = challengeData.questions.map((_, i) =>
        activeIndices.includes(i) ? (selected[i] ?? -1) : challengeData.questions[i].correctIndex
      );

      const res = await fetch(`/api/lessons/${lessonId}/challenge-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data: SubmitResult = await res.json();
      setResult(data);
      setRetryMode(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    if (!result) return;
    const wrongIndices = result.results
      .map((r, i) => (!r.isCorrect ? i : -1))
      .filter((i) => i !== -1);
    setActiveIndices(wrongIndices);
    setSelected({});
    setResult(null);
    setRetryMode(true);
  }

  function handleContinue() {
    if (!result) return;
    const url = new URL(`/courses/${courseSlug}`, window.location.origin);
    if (result.reward.pointsEarned > 0) {
      url.searchParams.set("earned", String(result.reward.pointsEarned));
      if (result.reward.badgesUnlocked.length > 0)
        url.searchParams.set("badges", result.reward.badgesUnlocked.join(","));
      if (result.reward.newStreakCount !== null)
        url.searchParams.set("streak", String(result.reward.newStreakCount));
      if (result.reward.leveledUp && result.reward.newLevel !== null)
        url.searchParams.set("level", String(result.reward.newLevel));
    }
    router.push(url.pathname + url.search);
    router.refresh();
  }

  // ── Results screen ───────────────────────────────────────────────
  if (result) {
    const hasWrong = result.results.some((r) => !r.isCorrect);
    return (
      <div className={styles.card}>
        <div className={`rounded-2xl p-4 text-center mb-4 ${result.cleared ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
          <p className={`text-2xl font-bold ${result.cleared ? "text-emerald-700" : "text-amber-700"}`}>
            {result.cleared ? "Challenge cleared! 🎉" : "Keep going 💪"}
          </p>
          <p className={`mt-1 text-sm ${result.cleared ? "text-emerald-600" : "text-amber-600"}`}>
            {result.correctCount} / {result.total} correct — {result.scorePercent}%
          </p>
          {result.reward.isFirstCompletion && result.reward.pointsEarned > 0 && (
            <p className="mt-1 text-xs text-slate-500">+{result.reward.pointsEarned} points earned</p>
          )}
          {!result.reward.isFirstCompletion && (
            <p className="mt-1 text-xs text-slate-400">Retry — no extra points awarded</p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {challengeData.questions.map((q, i) => {
            const r = result.results[i];
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                  r.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                }`}
              >
                <span className={`text-lg ${r.isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                  {r.isCorrect ? "✓" : "✗"}
                </span>
                <p className="text-sm text-slate-700">{q.question}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          {hasWrong && (
            <button onClick={handleRetry} className={styles.ctaGhost}>
              Retry wrong questions
            </button>
          )}
          <button onClick={handleContinue} className={styles.completeBannerBtn}>
            Back to course →
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ──────────────────────────────────────────────
  return (
    <div className={styles.card}>
      {previousScore !== null && !retryMode && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Your previous score: {previousScore}% — retry to improve
        </div>
      )}

      {retryMode && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Retrying {activeIndices.length} wrong question{activeIndices.length !== 1 ? "s" : ""} — no extra points
        </div>
      )}

      <div className="space-y-5">
        {challengeData.questions.map((q, qi) => {
          const isActive = activeIndices.includes(qi);
          const isCorrectLocked = !isActive && retryMode;

          return (
            <div key={qi} className={isCorrectLocked ? "opacity-50" : ""}>
              <p className="text-sm font-medium text-slate-900">
                {qi + 1}. {q.question}
                {isCorrectLocked && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">✓ correct</span>
                )}
              </p>
              <div className="mt-2 space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-slate-900 transition cursor-pointer ${
                      isCorrectLocked
                        ? "border-emerald-200 bg-emerald-50 cursor-not-allowed"
                        : selected[qi] === oi
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      disabled={isCorrectLocked}
                      checked={isCorrectLocked ? oi === q.correctIndex : selected[qi] === oi}
                      onChange={() => {
                        if (!isCorrectLocked) {
                          setSelected((prev) => ({ ...prev, [qi]: oi }));
                        }
                      }}
                    />
                    {getOptionText(opt)}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allActiveAnswered || submitting}
        className={`mt-5 ${styles.completeBannerBtn} disabled:opacity-50`}
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </div>
  );
}