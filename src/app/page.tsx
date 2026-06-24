import { getServerSession } from "next-auth";

import AuthActions from "@/components/auth-actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Enrollment, UserBadge, Streak, LeaderboardEntry, User, Badge } from "@prisma/client";

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

// Signed-in sections are rendered from real data; keep guest sections above for previews.

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session);
  const displayName = session?.user?.name ?? "Learner";

  let enrollments: Enrollment[] = [];
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
              FinPath
            </p>
          </div>
          <div>
            <AuthActions />
          </div>
        </header>

        <div className="rounded-[2rem] border border-black/10 bg-white/75 px-6 py-5 shadow-sm backdrop-blur">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-medium text-slate-500">
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

        <section className="grid gap-4 lg:grid-cols-3">
          {!isSignedIn &&
            guestSections.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur"
              >
                <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}

          {isSignedIn && (
            <>
              <article className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-slate-950">Summary</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Quick view of your progress.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-xs text-slate-500">Points</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{userRecord?.points ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-xs text-slate-500">Level</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{userRecord?.level ?? 1}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-xs text-slate-500">Streak</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{streak?.currentCount ?? userRecord?.streakDays ?? 0} days</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-xs text-slate-500">Rank</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{leaderboardEntry?.rank ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-xs text-slate-500">Lessons Completed</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{lessonProgressCount}</p>
                  </div>
                </div>
              </article>

              <article className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-slate-950">Active courses</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Courses you are enrolled in.</p>
                <div className="mt-4 space-y-3">
                  {enrollments.length === 0 && <p className="text-sm text-slate-500">No active enrollments yet.</p>}
                  {enrollments.map((en) => (
                    <div key={en.id} className="rounded-2xl border border-slate-200 p-3">
                      <p className="font-medium text-slate-900">{en.course.title}</p>
                      <p className="text-xs text-slate-500">{en.course.description}</p>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${en.progressPercent}%` }} />
                      </div>
                      <p className="mt-1 text-right text-xs text-slate-500">{en.progressPercent}% complete</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-slate-950">Recent badges</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Badges you have unlocked recently.</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {recentBadges.length === 0 && <p className="text-sm text-slate-500">No badges yet.</p>}
                  {recentBadges.map((ub) => (
                    <div key={ub.id} className="rounded-2xl border border-slate-200 p-3 text-center">
                      <div className="mx-auto h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">{ub.badge?.icon ? <img src={ub.badge.icon} alt={ub.badge.name} /> : ub.badge?.name?.[0]}</div>
                      <p className="mt-2 text-sm font-medium text-slate-900">{ub.badge?.name}</p>
                      <p className="text-xs text-slate-500">{ub.unlockedAt ? new Date(ub.unlockedAt).toLocaleDateString() : ""}</p>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}
        </section>

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

          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
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
                <article key={title} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
