// src/components/add-lesson-form.tsx
"use client";
import { useState } from "react";
import { styles } from "@/lib/styles";

export default function AddLessonForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [type, setType] = useState("ARTICLE");

  return (
    <form action={action} className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={styles.formLabel}>Title</label>
          <input name="title" required className={styles.formInput} placeholder="e.g. What is Money?" />
        </div>
        <div>
          <label className={styles.formLabel}>Type</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.formSelect}
          >
            <option value="ARTICLE">Article</option>
            <option value="CHALLENGE">Challenge</option>
            <option value="VIDEO">Video</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={styles.formLabel}>Estimated minutes</label>
          <input name="estimatedMinutes" type="number" defaultValue={5} className={styles.formInput} />
        </div>
        <div>
          <label className={styles.formLabel}>Points awarded</label>
          <input name="pointsAwarded" type="number" defaultValue={10} className={styles.formInput} />
        </div>
      </div>
      <div>
        <label className={styles.formLabel}>Summary</label>
        <input name="summary" className={styles.formInput} placeholder="Short summary of this lesson" />
      </div>

      {type !== "CHALLENGE" && (
        <div>
          <label className={styles.formLabel}>Content</label>
          <textarea
            name="content"
            rows={6}
            className={styles.formTextarea}
            placeholder="Write the lesson content here."
          />
        </div>
      )}

      {type === "CHALLENGE" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⚡ Challenge lesson — save first, then use the Challenge Builder to add questions.
        </div>
      )}

      <button type="submit" className={styles.enrollBtn}>Add lesson</button>
    </form>
  );
}