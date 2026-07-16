// src/app/(main)/courses/[slug]/page.tsx
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles, difficultyBadge } from "@/lib/styles";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) notFound();

  const [actualEnrollment, completedLessons]: [
    { userId: string; courseId: string; status: string; enrolledAt: Date; completedAt: Date | null; progressPercent: number } | null,
    { lessonId: string }[],
  ] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    }),
    prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    }),
  ]);

  const completedSet = new Set(completedLessons.map((lesson) => lesson.lessonId));
  const totalLessons = course.modules.reduce(
    (sum: number, module: (typeof course.modules)[number]) => sum + module.lessons.length,
    0,
  );

  return (
    <div className={styles.pageWrapper}>
      <Link href="/courses" className={`${styles.label} hover:text-slate-700 transition-colors`}>
        ← Back to courses
      </Link>

      <div className="mt-6 mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`${styles.badgeBase} ${difficultyBadge[course.difficulty] ?? "bg-slate-100 text-slate-700"}`}>
              {course.difficulty}
            </span>
            <span className={styles.label}>{totalLessons} lessons</span>
          </div>
          <h1 className={styles.pageTitle}>{course.title}</h1>
          <p className={styles.pageSubtitle}>{course.description}</p>
        </div>

        <div className="shrink-0">
          {actualEnrollment ? (
            <div className={styles.progressCard}>
              <p className={styles.label}>Progress</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {actualEnrollment.progressPercent}%
              </p>
              <div className={`mt-2 ${styles.progressTrack}`}>
                <div className={styles.progressFill} style={{ width: `${actualEnrollment.progressPercent}%` }} />
              </div>
            </div>
          ) : (
            <form action={`/api/courses/${course.id}/enroll`} method="POST">
              <button type="submit" className={styles.enrollBtn}>
                Enroll in course
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {course.modules.map((module: (typeof course.modules)[number], moduleIndex: number) => (
          <div key={module.id} className={styles.card}>
            <div className="flex items-center gap-3 mb-4">
              <span className={styles.moduleNumber}>
                {moduleIndex + 1}
              </span>
              <h2 className="font-semibold text-slate-900">{module.title}</h2>
              <span className={`ml-auto ${styles.label}`}>
                {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
              </span>
            </div>

            {module.description && (
              <p className={`mb-4 ${styles.cardBody}`}>{module.description}</p>
            )}

            <div className="space-y-2">
              {module.lessons.map((lesson: (typeof module.lessons)[number], lessonIndex: number) => {
                const isDone = completedSet.has(lesson.id);
                const isLocked = !actualEnrollment;
                const isChallenge = lesson.type === "CHALLENGE";

                return (
                  <div
                    key={lesson.id}
                    className={
                      isDone ? styles.lessonRowDone
                      : isLocked ? styles.lessonRowLocked
                      : isChallenge ? styles.lessonRowChallenge
                      : styles.lessonRowDefault
                    }
                  >
                    <span className={
                      isDone ? styles.lessonDotDone
                      : isChallenge ? styles.lessonDotChallenge
                      : styles.lessonDotDefault
                    }>
                      {isDone ? "✓" : isChallenge ? "⚡" : lessonIndex + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${isDone ? "text-emerald-800" : isChallenge ? "text-amber-800" : "text-slate-800"}`}>
                          {lesson.title}
                        </p>
                        {isChallenge && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Challenge
                          </span>
                        )}
                      </div>
                      {lesson.estimatedMinutes && (
                        <p className={`text-xs ${styles.label}`}>{lesson.estimatedMinutes} min</p>
                      )}
                    </div>

                    {!isLocked && (
                      <Link href={`/courses/${slug}/lessons/${lesson.slug}`} className={styles.ctaPrimary}>
                        {isDone ? "Review" : "Start"}
                      </Link>
                    )}

                    {isLocked && (
                      <span className={styles.label}>🔒</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}