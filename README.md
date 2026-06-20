This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# FinPath

FinPath is a thesis scaffold for a gamified e-learning platform focused on business and finance education.

## Stack

- Next.js with TypeScript and the App Router
- Tailwind CSS
- Prisma ORM with PostgreSQL on Neon
- NextAuth.js for authentication
- Vercel for deployment

## Structure

- `src/app` contains the App Router entry points, the landing page, dashboard scaffold, and auth route handler
- `src/lib` contains Prisma and auth helpers
- `src/types` contains NextAuth module augmentation
- `prisma/schema.prisma` defines the initial data model for users, courses, lessons, badges, streaks, and leaderboards

## Setup

1. Copy `.env.example` to `.env` and fill in your Neon and auth values.
2. Run `npm install` if dependencies are not already installed.
3. Run `npm run db:generate` to generate the Prisma client.
4. Run `npm run db:migrate` after you create your first migration.
5. Start the app with `npm run dev`.

## Notes

- The authentication scaffold uses a GitHub provider placeholder. Add the matching environment variables before testing sign-in.
- The dashboard and landing page are intentionally lightweight placeholders so you can keep iterating during the thesis write-up.
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
