import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.points = user.points;
        session.user.level = user.level;
        session.user.streakDays = user.streakDays;
        session.user.avatarId = user.avatarId ?? null;
        session.user.featuredBadgeId = user.featuredBadgeId ?? null;

        if (user.featuredBadgeId) {
          const badge = await prisma.badge.findUnique({
            where: { id: user.featuredBadgeId },
            select: { name: true, icon: true },
          });
          session.user.featuredBadgeName = badge?.name ?? null;
          session.user.featuredBadgeIcon = badge?.icon ?? null;
        } else {
          session.user.featuredBadgeName = null;
          session.user.featuredBadgeIcon = null;
        }
      }

      return session;
    },
  },
};