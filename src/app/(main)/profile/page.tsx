// src/app/(main)/profile/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import ProfileForm from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");
  const userId = session.user.id;

  const [user, unlockedBadges] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: "desc" },
    }),
  ]);

  if (!user) redirect("/");

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8">
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.pageSubtitle}>Customize how you appear to others.</p>
      </div>
      <ProfileForm
        initialName={user.name ?? ""}
        initialAvatarId={user.avatarId}
        initialFeaturedBadgeId={user.featuredBadgeId}
        unlockedBadges={unlockedBadges.map((ub) => ({
          id: ub.badge.id,
          name: ub.badge.name,
          icon: ub.badge.icon,
          rarity: ub.badge.rarity,
        }))}
      />
    </div>
  );
}