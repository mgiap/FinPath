import Link from "next/link";

const activeCourses = [
  {
    title: "Foundations of Financial Literacy",
    progress: 72,
    lessons: "8 lessons",
    badge: "Level 3",
  },
  {
    title: "Business Planning Essentials",
    progress: 44,
    lessons: "6 lessons",
    badge: "Streak 14",
  },
  {
    title: "Marketing Metrics and Analytics",
    progress: 18,
    lessons: "9 lessons",
    badge: "New badge",
  },
];

const leaderboard = [
  { name: "Maya", points: 2840 },
  { name: "Noah", points: 2675 },
  { name: "FinPath learner", points: 2480 },
  { name: "Lena", points: 2310 },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.9))] px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
              FinPath dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Keep the learner journey visible.
            </h1>
          </div>
          <div className="flex gap-3 text-sm font-medium">
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/api/auth/signin"
              className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800"
            >
              Sign in
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-4">
          {[
            ["2,480", "Total points"],
            ["14", "Day streak"],
            ["07", "Current level"],
            ["08", "Badges unlocked"],
          ].map(([value, label]) => (
            <article
              key={label}
              className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur"
            >
              <p className="text-3xl font-semibold text-slate-950">{value}</p>
              <p className="mt-1 text-sm text-slate-600">{label}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Active courses
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Continue where the learner left off.
                </h2>
              </div>
              <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
                Add course
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {activeCourses.map((course) => (
                <article key={course.title} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-950">{course.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{course.lessons}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {course.badge}
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-xs font-medium text-slate-500">
                    {course.progress}% complete
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Weekly goal
              </p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-semibold">68%</p>
                  <p className="mt-2 text-sm text-slate-300">4 lessons completed this week</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Rank</p>
                  <p className="text-2xl font-semibold text-amber-300">#12</p>
                </div>
              </div>
              <div className="mt-5 h-3 rounded-full bg-white/10">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Leaderboard
              </p>
              <div className="mt-5 space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{entry.name}</p>
                        <p className="text-xs text-slate-500">Top monthly performers</p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-950">{entry.points}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}