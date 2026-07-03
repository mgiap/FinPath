import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completeLessonForUser, NotEnrolledError } from "@/lib/complete-lesson";

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

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  try {
    const reward = await completeLessonForUser(userId, lessonId, lesson.pointsAwarded);
    const redirectUrl = new URL(
      `/courses/${reward.courseSlug}/lessons/${reward.lessonSlug}`,
      req.url
    );
    if (reward.pointsEarned > 0) {
      redirectUrl.searchParams.set("earned", String(reward.pointsEarned));
      if (reward.badgesUnlocked.length > 0)
        redirectUrl.searchParams.set("badges", reward.badgesUnlocked.join(","));
      if (reward.newStreakCount !== null)
        redirectUrl.searchParams.set("streak", String(reward.newStreakCount));
      if (reward.leveledUp && reward.newLevel !== null)
        redirectUrl.searchParams.set("level", String(reward.newLevel));
    }
    return NextResponse.redirect(redirectUrl);
  } catch (e) {
    if (e instanceof NotEnrolledError)
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    throw e;
  }
}