// src/app/page.tsx
import { getServerSession } from "next-auth";

import AuthActions from "@/components/auth-actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import Link from "next/link";

import type { Enrollment, UserBadge, Streak, LeaderboardEntry, User, Badge, Course } from "@prisma/client";

const guestSections = [
  {
    title: "See the learning structure",
    text: "Courses, modules, and lessons will be organized into a clean progression.",
  },
  {
    title: "Understand the feedback loop",
    text: "Points, streaks, and badges will show progress without clutter.",
  },
  {
    title: "Keep the thesis readable",
    text: "The layout stays simple so the project is easy to explain and extend.",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session);
  const displayName = session?.user?.name ?? "Learner";

  let enrollments: (Enrollment & { course: Course })[] = [];
  let recentBadges: (UserBadge & { badge: Badge | null })[] = [];
  let lessonProgressCount = 0;
  let streak: Streak | null = null;
  let leaderboardEntry: LeaderboardEntry | null = null;
  let userRecord: User | null = null;

  if (isSignedIn && session?.user?.id) {
    const userId = session.user.id;

    userRecord = await prisma.user.findUnique({ where: { id: userId } });

    enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { enrolledAt: "desc" },
    });

    lessonProgressCount = await prisma.lessonProgress.count({ where: { userId, completed: true } });

    recentBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: "desc" },
      take: 6,
    });

    streak = await prisma.streak.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } });

    leaderboardEntry = await prisma.leaderboardEntry.findFirst({ where: { userId, period: "all_time" } });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_24%),linear-gradient(180deg,_#f8fafc,_#eef6f1)] px-6 py-8 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-8%] h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute right-[-8%] top-20 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
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
              {isSignedIn ? `Signed in as ${displayName}` : "Guest preview"}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {isSignedIn
                ? "Your learning space is ready."
                : "A simple finance learning space, ready for guests and learners."}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {isSignedIn
                ? "This version keeps the layout minimal and role-aware so the next step can focus on progress, content, and feedback instead of navigation."
                : "Guests can preview the structure first. Signed-in learners will see the same core layout with personalized progress state later."}
            </p>
          </div>
        </div>

        {/* Cards row */}
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
                <p className={`mt-3 ${styles.cardBody}`}>Quick view of your progress.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ["Points", userRecord?.points ?? 0],
                    ["Level", userRecord?.level ?? 1],
                    ["Streak", `${streak?.currentCount ?? userRecord?.streakDays ?? 0} days`],
                    ["Rank", leaderboardEntry?.rank ?? "—"],
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
                <p className={`mt-3 ${styles.cardBody}`}>Courses you are enrolled in.</p>
                <div className="mt-4 space-y-3">
                  {enrollments.length === 0 && (
                    <p className={`text-sm ${styles.label}`}>No active enrollments yet.</p>
                  )}
                  {enrollments.map((en) => (
                    <Link key={en.id} href={`/courses/${en.course.slug}`} className={`block ${styles.cardInner} hover:border-emerald-200 transition-colors`}>
                      <p className={styles.cardTitle}>{en.course.title}</p>
                      <p className={`text-xs mt-0.5 ${styles.label}`}>{en.course.description}</p>
                      <div className={`mt-2 ${styles.progressTrack}`}>
                        <div className={styles.progressFill} style={{ width: `${en.progressPercent}%` }} />
                      </div>
                      <p className={`mt-1 text-right text-xs ${styles.label}`}>{en.progressPercent}% complete</p>
                    </Link>
                  ))}
                </div>
              </article>

              {/* Recent badges */}
              <article className={styles.card}>
                <h2 className="text-lg font-semibold text-slate-950">Recent badges</h2>
                <p className={`mt-3 ${styles.cardBody}`}>Badges you have unlocked recently.</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {recentBadges.length === 0 && (
                    <p className={`text-sm ${styles.label}`}>No badges yet.</p>
                  )}
                  {recentBadges.map((ub) => (
                    <div key={ub.id} className="rounded-2xl border border-slate-200 p-3 text-center">
                      <div className="mx-auto h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                        {ub.badge?.icon
                          ? <img src={ub.badge.icon} alt={ub.badge.name ?? ""} />
                          : ub.badge?.name?.[0]}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">{ub.badge?.name}</p>
                      <p className={`text-xs ${styles.label}`}>
                        {ub.unlockedAt ? new Date(ub.unlockedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}
        </section>

        {/* Bottom row */}
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Role view
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Current state</p>
                <p className="mt-1 text-2xl font-semibold">
                  {isSignedIn ? "Signed-in learner" : "Guest preview"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Next focus</p>
                <p className="mt-2 text-base leading-7 text-slate-200">
                  {isSignedIn
                    ? "Surface progress cards, current lesson, and streak status in the next pass."
                    : "Keep the preview clean, with just enough structure to explain the product."}
                </p>
              </div>
            </div>
          </aside>

          <div className={`rounded-[2rem] border border-slate-200 ${styles.card}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Simple layout first
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["One shared page", "Guest and learner states stay on the same screen."],
                ["No route buttons", "Navigation will come later when the flows are ready."],
                ["Readable sections", "Each block is easy to expand into real content."],
                ["Role-aware copy", "The page can adapt to session data without extra chrome."],
              ].map(([title, text]) => (
                <article key={title} className={styles.cardInner}>
                  <h3 className={styles.cardTitle}>{title}</h3>
                  <p className={`mt-2 ${styles.cardBody}`}>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}