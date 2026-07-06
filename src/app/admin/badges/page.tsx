// src/app/admin/badges/page.tsx
import { prisma } from "@/lib/prisma";
import { styles } from "@/lib/styles";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BadgeRarity } from "@prisma/client";

async function createBadge(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const code = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const rarity = formData.get("rarity") as BadgeRarity;
  const pointsReward = Number(formData.get("pointsReward"));
  const icon = formData.get("icon") as string;
  const triggerType = formData.get("triggerType") as string;
  const triggerValue = formData.get("triggerValue") ? Number(formData.get("triggerValue")) : null;
  const courseId = formData.get("courseId") as string;

  await prisma.badge.create({
    data: {
      name,
      description,
      code,
      rarity,
      pointsReward,
      icon: icon || null,
      triggerType: triggerType || null,
      triggerValue,
      courseId: triggerType === "complete_course" ? courseId || null : null,
    },
  });

  redirect("/admin/badges");
}

async function deleteBadge(badgeId: string) {
  "use server";
  await prisma.badge.delete({ where: { id: badgeId } });
  redirect("/admin/badges");
}

async function updateBadge(badgeId: string, formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const rarity = formData.get("rarity") as BadgeRarity;
  const pointsReward = Number(formData.get("pointsReward"));
  const icon = formData.get("icon") as string;
  const triggerType = formData.get("triggerType") as string;
  const triggerValue = formData.get("triggerValue") ? Number(formData.get("triggerValue")) : null;
  const courseId = formData.get("courseId") as string;

  await prisma.badge.update({
    where: { id: badgeId },
    data: {
      name,
      description,
      rarity,
      pointsReward,
      icon: icon || null,
      triggerType: triggerType || null,
      triggerValue,
      courseId: triggerType === "complete_course" ? courseId || null : null,
    },
  });

  redirect("/admin/badges");
}

const rarityColors: Record<string, string> = {
  COMMON: "bg-slate-100 text-slate-600",
  UNCOMMON: "bg-green-100 text-green-700",
  RARE: "bg-blue-100 text-blue-700",
  EPIC: "bg-violet-100 text-violet-700",
  LEGENDARY: "bg-amber-100 text-amber-700",
};

const triggerLabels: Record<string, string> = {
  complete_course: "Complete a course",
  streak: "Reach X-day streak",
  level: "Reach level X",
  lessons_count: "Complete X lessons",
};

