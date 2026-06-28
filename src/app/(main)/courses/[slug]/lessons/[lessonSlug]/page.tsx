// src/app/(main)/courses/[slug]/lessons/[lessonSlug]/page.tsx
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import LessonRewardToast from "@/components/lesson-reward-toast";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
  searchParams: Promise<{ earned?: string; badges?: string; streak?: string; level?: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const lesson = await prisma.lesson.findFirst({
    where: { slug: lessonSlug, module: { course: { slug } } },
    include: {
      module: {
        include: {
          course: true,
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!lesson) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
  });

  if (!enrollment) notFound();

  const [progress, completedLessons] = await Promise.all([
    prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
    }),
    prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    }),
  ]);

  const completedSet = new Set(completedLessons.map((l) => l.lessonId));
  const allLessons = lesson.module.lessons;
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = allLessons[currentIndex - 1] ?? null;
  const nextLesson = allLessons[currentIndex + 1] ?? null;
  const isCompleted = progress?.completed ?? false;

  const pointsEarned = sp.earned ? Number(sp.earned) : null;
  const badgesUnlocked = sp.badges ? sp.badges.split(",") : [];
  const streakCount = sp.streak ? Number(sp.streak) : null;
  const newLevel = sp.level ? Number(sp.level) : null;

  return (
    <div className={styles.pageWrapper}>
      <LessonRewardToast
        pointsEarned={pointsEarned}
        badgesUnlocked={badgesUnlocked}
        streakCount={streakCount}
        newLevel={newLevel}
        pathname={`/courses/${slug}/lessons/${lessonSlug}`}
      />

      <Link href={`/courses/${slug}`} className={`${styles.label} hover:text-slate-700 transition-colors`}>
        ← Back to course
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="space-y-4">

          {/* Header */}
          <div className={styles.card}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`${styles.badgeBase} ${styles.badgeSuccess}`}>
                {lesson.type}
              </span>
              {lesson.estimatedMinutes && (
                <span className={styles.label}>{lesson.estimatedMinutes} min read</span>
              )}
              {isCompleted && (
                <span className={`${styles.badgeBase} ${styles.badgeNeutral} ml-auto`}>
                  ✓ Completed
                </span>
              )}
            </div>
            <h1 className={styles.pageTitle}>{lesson.title}</h1>
            {lesson.summary && (
              <p className={`mt-2 ${styles.pageSubtitle}`}>{lesson.summary}</p>
            )}
          </div>

          {/* Content */}
          <div className={styles.card}>
            {lesson.content ? (
              <p className="text-slate-700 leading-7 whitespace-pre-wrap">{lesson.content}</p>
            ) : (
              <p className={styles.label}>No content available for this lesson yet.</p>
            )}
          </div>

          {/* Complete banner */}
          {!isCompleted && (
            <div className={styles.completeBanner}>
              <div>
                <p className={styles.completeBannerTitle}>Complete this lesson</p>
                <p className={styles.completeBannerSubtitle}>
                  Earn {lesson.pointsAwarded} points when you mark it done
                </p>
              </div>
              <form action={`/api/lessons/${lesson.id}/complete`} method="POST">
                <button type="submit" className={styles.completeBannerBtn}>
                  Mark as complete
                </button>
              </form>
            </div>
          )}

          {/* Prev / Next */}
          <div className="flex items-center justify-between gap-4">
            {prevLesson ? (
              <Link href={`/courses/${slug}/lessons/${prevLesson.slug}`} className={styles.ctaGhost}>
                ← {prevLesson.title}
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link href={`/courses/${slug}/lessons/${nextLesson.slug}`} className={styles.ctaPrimary}>
                {nextLesson.title} →
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-2">
          <p className={styles.sidebarLabel}>{lesson.module.title}</p>
          {allLessons.map((l, i) => {
            const isCurrent = l.id === lesson.id;
            const isDone = completedSet.has(l.id);
            return (
              <Link
                key={l.id}
                href={`/courses/${slug}/lessons/${l.slug}`}
                className={isCurrent ? styles.sidebarLinkActive : styles.sidebarLinkInactive}
              >
                <span className={`${styles.sidebarDot} ${isCurrent ? "bg-emerald-500 text-white" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {isDone ? "✓" : i + 1}
                </span>
                {l.title}
              </Link>
            );
          })}
        </aside>
      </div>
    </div>
  );
}