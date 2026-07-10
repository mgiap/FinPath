// src/app/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAvatar } from "@/lib/avatars";

async function resetUser(userId: string) {
  "use server";
  await prisma.lessonProgress.deleteMany({ where: { userId } });
  await prisma.userBadge.deleteMany({ where: { userId } });
  await prisma.enrollment.updateMany({
    where: { userId },
    data: { progressPercent: 0, status: "ACTIVE", completedAt: null },
  });
  await prisma.leaderboardEntry.updateMany({
    where: { userId },
    data: { points: 0 },
  });
  await prisma.streak.updateMany({
    where: { userId },
    data: { currentCount: 0, longestCount: 0, lastActivityAt: null },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { points: 0, level: 1, streakDays: 0 },
  });
  redirect("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { points: "desc" },
    include: {
      _count: {
        select: {
          enrollments: true,
          lessonProgress: true,
          userBadges: true,
        },
      },
      streaks: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });

  const roleColors: Record<string, string> = {
    ADMIN: "bg-violet-100 text-violet-700",
    LEARNER: "bg-slate-100 text-slate-600",
    INSTRUCTOR: "bg-sky-100 text-sky-700",
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8">
        <h1 className={styles.pageTitle}>Users</h1>
        <p className={styles.pageSubtitle}>{users.length} users total.</p>
      </div>

      <div className={styles.card}>
        <div className="space-y-3">
          {users.map((user, i) => {
            const resetUserWithId = resetUser.bind(null, user.id);
            const initials = user.name
              ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
              : "?";

            return (
              <div key={user.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                {/* Rank */}
                <span className="text-sm font-semibold text-slate-400 w-6 shrink-0">
                  #{i + 1}
                </span>

                {/* Avatar */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatar(user.avatarId).gradient} text-lg`}>
                  {getAvatar(user.avatarId).emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={styles.cardTitle}>{user.name ?? "Anonymous"}</p>
                    <span className={`${styles.badgeBase} ${roleColors[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                  <p className={`text-xs ${styles.label}`}>{user.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs ${styles.label}`}>
                      {user.points} pts
                    </span>
                    <span className={`text-xs ${styles.label}`}>
                      Level {user.level}
                    </span>
                    <span className={`text-xs ${styles.label}`}>
                      {user._count.enrollments} courses
                    </span>
                    <span className={`text-xs ${styles.label}`}>
                      {user._count.lessonProgress} lessons
                    </span>
                    <span className={`text-xs ${styles.label}`}>
                      {user._count.userBadges} badges
                    </span>
                    <span className={`text-xs ${styles.label}`}>
                      🔥 {user.streaks[0]?.currentCount ?? 0} day streak
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <form action={resetUserWithId}>
                  <button
                    type="submit"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Reset progress
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}