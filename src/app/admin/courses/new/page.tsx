// src/app/admin/courses/new/page.tsx
import { styles } from "@/lib/styles";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function createCourse(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const difficulty = formData.get("difficulty") as string;
  const published = formData.get("published") === "on";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const course = await prisma.course.create({
    data: { title, description, difficulty, published, slug, order: 0 },
  });

  redirect(`/admin/courses/${course.slug}`);
}

export default function NewCoursePage() {
  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8">
        <h1 className={styles.pageTitle}>New course</h1>
        <p className={styles.pageSubtitle}>Fill in the details to create a new course.</p>
      </div>

      <div className={`max-w-2xl ${styles.card}`}>
        <form action={createCourse} className="space-y-5">
          <div>
            <label className={styles.formLabel}>Title</label>
            <input name="title" required className={styles.formInput} placeholder="e.g. Foundations of Financial Literacy" />
          </div>
          <div>
            <label className={styles.formLabel}>Description</label>
            <textarea name="description" required rows={3} className={styles.formTextarea} placeholder="What will learners gain from this course?" />
          </div>
          <div>
            <label className={styles.formLabel}>Difficulty</label>
            <select name="difficulty" className={styles.formSelect}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="published" id="published" className="rounded" />
            <label htmlFor="published" className="text-sm text-slate-700">Publish immediately</label>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className={styles.enrollBtn}>
              Create course
            </button>
            <a href="/admin/courses" className={styles.ctaGhost}>Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
}