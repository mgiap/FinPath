// src/app/admin/courses/page.tsx
import { prisma } from "@/lib/prisma";
import { styles, difficultyBadge } from "@/lib/styles";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  });

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={styles.pageTitle}>Courses</h1>
          <p className={styles.pageSubtitle}>{courses.length} courses total.</p>
        </div>
        <Link href="/admin/courses/new" className={styles.enrollBtn}>
          + New course
        </Link>
      </div>

      <div className="space-y-3">
        {courses.length === 0 && (
          <div className={styles.emptyState}>No courses yet.</div>
        )}
        {courses.map((course) => (
          <div key={course.id} className="relative">
            <Link
              href={`/admin/courses/${course.slug}`}
              className={`flex items-center gap-4 pr-24 ${styles.cardHover}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`${styles.badgeBase} ${difficultyBadge[course.difficulty] ?? "bg-slate-100 text-slate-700"}`}>
                    {course.difficulty}
                  </span>
                  <span className={`${styles.badgeBase} ${course.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {course.published ? "published" : "draft"}
                  </span>
                </div>
                <p className={styles.cardTitle}>{course.title}</p>
                <p className={`text-xs mt-0.5 ${styles.label}`}>{course.description}</p>
                <p className={`text-xs mt-1 ${styles.label}`}>
                  {course._count.modules} modules · {course._count.enrollments} enrollments
                </p>
              </div>
            </Link>
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className={`${styles.ctaGhost} absolute right-4 top-1/2 -translate-y-1/2`}
            >
              Preview
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}