function TriggerFields({ defaultTriggerType, defaultTriggerValue, defaultCourseId, courses }: {
  defaultTriggerType?: string | null;
  defaultTriggerValue?: number | null;
  defaultCourseId?: string | null;
  courses: { id: string; title: string }[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className={styles.formLabel}>Trigger type</label>
        <select name="triggerType" defaultValue={defaultTriggerType ?? ""} className={styles.formSelect}>
          <option value="">No trigger (manual only)</option>
          <option value="complete_course">Complete a course</option>
          <option value="streak">Reach X-day streak</option>
          <option value="level">Reach level X</option>
          <option value="lessons_count">Complete X lessons total</option>
        </select>
      </div>

      <div>
        <label className={styles.formLabel}>Trigger value (X)</label>
        <input
          name="triggerValue"
          type="number"
          defaultValue={defaultTriggerValue ?? ""}
          className={styles.formInput}
          placeholder="e.g. 7 for 7-day streak, 2 for level 2"
        />
        <p className={`mt-1 ${styles.label}`}>Leave blank for complete_course trigger</p>
      </div>

      <div>
        <label className={styles.formLabel}>Course (only for complete_course trigger)</label>
        <select name="courseId" defaultValue={defaultCourseId ?? ""} className={styles.formSelect}>
          <option value="">— select course —</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default async function AdminBadgesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const [badges, courses] = await Promise.all([
    prisma.badge.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { userBadges: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className={styles.pageWrapper}>
      <div className="mb-8">
        <h1 className={styles.pageTitle}>Badges</h1>
        <p className={styles.pageSubtitle}>{badges.length} badges total.</p>
      </div>

      {/* Existing badges */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>All badges</h2>
        <div className="space-y-3 mt-4">
          {badges.length === 0 && (
            <p className={styles.label}>No badges yet.</p>
          )}
          {badges.map((badge) => {
            const deleteBadgeWithId = deleteBadge.bind(null, badge.id);
            const updateBadgeWithId = updateBadge.bind(null, badge.id);

            return (
              <details key={badge.id} className="rounded-2xl border border-slate-200 p-4">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg">
                      {badge.icon ?? badge.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{badge.name}</p>
                        <span className={`${styles.badgeBase} ${rarityColors[badge.rarity]}`}>
                          {badge.rarity.toLowerCase()}
                        </span>
                        {badge.triggerType && (
                          <span className={`${styles.badgeBase} bg-sky-100 text-sky-700`}>
                            {triggerLabels[badge.triggerType] ?? badge.triggerType}
                            {badge.triggerValue ? ` (${badge.triggerValue})` : ""}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${styles.label}`}>
                        {badge._count.userBadges} users earned · {badge.pointsReward} pts reward
                        {badge.course && ` · ${badge.course.title}`}
                      </p>
                    </div>
                  </div>
                  <form action={deleteBadgeWithId}>
                    <button
                      type="submit"
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                </summary>

                <form action={updateBadgeWithId} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={styles.formLabel}>Name</label>
                      <input name="name" defaultValue={badge.name} required className={styles.formInput} />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Icon (emoji)</label>
                      <input name="icon" defaultValue={badge.icon ?? ""} className={styles.formInput} placeholder="e.g. 🏆" />
                    </div>
                  </div>
                  <div>
                    <label className={styles.formLabel}>Description</label>
                    <input name="description" defaultValue={badge.description} required className={styles.formInput} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={styles.formLabel}>Rarity</label>
                      <select name="rarity" defaultValue={badge.rarity} className={styles.formSelect}>
                        <option value="COMMON">Common</option>
                        <option value="UNCOMMON">Uncommon</option>
                        <option value="RARE">Rare</option>
                        <option value="EPIC">Epic</option>
                        <option value="LEGENDARY">Legendary</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.formLabel}>Points reward</label>
                      <input name="pointsReward" type="number" defaultValue={badge.pointsReward} className={styles.formInput} />
                    </div>
                  </div>
                  <TriggerFields
                    defaultTriggerType={badge.triggerType}
                    defaultTriggerValue={badge.triggerValue}
                    defaultCourseId={badge.courseId}
                    courses={courses}
                  />
                  <button type="submit" className={styles.ctaPrimary}>Save badge</button>
                </form>
              </details>
            );
          })}
        </div>
      </div>

      {/* Create badge */}
      <div className={`mt-6 ${styles.card}`}>
        <h2 className={styles.sectionTitle}>Create badge</h2>
        <form action={createBadge} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={styles.formLabel}>Name</label>
              <input name="name" required className={styles.formInput} placeholder="e.g. Speed Learner" />
            </div>
            <div>
              <label className={styles.formLabel}>Icon (emoji)</label>
              <input name="icon" className={styles.formInput} placeholder="e.g. ⚡" />
            </div>
          </div>
          <div>
            <label className={styles.formLabel}>Description</label>
            <input name="description" required className={styles.formInput} placeholder="What did the user do to earn this?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={styles.formLabel}>Rarity</label>
              <select name="rarity" className={styles.formSelect}>
                <option value="COMMON">Common</option>
                <option value="UNCOMMON">Uncommon</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
              </select>
            </div>
            <div>
              <label className={styles.formLabel}>Points reward</label>
              <input name="pointsReward" type="number" defaultValue={10} className={styles.formInput} />
            </div>
          </div>
          <TriggerFields courses={courses} />
          <button type="submit" className={styles.enrollBtn}>Create badge</button>
        </form>
      </div>
    </div>
  );
}