import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completeLessonForUser, NotEnrolledError } from "@/lib/complete-lesson";
import type { ChallengeData } from "@/lib/challenge";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId } = await params;
  const userId = session.user.id;
  const body = await req.json();
  const answers: number[] = Array.isArray(body.answers) ? body.answers : [];

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.type !== "CHALLENGE" || !lesson.challengeData)
    return NextResponse.json({ error: "Not a challenge lesson" }, { status: 400 });

  const challengeData = lesson.challengeData as unknown as ChallengeData;
  const total = challengeData.questions.length;
  let correctCount = 0;

  const results = challengeData.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      isCorrect,
      selected: answers[i] ?? null,
    };
  });

  const scorePercent = Math.round((correctCount / total) * 100);
  const pointsToAward = Math.round((lesson.pointsAwarded * correctCount) / total);
  const cleared = scorePercent >= 70;

  try {
    const reward = await completeLessonForUser(userId, lessonId, pointsToAward, scorePercent);
    return NextResponse.json({
      correctCount,
      total,
      scorePercent,
      cleared,
      results,
      reward,
    });
  } catch (e) {
    if (e instanceof NotEnrolledError)
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    throw e;
  }
}