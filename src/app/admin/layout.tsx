// src/app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { styles } from "@/lib/styles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/");

  return (
    <div className={styles.pageBg}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={styles.orbLeft} />
        <div className={styles.orbRight} />
      </div>

      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-sm font-bold tracking-widest text-emerald-700 uppercase">
              FinPath Admin
            </Link>
            <div className="flex items-center gap-5 text-sm text-slate-600">
              <Link href="/admin/courses" className="hover:text-slate-900">Courses</Link>
              <Link href="/admin/badges" className="hover:text-slate-900">Badges</Link>
              <Link href="/admin/users" className="hover:text-slate-900">Users</Link>
            </div>
          </div>
          <Link href="/" className={styles.label}>← Back to app</Link>
        </div>
      </nav>

      <main className="flex-1 animate-fade-in">
        {children}
      </main>
    </div>
  );
}