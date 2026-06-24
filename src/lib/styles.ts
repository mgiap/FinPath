// src/lib/styles.ts

export const styles = {
  // Layout
  pageWrapper: "mx-auto max-w-7xl px-6 py-10 sm:px-10",
  section: "mx-auto max-w-7xl px-6 sm:px-10",

  // Cards
  card: "rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur",
  cardHover: "rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:shadow-md hover:-translate-y-0.5",
  cardInner: "rounded-2xl border border-slate-200 p-3",

  // Badges
  badgeBeginner: "bg-emerald-100 text-emerald-800",
  badgeIntermediate: "bg-sky-100 text-sky-800",
  badgeAdvanced: "bg-violet-100 text-violet-800",
  badgeBase: "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",

  // Progress bar
  progressTrack: "h-1.5 w-full rounded-full bg-slate-100",
  progressFill: "h-full rounded-full bg-emerald-400 transition-all",

  // Typography
  pageTitle: "text-3xl font-semibold tracking-tight text-slate-950",
  pageSubtitle: "mt-2 text-slate-500",
  cardTitle: "text-base font-semibold text-slate-900 leading-snug",
  cardBody: "text-sm leading-6 text-slate-500",
  label: "text-xs text-slate-400",

  // Buttons / CTAs
  ctaPrimary: "inline-block rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700",
  ctaGhost: "rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50",

  // Empty state
  emptyState: "rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500",

  // Nav
  navLink: "text-sm text-slate-600 hover:text-slate-900 transition-colors",
  navLinkActive: "text-sm font-medium text-emerald-700",

  // add inside your styles object
  pageBg: "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_24%),linear-gradient(180deg,_#f8fafc,_#eef6f1)]",
  orbLeft: "absolute left-[-10%] top-[-8%] h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl",
  orbRight: "absolute right-[-8%] top-20 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl",

  // Module header
  moduleNumber: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700",

  // Lesson row states
  lessonRowDone: "flex items-center gap-3 rounded-2xl border p-3 transition-colors border-emerald-200 bg-emerald-50",
  lessonRowLocked: "flex items-center gap-3 rounded-2xl border p-3 transition-colors border-slate-100 bg-slate-50 opacity-60",
  lessonRowDefault: "flex items-center gap-3 rounded-2xl border p-3 transition-colors border-slate-200 bg-white hover:border-emerald-200",

  // Lesson status dot
  lessonDotDone: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium bg-emerald-500 text-white",
  lessonDotDefault: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium bg-slate-100 text-slate-500",

  // Enroll button
  enrollBtn: "rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors",

  // Progress card
  progressCard: "rounded-2xl border border-slate-200 bg-white p-4 text-center min-w-[140px]",

  // Badges
  badgeSuccess: "bg-emerald-100 text-emerald-800",
  badgeNeutral: "bg-slate-100 text-slate-600",

  // Lesson complete banner
  completeBanner: "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between",
  completeBannerTitle: "text-sm font-medium text-emerald-800",
  completeBannerSubtitle: "text-xs text-emerald-600 mt-0.5",
  completeBannerBtn: "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors",

  // Sidebar
  sidebarLabel: "text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3",
  sidebarLinkActive: "flex items-center gap-3 rounded-2xl border p-3 text-sm border-emerald-200 bg-emerald-50 text-emerald-800 font-medium",
  sidebarLinkInactive: "flex items-center gap-3 rounded-2xl border p-3 text-sm border-slate-200 bg-white text-slate-600 hover:border-emerald-200 transition-colors",
  sidebarDot: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs",

} as const;

export const difficultyBadge: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-800",
  intermediate: "bg-sky-100 text-sky-800",
  advanced: "bg-violet-100 text-violet-800",
};