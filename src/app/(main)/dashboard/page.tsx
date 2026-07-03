// src/app/(main)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import { progressColor } from "@/lib/utils";
import { getEffectiveStreak } from "@/lib/streak";
import DonutChart from "@/components/donut-chart";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, enrollments, allBadges, streak, lessonProgressCount, allTimeEntries] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.streak.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } }),
    prisma.lessonProgress.count({ where: { userId, completed: true } }),
    prisma.leaderboardEntry.findMany({
      where: { period: "all_time" },
      orderBy: { points: "desc" },
    }),
  ]);

  const myRank = allTimeEntries.findIndex((e) => e.userId === userId) + 1;

  const points = user?.points ?? 0;
  const level = user?.level ?? 1;
  const pointsIntoCurrentLevel = points % 100;
  const pointsToNextLevel = 100;
  const levelPercent = Math.round((pointsIntoCurrentLevel / pointsToNextLevel) * 100);

  const displayStreak = getEffectiveStreak(streak?.currentCount ?? user?.streakDays ?? 0, streak?.lastActivityAt);

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8">
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>Your learning progress at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Points", points, "total XP earned"],
          ["Lessons done", lessonProgressCount, "completed so far"],
          ["Streak", `${displayStreak}`, "days in a row"],
          ["Rank", myRank === 0 ? "—" : `#${myRank}`, "on leaderboard"],
        ].map(([label, value, sub], i) => (
          <div
            key={String(label)}
            className="animate-pop-in"
            style={{
              animationDelay: `${i * 60}ms`,
              background: "white",
              borderRadius: "1rem",
              border: "1px solid #e2e8f0",
              padding: "1.25rem 1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase" }}>{String(label)}</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>{String(value)}</p>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{String(sub)}</p>
          </div>
        ))}
      </div>

      {/* Level progress bar */}
      <div className={`mt-6 ${styles.card}`}>
        <div className="flex items-center justify-between mb-2">
          <p className={styles.sectionTitle}>Level progress</p>
          <p className={styles.statSub}>{pointsIntoCurrentLevel} / {pointsToNextLevel} XP — Level {level}</p>
        </div>
        <div className={styles.levelBarTrack}>
          <div className={`${styles.levelBarFill} progress-fill-animate`} style={{ width: `${levelPercent}%` }} />
        </div>
        <p className={`mt-2 ${styles.label}`}>
          Earn {pointsToNextLevel - pointsIntoCurrentLevel} more points to reach Level {level + 1}
        </p>
      </div>

      {/* Courses - full width */}
      <div className={`mt-6 ${styles.card}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={styles.sectionTitle}>Courses</h2>
          <Link href="/courses" className={styles.ctaPrimary}>Browse all →</Link>
        </div>
        {enrollments.length === 0 && (
          <p className={styles.label}>No enrollments yet.</p>
        )}
        <div className="grid grid-cols-3 gap-4">
          {enrollments.map((en) => {
            const pct = en.progressPercent;
            const r = 44;
            const circ = 2 * Math.PI * r;
            const filled = (pct / 100) * circ;
            const gap = circ - filled;
            const stroke = progressColor(pct);

            return (
              <Link
                key={en.id}
                href={`/courses/${en.course.slug}`}
                className="flex flex-row items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:border-emerald-200 transition-colors"
              >
                <DonutChart pct={pct} stroke={stroke} size={120} />
                <div className="flex flex-col justify-center gap-1 min-w-0">
                  <p className={styles.cardTitle}>{en.course.title}</p>
                  <p className={`text-xs leading-5 ${styles.label}`}>{en.course.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Badges - full width */}
      <div className={`mt-6 ${styles.card}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={styles.sectionTitle}>Badges</h2>
          <p className={styles.label}>{allBadges.length} unlocked</p>
        </div>
        {allBadges.length === 0 && (
          <p className={styles.label}>Complete lessons to unlock badges.</p>
        )}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {allBadges.map((ub) => (
            <div key={ub.id} className={styles.badgeCard}>
              <div className={styles.badgeIcon}>
                {ub.badge?.icon
                  ? <img src={ub.badge.icon} alt={ub.badge.name ?? ""} />
                  : ub.badge?.name?.[0]}
              </div>
              <p className="text-sm font-medium text-slate-900">{ub.badge?.name}</p>
              <p className={styles.label}>{ub.badge?.rarity.toLowerCase()}</p>
              <p className={styles.label}>
                {ub.unlockedAt ? new Date(ub.unlockedAt).toLocaleDateString() : ""}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className={`mt-6 ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Activity</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Lessons completed", lessonProgressCount],
            ["Courses enrolled", enrollments.length],
            ["Badges earned", allBadges.length],
            ["Longest streak", `${streak?.longestCount ?? 0} days`],
          ].map(([label, value]) => (
            <div key={label} className={styles.cardInner}>
              <p className={styles.label}>{label}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}