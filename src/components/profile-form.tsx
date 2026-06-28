// src/components/profile-form.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { styles, difficultyBadge } from "@/lib/styles";
import { PRESET_AVATARS } from "@/lib/avatars";

type Badge = { id: string; name: string; icon: string | null; rarity: string };

const rarityBadgeClass: Record<string, string> = {
  COMMON: "bg-slate-100 text-slate-600",
  UNCOMMON: "bg-emerald-100 text-emerald-800",
  RARE: "bg-sky-100 text-sky-800",
  EPIC: "bg-violet-100 text-violet-800",
  LEGENDARY: "bg-amber-100 text-amber-800",
};

export default function ProfileForm({
  initialName,
  initialAvatarId,
  initialFeaturedBadgeId,
  unlockedBadges,
}: {
  initialName: string;
  initialAvatarId: string | null;
  initialFeaturedBadgeId: string | null;
  unlockedBadges: Badge[];
}) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [name, setName] = useState(initialName);
  const [avatarId, setAvatarId] = useState(initialAvatarId);
  const [featuredBadgeId, setFeaturedBadgeId] = useState(initialFeaturedBadgeId);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarId, featuredBadgeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setMessage("Saved!");
        await updateSession(); // refresh JWT/session so navbar avatar updates immediately
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`${styles.card} max-w-2xl`}>
      <div className="mb-6">
        <label className={styles.label}>Display name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          maxLength={30}
        />
      </div>

      <div className="mb-6">
        <label className={styles.label}>Avatar</label>
        <div className="mt-2 grid grid-cols-5 gap-3">
          {PRESET_AVATARS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAvatarId(a.id)}
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${a.gradient} text-2xl transition ${
                avatarId === a.id ? "ring-2 ring-emerald-500 ring-offset-2" : ""
              }`}
            >
              {a.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className={styles.label}>Featured badge</label>
        {unlockedBadges.length === 0 ? (
          <p className={`mt-1 ${styles.label}`}>Unlock a badge first to feature it here.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFeaturedBadgeId(null)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                featuredBadgeId === null ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
              }`}
            >
              None
            </button>
            {unlockedBadges.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setFeaturedBadgeId(b.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
                  featuredBadgeId === b.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                }`}
              >
                {b.icon ? <img src={b.icon} alt="" className="h-4 w-4" /> : null}
                {b.name}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${rarityBadgeClass[b.rarity] ?? "bg-slate-100 text-slate-600"}`}>
                  {b.rarity.toLowerCase()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className={styles.ctaPrimary}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {message && <span className="text-sm text-emerald-600">{message}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}