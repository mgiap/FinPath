// src/app/page.tsx
import { getServerSession } from "next-auth";
import Link from "next/link";
import AuthActions from "@/components/auth-actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import { progressColor } from "@/lib/utils";
import type { Enrollment, Streak, LeaderboardEntry, User, Course } from "@prisma/client";

const guestSections = [
  {
    title: "Learn at your own pace",
    text: "Courses are broken into short lessons you can complete in minutes.",
  },
  {
    title: "Track your progress",
    text: "Points, streaks, and badges keep you motivated as you advance.",
  },
  {
    title: "Built for business and finance",
    text: "Every course covers practical skills you can apply immediately.",
  },
];

type LeaderboardRow = LeaderboardEntry & { user: User | null };

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session);
  const displayName = session?.user?.name ?? "Learner";

  let enrollments: (Enrollment & { course: Course })[] = [];
  let lessonProgressCount = 0;
  let streak: Streak | null = null;
  let leaderboardEntries: LeaderboardRow[] = [];
  let userRecord: User | null = null;

  if (isSignedIn && session?.user?.id) {
    const userId = session.user.id;

    [userRecord, enrollments, streak, leaderboardEntries] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.enrollment.findMany({
        where: { userId },
        include: { course: true },
        orderBy: { enrolledAt: "desc" },
      }),
      prisma.streak.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } }),
      prisma.leaderboardEntry.findMany({
        where: { period: "all_time" },
        include: { user: true },
        orderBy: { points: "desc" },
      }),
    ]);

    lessonProgressCount = await prisma.lessonProgress.count({ where: { userId, completed: true } });
  }

  // Rank computed on the fly from sorted entries, same fix as dashboard —
  // don't trust a possibly-stale stored `rank` column.
  const myRankIndex = leaderboardEntries.findIndex((e) => e.userId === session?.user?.id);
  const myRank = myRankIndex === -1 ? null : myRankIndex + 1;
  const topThree = leaderboardEntries.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];

  // Only courses the user is actually learning — progress > 0%.
  const activeEnrollments = enrollments.filter((en) => en.progressPercent > 0);

  return (
    <main className={`relative min-h-screen overflow-hidden ${styles.pageBg} px-6 py-8 sm:px-10 lg:px-12`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={styles.orbLeft} />
        <div className={styles.orbRight} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
            FinPath
          </p>
          <AuthActions />
        </header>

        {/* Hero */}
        <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-5 shadow-sm backdrop-blur">
          <div className="max-w-3xl space-y-3">
            <p className={styles.label}>
              {isSignedIn ? `Welcome back, ${displayName}` : "Guest preview"}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {isSignedIn
                ? "Ready to keep learning?"
                : "Learn business and finance, your way."}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {isSignedIn
                ? "Pick up where you left off. Your progress, points, and badges are all here."
                : "FinPath is a gamified e-learning platform covering personal finance, business planning, and marketing analytics."}
            </p>
            {isSignedIn ? (
              <div className="flex items-center gap-3 pt-2">
                <Link href="/dashboard" className={styles.heroBtnPrimary}>
                  My dashboard
                </Link>
                <Link href="/leaderboard" className={styles.heroBtnSecondary}>
                  Leaderboard →
                </Link>
              </div>
            ) : (
              <div className="pt-2">
                <Link href="/courses" className={styles.heroBtnPrimary}>
                  Get started →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Three cards */}
        <section className="grid gap-4 lg:grid-cols-3">
          {!isSignedIn &&
            guestSections.map((item) => (
              <article key={item.title} className={styles.card}>
                <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className={`mt-3 ${styles.cardBody}`}>{item.text}</p>
              </article>
            ))}

          {isSignedIn && (
            <>
              {/* Summary */}
              <article className={styles.card}>
                <h2 className="text-lg font-semibold text-slate-950">Summary</h2>
                <p className={`mt-2 ${styles.cardBody}`}>Quick view of your progress.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ["Points", userRecord?.points ?? 0],
                    ["Level", userRecord?.level ?? 1],
                    ["Streak", `${streak?.currentCount ?? userRecord?.streakDays ?? 0} days`],
                    ["Rank", myRank === null ? "—" : `#${myRank}`],
                    ["Lessons done", lessonProgressCount],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.cardInner}>
                      <p className={styles.label}>{label}</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </article>

              {/* Active courses */}
              <article className={styles.card}>
                <h2 className="text-lg font-semibold text-slate-950">Active courses</h2>
                <p className={`mt-2 ${styles.cardBody}`}>Courses you are currently learning.</p>
                <div className="mt-4 space-y-3">
                  {activeEnrollments.length === 0 && (
                    <p className={`text-sm ${styles.label}`}>
                      No active courses yet — start a lesson to see it here.
                    </p>
                  )}
                  {activeEnrollments.map((en) => (
                    <Link
                      key={en.id}
                      href={`/courses/${en.course.slug}`}
                      className={`block ${styles.cardInner} hover:border-emerald-200 transition-colors`}
                    >
                      <p className={styles.cardTitle}>{en.course.title}</p>
                      <p className={`text-xs mt-0.5 ${styles.label}`}>{en.course.description}</p>
                      <div className={`mt-2 ${styles.progressTrack}`}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${en.progressPercent}%`, backgroundColor: progressColor(en.progressPercent) }}
                        />
                      </div>
                      <p className={`mt-1 text-right text-xs ${styles.label}`}>{en.progressPercent}% complete</p>
                    </Link>
                  ))}
                </div>
              </article>

              {/* Leaderboard summary (replaces badges card) */}
              <article className={styles.card}>
                <h2 className="text-lg font-semibold text-slate-950">Leaderboard</h2>
                <p className={`mt-2 ${styles.cardBody}`}>Top learners and where you stand.</p>
                <div className="mt-4 space-y-2">
                  {topThree.length === 0 && (
                    <p className={`text-sm ${styles.label}`}>No ranked learners yet.</p>
                  )}
                  {topThree.map((entry, i) => {
                    const isMe = entry.userId === session?.user?.id;
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                          isMe ? "border-emerald-300 bg-emerald-50" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{medals[i]}</span>
                          <span className="text-sm font-medium text-slate-900">
                            {entry.user?.name ?? "Learner"}
                          </span>
                        </div>
                        <span className={`text-sm ${styles.label}`}>{entry.points} pts</span>
                      </div>
                    );
                  })}
                </div>

                {myRank !== null && myRankIndex >= 3 && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2">
                    <span className="text-sm font-medium text-slate-900">#{myRank} You</span>
                    <span className={`text-sm ${styles.label}`}>
                      {leaderboardEntries[myRankIndex]?.points ?? 0} pts
                    </span>
                  </div>
                )}

                <Link href="/leaderboard" className={`mt-4 inline-block text-sm font-medium text-emerald-700`}>
                  View full leaderboard →
                </Link>
              </article>
            </>
          )}
        </section>
      </div>
    </main>
  );
}