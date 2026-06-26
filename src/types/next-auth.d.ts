import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "LEARNER" | "INSTRUCTOR" | "ADMIN";
      points: number;
      level: number;
      streakDays: number;
      avatarId: string | null;
      featuredBadgeId: string | null;
      featuredBadgeName: string | null;
      featuredBadgeIcon: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "LEARNER" | "INSTRUCTOR" | "ADMIN";
    points: number;
    level: number;
    streakDays: number;
    avatarId: string | null;
    featuredBadgeId: string | null;
  }
}