// src/app/api/user/profile/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRESET_AVATARS } from "@/lib/avatars";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await req.json();
  const { name, avatarId, featuredBadgeId } = body as {
    name?: string;
    avatarId?: string | null;
    featuredBadgeId?: string | null;
  };

  const data: { name?: string; avatarId?: string | null; featuredBadgeId?: string | null } = {};

  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return NextResponse.json({ error: "Name must be 2-30 characters" }, { status: 400 });
    }
    data.name = trimmed;
  }

  if (avatarId !== undefined) {
    if (avatarId !== null && !PRESET_AVATARS.some((a) => a.id === avatarId)) {
      return NextResponse.json({ error: "Invalid avatar" }, { status: 400 });
    }
    data.avatarId = avatarId;
  }

  if (featuredBadgeId !== undefined) {
    if (featuredBadgeId !== null) {
      const owns = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: featuredBadgeId } },
      });
      if (!owns) {
        return NextResponse.json({ error: "Badge not unlocked" }, { status: 400 });
      }
    }
    data.featuredBadgeId = featuredBadgeId;
  }

  const updated = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ success: true, user: updated });
}