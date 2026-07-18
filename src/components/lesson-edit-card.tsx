// src/components/lesson-edit-card.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { styles } from "@/lib/styles";
import ChallengeBuilder from "@/components/challenge-builder";

export default function LessonEditCard({
  lessonId,
  lessonType,
  lessonTitle,
  lessonContent,
  lessonSummary,
  lessonEstimatedMinutes,
  lessonPointsAwarded,
  challengeData,
  updateAction,
  deleteAction,
}: {
  lessonId: string;
  lessonType: string;
  lessonTitle: string;
  lessonContent?: string | null;
  lessonSummary?: string | null;
  lessonEstimatedMinutes?: number | null;
  lessonPointsAwarded: number;
  challengeData?: { questions: { id: string; question: string; options: { text: string }[]; correctIndex: number }[] } | null;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDetailsElement>(null);
  const shouldExpand = searchParams.get("expanded") === lessonId;
  const [currentType, setCurrentType] = useState(lessonType);
  const isChallenge = currentType === "CHALLENGE";

  useEffect(() => {
    if (shouldExpand && ref.current) {
      ref.current.open = true;
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [shouldExpand]);

  return (
    <details
      ref={ref}
      className={`rounded-2xl border p-4 transition-colors ${
        isChallenge ? "border-amber-200 bg-amber-50/50" : "border-slate-200"
      }`}
    >
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-2">
          <span className={`${styles.badgeBase} ${isChallenge ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
            {isChallenge ? "⚡ Challenge" : "ARTICLE"}
          </span>
          <p className="font-medium text-slate-900">{lessonTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={styles.label}>{lessonPointsAwarded} pts</span>
          <form action={deleteAction}>
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </form>
        </div>
      </summary>

      <form action={updateAction} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={styles.formLabel}>Title</label>
            <input name="title" defaultValue={lessonTitle} required className={styles.formInput} />
          </div>
          <div>
            <label className={styles.formLabel}>Estimated minutes</label>
            <input name="estimatedMinutes" type="number" defaultValue={lessonEstimatedMinutes ?? 5} className={styles.formInput} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={styles.formLabel}>Points awarded</label>
            <input name="pointsAwarded" type="number" defaultValue={lessonPointsAwarded} className={styles.formInput} />
          </div>
          <div>
            <label className={styles.formLabel}>Summary</label>
            <input name="summary" defaultValue={lessonSummary ?? ""} className={styles.formInput} />
          </div>
        </div>

        <div>
          <label className={styles.formLabel}>Type</label>
          <select
            name="type"
            value={currentType}
            onChange={(e) => setCurrentType(e.target.value)}
            className={styles.formSelect}
          >
            <option value="ARTICLE">Article</option>
            <option value="CHALLENGE">Challenge</option>
          </select>
        </div>

        {!isChallenge && (
          <div>
            <label className={styles.formLabel}>Content</label>
            <textarea
              name="content"
              defaultValue={lessonContent ?? ""}
              rows={6}
              className={styles.formTextarea}
            />
          </div>
        )}

        <button type="submit" className={styles.ctaPrimary}>Save lesson</button>
      </form>

      {isChallenge && (
        <div className="mt-4 border-t border-amber-100 pt-4">
          <p className={`${styles.formLabel} mb-3`}>Challenge questions</p>
          <ChallengeBuilder
            lessonId={lessonId}
            initialData={challengeData ?? null}
          />
        </div>
      )}
    </details>
  );
}