// src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import Link from "next/link";

export default async function AdminPage() {
  const [totalUsers, totalCourses, totalLessons, totalEnrollments] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.enrollment.count(),
  ]);

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8">
        <h1 className={styles.pageTitle}>Admin Panel</h1>
        <p className={styles.pageSubtitle}>Manage courses, badges, and users.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Users", totalUsers, "/admin/users"],
          ["Courses", totalCourses, "/admin/courses"],
          ["Lessons", totalLessons, "/admin/courses"],
          ["Enrollments", totalEnrollments, "/admin/users"],
        ].map(([label, value, href]) => (
          <Link
            key={String(label)}
            href={String(href)}
            style={{
              background: "white",
              borderRadius: "1rem",
              border: "1px solid #e2e8f0",
              padding: "1.25rem 1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              display: "block",
            }}
          >
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>{String(label)}</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>{String(value)}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/courses" className={`block ${styles.cardHover}`}>
          <h2 className="text-lg font-semibold text-slate-900">Monitor courses</h2>
          <p className={`mt-2 ${styles.cardBody}`}>Add a new course with modules and lessons.</p>
          <p className={`mt-4 ${styles.ctaPrimary} inline-block`}>Get started →</p>
        </Link>
        <Link href="/admin/badges" className={`block ${styles.cardHover}`}>
          <h2 className="text-lg font-semibold text-slate-900">Manage badges</h2>
          <p className={`mt-2 ${styles.cardBody}`}>Create and edit achievement badges.</p>
          <p className={`mt-4 ${styles.ctaPrimary} inline-block`}>Go to badges →</p>
        </Link>
        <Link href="/admin/users" className={`block ${styles.cardHover}`}>
          <h2 className="text-lg font-semibold text-slate-900">View users</h2>
          <p className={`mt-2 ${styles.cardBody}`}>See all users, their progress and points.</p>
          <p className={`mt-4 ${styles.ctaPrimary} inline-block`}>Go to users →</p>
        </Link>
      </div>
    </div>
  );
}