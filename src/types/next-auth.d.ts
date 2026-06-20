import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "LEARNER" | "INSTRUCTOR" | "ADMIN";
      points: number;
      level: number;
      streakDays: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "LEARNER" | "INSTRUCTOR" | "ADMIN";
    points: number;
    level: number;
    streakDays: number;
  }
}