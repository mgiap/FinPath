// src/app/page.tsx
import { getServerSession } from "next-auth";
import Link from "next/link";
import AuthActions from "@/components/auth-actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import { progressColor } from "@/lib/utils";
import { getEffectiveStreak } from "@/lib/streak";
import type { Enrollment, Streak, LeaderboardEntry, User, Course } from "@prisma/client";

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

  // guest stats
  let totalUsers = 0;
  let totalCourses = 0;
  let totalLessons = 0;

  if (isSignedIn && session?.user?.id) {
    const userId = session.user.id;
    [userRecord, enrollments, streak, leaderboardEntries] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.enrollment.findMany({
        where: { userId },
        include: { course: true },
        orderBy: { progressPercent: "desc" },
      }),
      prisma.streak.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } }),
      prisma.leaderboardEntry.findMany({
        where: { period: "all_time" },
        include: { user: true },
        orderBy: { points: "desc" },
      }),
    ]);
    lessonProgressCount = await prisma.lessonProgress.count({ where: { userId, completed: true } });
  } else {
    [totalUsers, totalCourses, totalLessons] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.lesson.count(),
    ]);
  }

  const myRankIndex = leaderboardEntries.findIndex((e) => e.userId === session?.user?.id);
  const myRank = myRankIndex === -1 ? null : myRankIndex + 1;
  const topThree = leaderboardEntries.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];
  const activeEnrollments = enrollments.filter((en) => en.status === "ACTIVE");
  const displayStreak = getEffectiveStreak(
    streak?.currentCount ?? userRecord?.streakDays ?? 0,
    streak?.lastActivityAt
  );

  return (
    <main className={`relative min-h-screen overflow-hidden ${styles.pageBg} px-6 py-8 sm:px-10 lg:px-12`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={styles.orbLeft} />
        <div className={styles.orbRight} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">

        {/* Header */}
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
              FinPath
            </p>
          </div>
          <AuthActions />
        </header>

        {/* ── SIGNED IN ── */}
        {isSignedIn && (
          <>
            {/* Hero */}
            <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-5 shadow-sm backdrop-blur animate-fade-in">
              <div className="max-w-3xl space-y-3">
                <p className={styles.label}>Welcome back, {displayName}</p>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Ready to keep learning?
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Pick up where you left off. Your progress, points, and badges are all here.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Link href="/dashboard" className={styles.heroBtnPrimary}>
                    My dashboard
                  </Link>
                  <Link href="/courses" className={styles.heroBtnSecondary}>
                    Courses
                  </Link>
                  <Link href="/leaderboard" className={styles.heroBtnSecondary}>
                    Leaderboard →
                  </Link>
                </div>
              </div>
            </div>

            {/* Three cards */}
            <section className="grid gap-4 lg:grid-cols-3">
              {/* Summary */}
              <article className={styles.card}>
                <h2 className="text-lg font-semibold text-slate-950">Summary</h2>
                <p className={`mt-2 ${styles.cardBody}`}>Quick view of your progress.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ["Points", userRecord?.points ?? 0],
                    ["Level", userRecord?.level ?? 1],
                    ["Streak", `${displayStreak} days`],
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
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-950">Active courses</h2>
                  <Link href="/courses" className={styles.ctaPrimary}>Browse all →</Link>
                </div>
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

              {/* Leaderboard summary */}
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
                <Link href="/leaderboard" className="mt-4 inline-block text-sm font-medium text-emerald-700">
                  View full leaderboard →
                </Link>
              </article>
            </section>
          </>
        )}

        {/* ── GUEST LANDING PAGE ── */}
        {!isSignedIn && (
          <>
            {/* Hero */}
            <section className="flex flex-col items-center text-center gap-6 py-16">
              <div className="relative w-full flex justify-center mb-4">
                <div className="float-1 absolute left-[10%] top-0 text-4xl">🏆</div>
                <div className="float-2 absolute left-[25%] -top-4 text-3xl">⚡</div>
                <div className="float-3 absolute right-[25%] -top-2 text-3xl">🎯</div>
                <div className="float-4 absolute right-[10%] top-2 text-4xl">🔥</div>
              </div>

              <div className="stagger-1">
                <span className="inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-4">
                  Gamified e-learning
                </span>
              </div>

              <h1 className={`${styles.heroTitle} stagger-2`}>
                Empowering Your{" "}
                <span className="text-emerald-600">Financial Future</span>{" "}
                With FinPath.
              </h1>

              <p className={`${styles.heroSubtitle} stagger-3`}>
                Complete courses, earn badges, build streaks — and actually enjoy learning finance.
              </p>

              <div className="stagger-4">
                <AuthActions />
              </div>

              {/* Stats */}
              <div className="stagger-5 mt-8 flex items-center gap-12">
                {[
                  [totalUsers, "learners"],
                  [totalCourses, "courses"],
                  [totalLessons, "lessons"],
                ].map(([value, label]) => (
                  <div key={String(label)} className="text-center">
                    <p className={styles.statNumber}>{value}+</p>
                    <p className={styles.statLabel}>{label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            <section className="grid gap-5 sm:grid-cols-3">
              {[
                {
                  emoji: "📚",
                  title: "Learn at your own pace",
                  text: "Courses are broken into short focused lessons. Pick up where you left off, anytime.",
                  delay: "stagger-1",
                },
                {
                  emoji: "🏆",
                  title: "Earn badges and rank up",
                  text: "Complete milestones to unlock rare badges. Compete on the leaderboard with other learners.",
                  delay: "stagger-2",
                },
                {
                  emoji: "🔥",
                  title: "Build streaks and level up",
                  text: "Learning every day builds your streak. The longer your streak, the higher your level.",
                  delay: "stagger-3",
                },
              ].map((f) => (
                <article key={f.title} className={`${styles.featureCard} ${f.delay}`}>
                  <span className="text-4xl">{f.emoji}</span>
                  <h2 className="text-lg font-semibold text-slate-950">{f.title}</h2>
                  <p className={styles.cardBody}>{f.text}</p>
                </article>
              ))}
            </section>

            {/* How it works */}
            <section className={`${styles.card} stagger-2`}>
              <h2 className="text-2xl font-semibold text-slate-950 mb-8 text-center">
                How it works
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  ["Sign in", "Create your account with Google in one click. Pick your avatar and set your name.", "1"],
                  ["Enroll in a course", "Browse business and finance courses. Enroll in the ones that match your goals.", "2"],
                  ["Learn and earn", "Complete lessons and challenges to earn points, badges, and climb the leaderboard.", "3"],
                ].map(([title, text, step]) => (
                  <div key={String(step)} className="flex flex-col items-center text-center gap-3">
                    <span className={styles.stepNumber}>{step}</span>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className={styles.cardBody}>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Badge showcase */}
            <section className={`${styles.card} stagger-3`}>
              <h2 className="text-2xl font-semibold text-slate-950 mb-2 text-center">
                Unlock achievements
              </h2>
              <p className={`${styles.cardBody} text-center mb-8`}>
                Every milestone you hit unlocks a badge. Collect them all.
              </p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {[
                  { emoji: "👣", name: "First Step", rarity: "Common", color: "bg-slate-100" },
                  { emoji: "⚡", name: "Speed Learner", rarity: "Uncommon", color: "bg-green-100" },
                  { emoji: "🎓", name: "Course Master", rarity: "Rare", color: "bg-blue-100" },
                  { emoji: "🔥", name: "Week Warrior", rarity: "Epic", color: "bg-violet-100" },
                  { emoji: "👑", name: "Legend", rarity: "Legendary", color: "bg-amber-100" },
                ].map((badge, i) => (
                  <div
                    key={badge.name}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 ${badge.color} float-${(i % 4) + 1}`}
                  >
                    <span className="text-3xl">{badge.emoji}</span>
                    <p className="text-sm font-semibold text-slate-900">{badge.name}</p>
                    <p className={styles.label}>{badge.rarity}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA banner */}
            <section className="rounded-[2rem] bg-emerald-600 px-8 py-12 text-center text-white stagger-4">
              <h2 className="text-3xl font-bold mb-3">Ready to start your journey?</h2>
              <p className="text-emerald-100 mb-8 text-lg">
                Join learners already mastering business and finance on FinPath.
              </p>
              <div className="flex justify-center">
                <div className="pulse-glow rounded-full">
                  <AuthActions />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}