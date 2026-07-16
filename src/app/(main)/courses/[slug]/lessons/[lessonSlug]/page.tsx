import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import LessonRewardToast from "@/components/lesson-reward-toast";
import ChallengeRunner from "@/components/challenge-runner";
import type { ChallengeData } from "@/lib/challenge";

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

  const completedSet = new Set(completedLessons.map((l: { lessonId: string }) => l.lessonId));
  const allLessons = lesson.module.lessons;
  const currentIndex = allLessons.findIndex((l: { id: string }) => l.id === lesson.id);
  const prevLesson = allLessons[currentIndex - 1] ?? null;
  const nextLesson = allLessons[currentIndex + 1] ?? null;
  const isCompleted = progress?.completed ?? false;
  const isChallenge = lesson.type === "CHALLENGE";

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
        <div className="space-y-4">
          {/* Header */}
          <div className={styles.card}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`${styles.badgeBase} ${isChallenge ? "bg-amber-100 text-amber-800" : styles.badgeSuccess}`}>
                {isChallenge ? "⚡ Challenge" : lesson.type}
              </span>
              {lesson.estimatedMinutes && (
                <span className={styles.label}>{lesson.estimatedMinutes} min</span>
              )}
              {isCompleted && (
                <span className={`${styles.badgeBase} ${styles.badgeNeutral} ml-auto`}>
                  ✓ Completed
                  {progress?.score !== null && progress?.score !== undefined
                    ? ` — best score ${progress.score}%`
                    : ""}
                </span>
              )}
            </div>
            <h1 className={styles.pageTitle}>{lesson.title}</h1>
            {lesson.summary && (
              <p className={`mt-2 ${styles.pageSubtitle}`}>{lesson.summary}</p>
            )}
            {isChallenge && !isCompleted && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                Score 70% or above to clear this challenge and earn full rewards.
              </p>
            )}
          </div>

          {isChallenge ? (
            <ChallengeRunner
              lessonId={lesson.id}
              challengeData={lesson.challengeData as unknown as ChallengeData}
              courseSlug={slug}
              lessonSlug={lessonSlug}
              previousScore={progress?.score ?? null}
            />
          ) : (
            <>
              <div className={styles.card}>
                {lesson.content ? (
                  <p className="text-slate-700 leading-7 whitespace-pre-wrap">{lesson.content}</p>
                ) : (
                  <p className={styles.label}>No content available for this lesson yet.</p>
                )}
              </div>

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
            </>
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
          {allLessons.map((l: { id: string; slug: string; title: string; type: string }, i) => {
            const isCurrent = l.id === lesson.id;
            const isDone = completedSet.has(l.id);
            const isLessonChallenge = l.type === "CHALLENGE";
            return (
              <Link
                key={l.id}
                href={`/courses/${slug}/lessons/${l.slug}`}
                className={isCurrent ? styles.sidebarLinkActive : styles.sidebarLinkInactive}
              >
                <span className={`${styles.sidebarDot} ${
                  isCurrent ? "bg-emerald-500 text-white"
                  : isDone ? "bg-emerald-100 text-emerald-700"
                  : isLessonChallenge ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-500"
                }`}>
                  {isDone ? "✓" : isLessonChallenge ? "⚡" : i + 1}
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