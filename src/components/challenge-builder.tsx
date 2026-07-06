// src/components/challenge-builder.tsx
"use client";

import { useState } from "react";
import { styles } from "@/lib/styles";

interface Option {
  text: string;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
  correctIndex: number;
}

interface ChallengeBuilderProps {
  lessonId: string;
  initialData?: { questions: Question[] } | null;
}

export default function ChallengeBuilder({ lessonId, initialData }: ChallengeBuilderProps) {
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (!initialData?.questions) return [];
    return initialData.questions.map((q: any) => ({
        id: q.id ?? crypto.randomUUID(),
        question: q.question ?? "",
        options: (q.options ?? []).map((o: any) => ({
        text: typeof o === "string" ? o : o.text ?? "",
        })),
        correctIndex: q.correctIndex ?? 0,
    }));
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addQuestion() {
    if (questions.length >= 10) return;
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        question: "",
        options: [{ text: "" }, { text: "" }],
        correctIndex: 0,
      },
    ]);
  }

  function removeQuestion(qIndex: number) {
    setQuestions(questions.filter((_, i) => i !== qIndex));
  }

  function updateQuestion(qIndex: number, value: string) {
    setQuestions(questions.map((q, i) => i === qIndex ? { ...q, question: value } : q));
  }

  function addOption(qIndex: number) {
    if (questions[qIndex].options.length >= 4) return;
    setQuestions(questions.map((q, i) =>
      i === qIndex ? { ...q, options: [...q.options, { text: "" }] } : q
    ));
  }

  function removeOption(qIndex: number, oIndex: number) {
    if (questions[qIndex].options.length <= 2) return;
    setQuestions(questions.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = q.options.filter((_, oi) => oi !== oIndex);
      const newCorrect = q.correctIndex >= newOptions.length ? 0 : q.correctIndex;
      return { ...q, options: newOptions, correctIndex: newCorrect };
    }));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions(questions.map((q, i) =>
      i === qIndex
        ? { ...q, options: q.options.map((o, oi) => oi === oIndex ? { text: value } : o) }
        : q
    ));
  }

  function setCorrect(qIndex: number, oIndex: number) {
    setQuestions(questions.map((q, i) =>
      i === qIndex ? { ...q, correctIndex: oIndex } : q
    ));
  }

  async function handleSave() {
    // Validate
    if (questions.length < 3) {
      setError("Minimum 3 questions required.");
      return;
    }
    for (const q of questions) {
      if (!q.question.trim()) {
        setError("All questions must have text.");
        return;
      }
      for (const o of q.options) {
        if (!o.text.trim()) {
          setError("All options must have text.");
          return;
        }
      }
    }

    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save challenge data.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">
            {questions.length} / 10 questions
            {questions.length < 3 && (
              <span className="ml-2 text-amber-600">(minimum 3)</span>
            )}
          </p>
        </div>
        <button
          onClick={addQuestion}
          disabled={questions.length >= 10}
          className={`${styles.ctaPrimary} disabled:opacity-50`}
        >
          + Add question
        </button>
      </div>

      {questions.length === 0 && (
        <div className={styles.emptyState}>
          No questions yet — click "Add question" to start.
        </div>
      )}

      {questions.map((q, qIndex) => (
        <div key={q.id} className={styles.challengeQuestion}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Question {qIndex + 1}
            </p>
            <button
              onClick={() => removeQuestion(qIndex)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <input
            value={q.question}
            onChange={(e) => updateQuestion(qIndex, e.target.value)}
            className={styles.formInput}
            placeholder="e.g. What is the primary function of money?"
          />

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">
              Options — click the circle to mark correct answer
            </p>
            {q.options.map((option, oIndex) => (
              <div key={oIndex} className={styles.challengeOptionRow}>
                <button
                  type="button"
                  onClick={() => setCorrect(qIndex, oIndex)}
                  className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
                    q.correctIndex === oIndex
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-300 bg-white"
                  }`}
                />
                <input
                  value={option.text}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  className={`${styles.formInput} flex-1`}
                  placeholder={`Option ${oIndex + 1}`}
                />
                {q.options.length > 2 && (
                  <button
                    onClick={() => removeOption(qIndex, oIndex)}
                    className="text-xs text-slate-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {q.options.length < 4 && (
              <button
                onClick={() => addOption(qIndex)}
                className="text-xs text-emerald-600 hover:text-emerald-800"
              >
                + Add option
              </button>
            )}
          </div>
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || questions.length < 3}
        className={`${styles.enrollBtn} disabled:opacity-50`}
      >
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save challenge"}
      </button>
    </div>
  );
}