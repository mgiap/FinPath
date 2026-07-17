// src/app/(main)/courses/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles, difficultyBadge } from "@/lib/styles";
import Link from "next/link";
import { progressColor } from "@/lib/utils";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      include: { _count: { select: { modules: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true, progressPercent: true, status: true },
    }),
  ]);

  const enrollmentMap = Object.fromEntries(
    enrollments.map((e) => [e.courseId, e])
  );

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8">
        <h1 className={styles.pageTitle}>Courses</h1>
        <p className={styles.pageSubtitle}>
          Pick a course and start building your finance knowledge.
        </p>
      </div>

      {courses.length === 0 && (
        <div className={styles.emptyState}>
          <p>No courses published yet.</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => {
          const enrollment = enrollmentMap[course.id];
          const isEnrolled = Boolean(enrollment);
          const progress = enrollment?.progressPercent ?? 0;

          return (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className={`animate-pop-in group flex flex-col ${styles.cardHover}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Cover */}
              <div className="mb-4 h-36 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center text-4xl select-none">
                {course.coverImage ? (
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "📘"
                )}
              </div>

              {/* Title + difficulty */}
              <div className="flex items-start justify-between gap-2">
                <h2 className={`${styles.cardTitle} group-hover:text-emerald-700 transition-colors`}>
                  {course.title}
                </h2>
                <span className={`${styles.badgeBase} ${difficultyBadge[course.difficulty] ?? "bg-slate-100 text-slate-700"}`}>
                  {course.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className={`mt-2 line-clamp-2 ${styles.cardBody}`}>
                {course.description}
              </p>

              {/* Module count */}
              <p className={`mt-3 ${styles.label}`}>
                {course._count.modules} module{course._count.modules !== 1 ? "s" : ""}
              </p>

              {/* Progress or CTA */}
              <div className="mt-auto pt-5">
                {isEnrolled ? (
                  <>
                    <div className={styles.progressTrack}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: progressColor(progress) }}
                      />
                    </div>
                    <p className={`mt-1.5 ${styles.label}`}>{progress}% complete</p>
                  </>
                ) : (
                  <span className={styles.ctaPrimary}>Start course →</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}