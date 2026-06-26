// src/components/auth-actions.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { ChevronDown, UserRound, LogOut } from "lucide-react";
import { getAvatar } from "@/lib/avatars";

export default function AuthActions() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

  const avatar = getAvatar(session.user.avatarId);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100"
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${avatar.gradient} text-lg ring-2 ring-white shadow-sm`}
        >
          {avatar.emoji}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-150 ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 px-2 pb-3 pt-1">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatar.gradient} text-xl ring-2 ring-white shadow-sm`}
          >
            {avatar.emoji}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {session.user.name ?? "Learner"}
            </p>
            {session.user.featuredBadgeName ? (
              <p className="mt-0.5 inline-flex items-center gap-1 truncate text-xs font-medium text-emerald-700">
                {session.user.featuredBadgeIcon && (
                  <img src={session.user.featuredBadgeIcon} alt="" className="h-3.5 w-3.5" />
                )}
                {session.user.featuredBadgeName}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-400">No featured badge</p>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <Link
          href="/profile"
          onClick={() => setOpen(false)}
          className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          <UserRound size={16} className="text-slate-400" />
          Profile
        </Link>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut size={16} className="text-slate-400" />
          Sign out
        </button>
      </div>
    </div>
  );
}