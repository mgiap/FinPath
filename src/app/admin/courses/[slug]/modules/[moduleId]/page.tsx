// src/app/admin/courses/[slug]/modules/[moduleId]/page.tsx
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LessonType } from "@prisma/client";
import AddLessonForm from "@/components/add-lesson-form";
import LessonEditCard from "@/components/lesson-edit-card";

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
    data: { moduleId, title, slug, summary, content, type, estimatedMinutes, pointsAwarded, order: count + 1 },
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
    include: { lessons: { orderBy: { order: "asc" } }, course: true },
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

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Lessons</h2>
        <div className="space-y-3 mt-4">
          {module.lessons.length === 0 && (
            <p className={styles.label}>No lessons yet — add one below.</p>
          )}
          {module.lessons.map((lesson) => {
            const updateAction = updateLesson.bind(null, lesson.id, slug, moduleId);
            const deleteAction = deleteLesson.bind(null, lesson.id, slug, moduleId);

            return (
              <LessonEditCard
                key={lesson.id}
                lessonId={lesson.id}
                lessonType={lesson.type}
                lessonTitle={lesson.title}
                lessonContent={lesson.content}
                lessonSummary={lesson.summary}
                lessonEstimatedMinutes={lesson.estimatedMinutes}
                lessonPointsAwarded={lesson.pointsAwarded}
                challengeData={lesson.challengeData as { questions: { id: string; question: string; options: { text: string }[]; correctIndex: number }[] } | null}
                updateAction={updateAction}
                deleteAction={deleteAction}
              />
            );
          })}
        </div>
      </div>

      <div className={`mt-6 ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Add lesson</h2>
        <AddLessonForm action={createLessonWithIds} />
      </div>
    </div>
  );
}