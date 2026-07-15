// src/app/not-found.tsx
import Link from "next/link";
import { styles } from "@/lib/styles";

export default function NotFound() {
  return (
    <main className={`relative min-h-screen overflow-hidden ${styles.pageBg} flex items-center justify-center px-6`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={styles.orbLeft} />
        <div className={styles.orbRight} />
      </div>

      <div className="flex flex-col items-center text-center gap-6 max-w-lg">
        {/* Floating emojis */}
        <div className="relative w-full flex justify-center h-24">
          <div className="float-1 absolute left-[10%] text-5xl">📚</div>
          <div className="float-2 absolute left-[30%] text-4xl">🏆</div>
          <div className="float-3 absolute right-[30%] text-4xl">🔥</div>
          <div className="float-4 absolute right-[10%] text-5xl">⚡</div>
        </div>

        {/* 404 */}
        <div className="stagger-1">
          <p className="text-9xl font-bold text-emerald-600 leading-none">404</p>
        </div>

        <div className="stagger-2 space-y-3">
          <h1 className="text-2xl font-semibold text-slate-950">
            You found a path no one has tried before.
          </h1>
          <p className={styles.cardBody}>
            Unfortunately, it doesn't exist. Even the boldest explorers hit a dead end sometimes — head back and keep learning!
          </p>
        </div>

        {/* CTAs */}
        <div className="stagger-4 flex items-center gap-3">
          <Link href="/" className={styles.heroBtnPrimary}>
            Back to home
          </Link>
          <Link href="/courses" className={styles.heroBtnSecondary}>
            Browse courses →
          </Link>
        </div>
      </div>
    </main>
  );
}