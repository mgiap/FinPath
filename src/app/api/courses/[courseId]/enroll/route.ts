// src/app/api/courses/[courseId]/enroll/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;
  const userId = session.user.id;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) {
    return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url));
  }

  await prisma.enrollment.create({
    data: { userId, courseId, status: "ACTIVE", progressPercent: 0 },
  });

  return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url));
}