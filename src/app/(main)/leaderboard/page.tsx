// src/app/(main)/leaderboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import Link from "next/link";
import { getAvatar } from "@/lib/avatars";
import BadgeIcon from "@/components/badge-icon";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const activePeriod = period === "last_7_days" ? "last_7_days" : "all_time";

  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const entries = await prisma.leaderboardEntry.findMany({
    where: { period: activePeriod },
    include: {
      user: {
        include: {
          userBadges: {
            include: { badge: true },
          },
        },
      },
    },
    orderBy: { points: "desc" },
    take: 20,
  });

  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));
  const myEntry = ranked.find((e) => e.userId === userId);

  const medals: Record<number, string> = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8">
        <h1 className={styles.pageTitle}>Leaderboard</h1>
        <p className={styles.pageSubtitle}>
          See how you rank against other learners on FinPath.
        </p>
      </div>

      {/* Your rank card */}
      {myEntry && (
        <div className={`mb-6 ${styles.completeBanner}`}>
          <div>
            <p className={styles.completeBannerTitle}>Your current rank</p>
            <p className={styles.completeBannerSubtitle}>
              #{myEntry.rank} with {myEntry.points} points —{" "}
              {activePeriod === "last_7_days" ? "last 7 days" : "all time"}
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">#{myEntry.rank}</p>
        </div>
      )}

      {/* Period tabs */}
      <div className="mt-4 mb-4 flex items-center gap-2">
        <Link
          href="/leaderboard?period=all_time"
          className={activePeriod === "all_time" ? styles.tabActive : styles.tabInactive}
        >
          All time
        </Link>
        <Link
          href="/leaderboard?period=last_7_days"
          className={activePeriod === "last_7_days" ? styles.tabActive : styles.tabInactive}
        >
          Last 7 days
        </Link>
      </div>

      {/* Leaderboard list */}
      <div className={`mt-4 ${styles.card}`}>
        <div className="space-y-3">
          {ranked.length === 0 && (
            <p className={styles.label}>No entries yet.</p>
          )}
          {ranked.map((entry) => {
            const isMe = entry.userId === userId;
            const isTop3 = entry.rank <= 3;
            const avatar = getAvatar(entry.user.avatarId);
            const featuredBadge = entry.user.userBadges.find(
              (ub) => ub.badgeId === entry.user.featuredBadgeId
            )?.badge ?? null;

            return (
              <div
                key={entry.id}
                className={isMe ? styles.leaderboardRowHighlight : styles.leaderboardRow}
              >
                {/* Rank */}
                <span className={isTop3 ? styles.leaderboardRankTop : styles.leaderboardRank}>
                  {medals[entry.rank] ?? `#${entry.rank}`}
                </span>

                {/* Avatar */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatar.gradient} text-lg`}
                >
                  {avatar.emoji}
                </div>

                {/* Name + featured badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`${styles.cardTitle} ${isMe ? "text-emerald-800" : ""}`}>
                      {entry.user.name ?? "Anonymous"}
                      {isMe && (
                        <span className="text-xs font-normal text-emerald-600 ml-1">(you)</span>
                      )}
                    </p>
                    {featuredBadge && (
                      <span className={`${styles.badgeBase} bg-emerald-100 text-emerald-700`}>
                        {featuredBadge.icon && <span className="mr-1">{featuredBadge.icon}</span>}
                        {featuredBadge.name}
                      </span>
                    )}
                  </div>
                  <p className={styles.label}>Level {entry.user.level}</p>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-semibold text-slate-900">{entry.points}</p>
                  <p className={styles.label}>points</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}