"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthActions() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button
        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        onClick={() => signIn("google")}
      >
        Sign in
      </button>
    );
  }

  return (
    <button
      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      onClick={() => signOut()}
    >
      Sign out
    </button>
  );
}
