// src/app/api/lessons/[lessonId]/complete/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const userId = session.user.id;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: true },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.module.courseId,
      },
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const alreadyCompleted = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  if (!alreadyCompleted?.completed) {
    // mark lesson complete
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    // award lesson points
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: lesson.pointsAwarded } },
    });

    // recalculate enrollment progress
    const allLessons = lesson.module.course.modules.flatMap((m) => m.lessons);
    const completedCount = await prisma.lessonProgress.count({
      where: { userId, completed: true, lessonId: { in: allLessons.map((l) => l.id) } },
    });
    const progressPercent = Math.round((completedCount / allLessons.length) * 100);

    await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
      data: { progressPercent },
    });

    // first step badge
    const totalCompleted = await prisma.lessonProgress.count({
      where: { userId, completed: true },
    });
    if (totalCompleted === 1) {
      const firstStepBadge = await prisma.badge.findUnique({
        where: { code: "first-step" },
      });
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
      }
    }

    // course complete badge
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
      }
    }

    // sync level LAST after all points including badges
    const finalUser = await prisma.user.findUnique({ where: { id: userId } });
    const finalLevel = Math.floor((finalUser?.points ?? 0) / 100) + 1;
    await prisma.user.update({
      where: { id: userId },
      data: { level: finalLevel },
    });

    // update leaderboard LAST after all points
    const finalUser2 = await prisma.user.findUnique({ where: { id: userId } });

    const existingAllTime = await prisma.leaderboardEntry.findFirst({
      where: { userId, period: "all_time" },
    });
    if (existingAllTime) {
      await prisma.leaderboardEntry.update({
        where: { id: existingAllTime.id },
        data: { points: finalUser2?.points ?? 0 },
      });
    } else {
      await prisma.leaderboardEntry.create({
        data: { userId, period: "all_time", points: finalUser2?.points ?? 0 },
      });
    }

    const existingRecent = await prisma.leaderboardEntry.findFirst({
      where: { userId, period: "last_7_days" },
    });
    if (existingRecent) {
      await prisma.leaderboardEntry.update({
        where: { id: existingRecent.id },
        data: { points: { increment: lesson.pointsAwarded } },
      });
    } else {
      await prisma.leaderboardEntry.create({
        data: { userId, period: "last_7_days", points: lesson.pointsAwarded },
      });
    }
  }

  const courseSlug = lesson.module.course.slug;
  const lessonSlug = lesson.slug;
  return NextResponse.redirect(
    new URL(`/courses/${courseSlug}/lessons/${lessonSlug}`, req.url)
  );
}