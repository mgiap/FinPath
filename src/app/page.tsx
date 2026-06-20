import Link from "next/link";

const features = [
  {
    title: "Course journeys",
    description: "Organize business and finance content into courses, modules, and lessons.",
  },
  {
    title: "Progress signals",
    description: "Track points, levels, streaks, and completion bars to keep momentum visible.",
  },
  {
    title: "Recognition loops",
    description: "Reward activity with badges, leaderboards, and milestone unlocks.",
  },
  {
    title: "Thesis-friendly structure",
    description: "Keep the codebase easy to analyze, document, and extend during development.",
  },
];

const learningFlow = [
  { step: "01", title: "Discover", text: "Browse finance themes and pick a learning path." },
  { step: "02", title: "Practice", text: "Complete lessons, checkpoints, and reflective activities." },
  { step: "03", title: "Progress", text: "Earn points, badges, and visible status updates." },
  { step: "04", title: "Master", text: "Return to strengthen streaks and unlock advanced modules." },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12%] top-[-10%] h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute right-[-8%] top-24 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute bottom-[-18%] left-1/3 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-black/10 bg-white/70 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
              FinPath
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Gamified e-learning for business and finance education.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Dashboard
            </Link>
            <Link
              href="/api/auth/signin"
              className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800"
            >
              Sign in
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Thesis scaffold in progress
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Build a finance learning platform that makes progress feel tangible.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                FinPath is structured around courses, modules, and lessons, with points,
                badges, streaks, levels, and leaderboards to support engagement and make
                the teaching case easy to document.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500"
              >
                Open learning dashboard
              </Link>
              <a
                href="#curriculum"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                View scaffold overview
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["12", "planned lesson slots"],
                ["5", "gamification systems"],
                ["1", "teaching case thesis"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-3xl font-semibold text-slate-950">{value}</p>
                  <p className="mt-1 text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">Learning streak</p>
                <p className="text-3xl font-semibold">14 days</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Level</p>
                <p className="text-2xl font-semibold text-emerald-300">07</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Weekly progress</span>
                <span>68%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-slate-400">Points</p>
                  <p className="mt-1 text-lg font-semibold">2,480</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-slate-400">Badges</p>
                  <p className="mt-1 text-lg font-semibold">08 unlocked</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["Course completion", "75%", "bg-emerald-400"],
                ["Module mastery", "52%", "bg-sky-400"],
                ["Leaderboard rank", "#12", "bg-amber-400"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className={`h-full w-[62%] rounded-full ${color}`} />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="curriculum" className="grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[1.75rem] border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur"
            >
              <h2 className="text-lg font-semibold text-slate-950">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 pb-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Learning loop
            </p>
            <div className="mt-6 space-y-4">
              {learningFlow.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Stack scaffold
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Next.js", "App Router + TypeScript"],
                ["Prisma", "PostgreSQL schema + client"],
                ["NextAuth.js", "Session and user scaffolding"],
                ["Tailwind CSS", "Utility-first UI system"],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-emerald-300">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
