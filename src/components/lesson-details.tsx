// src/components/lesson-details.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { styles } from "@/lib/styles";
import ChallengeBuilder from "@/components/challenge-builder";

export default function LessonDetails({
  lessonId,
  lessonType,
  lessonContent,
  challengeData,
  children,
  className,
}: {
  lessonId: string;
  lessonType: string;
  lessonContent?: string | null;
  challengeData?: { questions: { id: string; question: string; options: { text: string }[]; correctIndex: number }[] } | null;
  children: React.ReactNode;
  className?: string;
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
      className={`rounded-2xl border p-4 ${isChallenge ? "border-amber-200 bg-amber-50/50" : "border-slate-200"}`}
    >
      {children}

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-2 gap-3">
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
              <option value="VIDEO">Video</option>
            </select>
          </div>
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

        {isChallenge && (
          <div className="mt-2">
            <p className={`${styles.formLabel} mb-3`}>Challenge questions</p>
            <ChallengeBuilder
              lessonId={lessonId}
              initialData={challengeData ?? null}
            />
          </div>
        )}
      </div>
    </details>
  );
}