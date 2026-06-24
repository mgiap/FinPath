// src/app/(main)/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { styles } from "@/lib/styles";
import AuthActions from "@/components/auth-actions";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/"); // protect all (main) pages

  return (
    <div className={styles.pageBg}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={styles.orbLeft} />
        <div className={styles.orbRight} />
      </div>
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm font-bold tracking-widest text-emerald-700 uppercase">
              FinPath
            </Link>
            <div className="flex items-center gap-5 text-sm text-slate-600">
              <Link href="/courses" className="hover:text-slate-900">Courses</Link>
              <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
              <Link href="/leaderboard" className="hover:text-slate-900">Leaderboard</Link>
            </div>
          </div>
          <AuthActions />
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}