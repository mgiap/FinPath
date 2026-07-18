// src/app/admin/courses/[slug]/modules/[moduleId]/page.tsx
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LessonType } from "@prisma/client";
import AddLessonForm from "@/components/add-lesson-form";
import LessonDetails from "@/components/lesson-details";

async function createLesson(moduleId: string, courseSlug: string, formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const type = formData.get("type") as LessonType;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const estimatedMinutes = Number(formData.get("estimatedMinutes"));
  const pointsAwarded = Number(formData.get("pointsAwarded"));
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const count = await prisma.lesson.count({ where: { moduleId } });

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      slug,
      summary,
      content,
      type,
      estimatedMinutes,
      pointsAwarded,
      order: count + 1,
    },
  });

  redirect(`/admin/courses/${courseSlug}/modules/${moduleId}?expanded=${lesson.id}`);
}

async function deleteLesson(lessonId: string, courseSlug: string, moduleId: string) {
  "use server";
  await prisma.lesson.delete({ where: { id: lessonId } });
  redirect(`/admin/courses/${courseSlug}/modules/${moduleId}`);
}

async function updateLesson(lessonId: string, courseSlug: string, moduleId: string, formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const type = formData.get("type") as LessonType;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const estimatedMinutes = Number(formData.get("estimatedMinutes"));
  const pointsAwarded = Number(formData.get("pointsAwarded"));

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { title, type, summary, content, estimatedMinutes, pointsAwarded },
  });

  redirect(`/admin/courses/${courseSlug}/modules/${moduleId}?expanded=${lessonId}`);
}

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ slug: string; moduleId: string }>;
}) {
  const { slug, moduleId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      lessons: { orderBy: { order: "asc" } },
      course: true,
    },
  });

  if (!module) notFound();

  const createLessonWithIds = createLesson.bind(null, moduleId, slug);

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-6">
        <Link href={`/admin/courses/${slug}`} className={`${styles.label} hover:text-slate-700`}>
          ← Back to {module.course.title}
        </Link>
        <h1 className={`mt-4 ${styles.pageTitle}`}>{module.title}</h1>
        <p className={styles.pageSubtitle}>{module.lessons.length} lessons</p>
      </div>

      {/* Existing lessons */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Lessons</h2>
        <div className="space-y-3 mt-4">
          {module.lessons.length === 0 && (
            <p className={styles.label}>No lessons yet — add one below.</p>
          )}
          {module.lessons.map((lesson) => {
            const deleteLessonWithIds = deleteLesson.bind(null, lesson.id, slug, moduleId);
            const updateLessonWithIds = updateLesson.bind(null, lesson.id, slug, moduleId);

            return (
              <LessonDetails
                key={lesson.id}
                lessonId={lesson.id}
                lessonType={lesson.type}
                lessonContent={lesson.content}
                challengeData={lesson.challengeData as { questions: { id: string; question: string; options: { text: string }[]; correctIndex: number }[] } | null}
              >
                <summary className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className={`${styles.badgeBase} ${lesson.type === "CHALLENGE" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      {lesson.type === "CHALLENGE" ? "⚡ Challenge" : lesson.type}
                    </span>
                    <p className="font-medium text-slate-900">{lesson.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={styles.label}>{lesson.pointsAwarded} pts</span>
                    <form action={deleteLessonWithIds}>
                      <button
                        type="submit"
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </summary>

                {/* Edit form */}
                <form action={updateLessonWithIds} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={styles.formLabel}>Title</label>
                      <input name="title" defaultValue={lesson.title} required className={styles.formInput} />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Estimated minutes</label>
                      <input name="estimatedMinutes" type="number" defaultValue={lesson.estimatedMinutes ?? 5} className={styles.formInput} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={styles.formLabel}>Points awarded</label>
                      <input name="pointsAwarded" type="number" defaultValue={lesson.pointsAwarded} className={styles.formInput} />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Summary</label>
                      <input name="summary" defaultValue={lesson.summary ?? ""} className={styles.formInput} />
                    </div>
                  </div>
                  <button type="submit" className={styles.ctaPrimary}>Save lesson</button>
                </form>
              </LessonDetails>
            );
          })}
        </div>
      </div>

      {/* Add lesson form */}
      <div className={`mt-6 ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Add lesson</h2>
        <AddLessonForm action={createLessonWithIds} />
      </div>
    </div>
  );
}