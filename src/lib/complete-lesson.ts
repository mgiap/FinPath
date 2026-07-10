import { prisma } from "@/lib/prisma";

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function isYesterday(earlier: Date, now: Date) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const diff = new Date(now).setHours(0, 0, 0, 0) - new Date(earlier).setHours(0, 0, 0, 0);
  return diff === oneDayMs;
}

export class NotEnrolledError extends Error {}

export async function completeLessonForUser(
  userId: string,
  lessonId: string,
  pointsToAward: number,
  scorePercent?: number
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: { include: { modules: { include: { lessons: true } } } },
        },
      },
    },
  });
  if (!lesson) throw new Error("Lesson not found");

  const courseSlug = lesson.module.course.slug;
  const lessonSlug = lesson.slug;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
  });
  if (!enrollment) throw new NotEnrolledError("Not enrolled");

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const isChallenge = lesson.type === "CHALLENGE";
  // challenges only count as cleared at 70%+
  const cleared = !isChallenge || (scorePercent !== undefined && scorePercent >= 70);
  // first completion = never completed before AND (article always / challenge must be cleared)
  const isFirstCompletion = !existing?.completed && cleared;

  let pointsEarned = 0;
  const badgesUnlocked: string[] = [];
  let leveledUp = false;
  let newLevel: number | null = null;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      // only flip completed to true if cleared
      ...(cleared && !existing?.completed
        ? { completed: true, completedAt: new Date() }
        : existing?.completed
        ? { completedAt: existing.completedAt }
        : {}),
      score: scorePercent ?? undefined,
      ...(isFirstCompletion && scorePercent !== undefined
        ? { firstAttemptScore: scorePercent }
        : {}),
    },
    create: {
      userId,
      lessonId,
      completed: cleared,
      completedAt: cleared ? new Date() : undefined,
      score: scorePercent ?? undefined,
      firstAttemptScore: scorePercent ?? undefined,
    },
  });

  // only award points on first cleared completion
  if (isFirstCompletion && pointsToAward > 0) {
    pointsEarned += pointsToAward;
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: pointsToAward } },
    });
  }

  // ── Streak — always update on any attempt ───────────────────────
  const streak = await prisma.streak.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  const now = new Date();
  let currentCount: number;
  if (!streak || !streak.lastActivityAt) currentCount = 1;
  else if (isSameDay(streak.lastActivityAt, now)) currentCount = streak.currentCount;
  else if (isYesterday(streak.lastActivityAt, now)) currentCount = streak.currentCount + 1;
  else currentCount = 1;
  const longestCount = Math.max(streak?.longestCount ?? 0, currentCount);

  if (streak) {
    await prisma.streak.update({
      where: { id: streak.id },
      data: { currentCount, longestCount, lastActivityAt: now },
    });
  } else {
    await prisma.streak.create({
      data: { userId, currentCount, longestCount, lastActivityAt: now },
    });
  }
  await prisma.user.update({ where: { id: userId }, data: { streakDays: currentCount } });
  const newStreakCount = currentCount;

  // ── Progress % — only count cleared lessons ─────────────────────
  const allLessons = lesson.module.course.modules.flatMap((m) => m.lessons);
  const completedCount = await prisma.lessonProgress.count({
    where: { userId, completed: true, lessonId: { in: allLessons.map((l) => l.id) } },
  });
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);
  await prisma.enrollment.update({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
    data: { progressPercent },
  });

  if (isFirstCompletion) {
    // ── First step badge ────────────────────────────────────────
    const totalCompleted = await prisma.lessonProgress.count({
      where: { userId, completed: true },
    });
    if (totalCompleted === 1) {
      const firstStepBadge = await prisma.badge.findUnique({ where: { code: "first-step" } });
      if (firstStepBadge) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId, badgeId: firstStepBadge.id } },
          update: {},
          create: { userId, badgeId: firstStepBadge.id },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: firstStepBadge.pointsReward } },
        });
        pointsEarned += firstStepBadge.pointsReward;
        badgesUnlocked.push(firstStepBadge.name);
      }
    }

    // ── Course complete badge ───────────────────────────────────
    if (progressPercent === 100) {
      await prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      const courseBadge = await prisma.badge.findFirst({
        where: { courseId: lesson.module.courseId, code: "course-complete" },
      });
      if (courseBadge) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId, badgeId: courseBadge.id } },
          update: {},
          create: { userId, badgeId: courseBadge.id },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: courseBadge.pointsReward } },
        });
        pointsEarned += courseBadge.pointsReward;
        badgesUnlocked.push(courseBadge.name);
      }
    }

    // ── Trigger-based badges ────────────────────────────────────
    const triggerBadges = await prisma.badge.findMany({
      where: { triggerType: { not: null } },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    const updatedStreak = await prisma.streak.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    const totalLessonsCompleted = await prisma.lessonProgress.count({
      where: { userId, completed: true },
    });

    for (const badge of triggerBadges) {
      const alreadyEarned = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (alreadyEarned) continue;

      let earned = false;

      if (badge.triggerType === "complete_course" && badge.courseId) {
        const courseEnrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId: badge.courseId } },
        });
        earned = courseEnrollment?.status === "COMPLETED";
      }

      if (badge.triggerType === "lessons_count" && badge.triggerValue) {
        earned = totalLessonsCompleted >= badge.triggerValue;
      }

      if (badge.triggerType === "level" && badge.triggerValue) {
        earned = (updatedUser?.level ?? 1) >= badge.triggerValue;
      }

      if (badge.triggerType === "streak" && badge.triggerValue) {
        earned = (updatedStreak?.currentCount ?? 0) >= badge.triggerValue;
      }

      if (earned) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        if (badge.pointsReward > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: { points: { increment: badge.pointsReward } },
          });
          pointsEarned += badge.pointsReward;
        }
        badgesUnlocked.push(badge.name);
      }
    }

    // ── Level sync ────────────────────────────────────────────
    const userBeforeLevel = await prisma.user.findUnique({ where: { id: userId } });
    const previousLevel = userBeforeLevel?.level ?? 1;
    const finalLevel = Math.floor((userBeforeLevel?.points ?? 0) / 100) + 1;
    if (finalLevel > previousLevel) {
      leveledUp = true;
      newLevel = finalLevel;
    }
    await prisma.user.update({ where: { id: userId }, data: { level: finalLevel } });

    // ── Leaderboard ───────────────────────────────────────────
    const finalUser = await prisma.user.findUnique({ where: { id: userId } });
    const existingAllTime = await prisma.leaderboardEntry.findFirst({
      where: { userId, period: "all_time" },
    });
    if (existingAllTime) {
      await prisma.leaderboardEntry.update({
        where: { id: existingAllTime.id },
        data: { points: finalUser?.points ?? 0 },
      });
    } else {
      await prisma.leaderboardEntry.create({
        data: { userId, period: "all_time", points: finalUser?.points ?? 0 },
      });
    }
    const existingRecent = await prisma.leaderboardEntry.findFirst({
      where: { userId, period: "last_7_days" },
    });
    if (existingRecent) {
      await prisma.leaderboardEntry.update({
        where: { id: existingRecent.id },
        data: { points: { increment: pointsToAward } },
      });
    } else {
      await prisma.leaderboardEntry.create({
        data: { userId, period: "last_7_days", points: pointsToAward },
      });
    }
  }

  return {
    isFirstCompletion,
    pointsEarned,
    badgesUnlocked,
    newStreakCount,
    leveledUp,
    newLevel,
    courseSlug,
    lessonSlug,
  };
}