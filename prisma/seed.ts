import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole, LessonType, BadgeRarity, EnrollmentStatus } from "@prisma/client";

const connectionString = process.env.DATABASE_URL ?? "postgresql://localhost:5432/finpath";
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Get existing user by ID
  const userId = "cmqomxft80000pkvikvydmc08";
  const testUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!testUser) {
    console.error(`❌ User with ID ${userId} not found. Please check the ID.`);
    process.exit(1);
  }

  console.log(`✓ User found: ${testUser.name} (${testUser.email})`);

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { slug: "financial-literacy-101" },
    update: {},
    create: {
      slug: "financial-literacy-101",
      title: "Foundations of Financial Literacy",
      description: "Master the basics of personal finance, budgeting, and saving strategies.",
      difficulty: "beginner",
      published: true,
      order: 1,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "business-planning-essentials" },
    update: {},
    create: {
      slug: "business-planning-essentials",
      title: "Business Planning Essentials",
      description: "Learn how to structure a business plan, set goals, and track metrics.",
      difficulty: "intermediate",
      published: true,
      order: 2,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: "marketing-analytics" },
    update: {},
    create: {
      slug: "marketing-analytics",
      title: "Marketing Metrics and Analytics",
      description: "Understand ROI, conversion funnels, and data-driven decision making.",
      difficulty: "intermediate",
      published: true,
      order: 3,
    },
  });

  console.log("✓ Courses created");

  // Create modules for course 1
  const module1_1 = await prisma.module.upsert({
    where: { id: "module-1-1" },
    update: {},
    create: {
      id: "module-1-1",
      courseId: course1.id,
      title: "Understanding Money Basics",
      description: "Fundamentals of money, savings, and basic financial concepts.",
      order: 1,
    },
  });

  const module1_2 = await prisma.module.upsert({
    where: { id: "module-1-2" },
    update: {},
    create: {
      id: "module-1-2",
      courseId: course1.id,
      title: "Building Your Budget",
      description: "Create a personal budget and track expenses.",
      order: 2,
    },
  });

  // Create modules for course 2
  const module2_1 = await prisma.module.upsert({
    where: { id: "module-2-1" },
    update: {},
    create: {
      id: "module-2-1",
      courseId: course2.id,
      title: "Business Model Canvas",
      description: "Learn the BMC framework for rapid business planning.",
      order: 1,
    },
  });

  console.log("✓ Modules created");

  // Create lessons for module 1_1
  const lesson1 = await prisma.lesson.upsert({
    where: { id: "lesson-1" },
    update: {},
    create: {
      id: "lesson-1",
      moduleId: module1_1.id,
      title: "What is Money?",
      slug: "what-is-money",
      summary: "Explore the history and purpose of money.",
      content: "Money is a medium of exchange used for goods and services.",
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 5,
      pointsAwarded: 10,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { id: "lesson-2" },
    update: {},
    create: {
      id: "lesson-2",
      moduleId: module1_1.id,
      title: "Saving vs. Investing",
      slug: "saving-vs-investing",
      summary: "Understand the difference and when to use each.",
      content: "Saving keeps money safe; investing seeks growth.",
      type: LessonType.ARTICLE,
      order: 2,
      estimatedMinutes: 8,
      pointsAwarded: 15,
    },
  });

  const lesson3 = await prisma.lesson.upsert({
    where: { id: "lesson-3" },
    update: {},
    create: {
      id: "lesson-3",
      moduleId: module1_2.id,
      title: "Budget 101",
      slug: "budget-101",
      summary: "Create your first budget.",
      content: "A budget tracks income and expenses.",
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 10,
      pointsAwarded: 20,
    },
  });

  const lesson4 = await prisma.lesson.upsert({
    where: { id: "lesson-4" },
    update: {},
    create: {
      id: "lesson-4",
      moduleId: module2_1.id,
      title: "The 9 Building Blocks",
      slug: "9-building-blocks",
      summary: "Master the Business Model Canvas.",
      content: "The BMC covers value proposition, customers, revenue, and more.",
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 12,
      pointsAwarded: 25,
    },
  });

  console.log("✓ Lessons created");

  // Create badges
  const badge1 = await prisma.badge.upsert({
    where: { code: "first-step" },
    update: {},
    create: {
      code: "first-step",
      name: "First Step",
      description: "Completed your first lesson.",
      rarity: BadgeRarity.COMMON,
      pointsReward: 10,
    },
  });

  const badge2 = await prisma.badge.upsert({
    where: { code: "course-complete" },
    update: {},
    create: {
      code: "course-complete",
      name: "Course Master",
      description: "Completed an entire course.",
      rarity: BadgeRarity.UNCOMMON,
      pointsReward: 50,
      courseId: course1.id,
    },
  });

  const badge3 = await prisma.badge.upsert({
    where: { code: "streak-7" },
    update: {},
    create: {
      code: "streak-7",
      name: "Week Warrior",
      description: "Maintained a 7-day streak.",
      rarity: BadgeRarity.RARE,
      pointsReward: 75,
    },
  });

  console.log("✓ Badges created");

  // Create enrollments
  const enrollment1 = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: testUser.id,
        courseId: course1.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      courseId: course1.id,
      status: EnrollmentStatus.ACTIVE,
      progressPercent: 75,
    },
  });

  const enrollment2 = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: testUser.id,
        courseId: course2.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      courseId: course2.id,
      status: EnrollmentStatus.ACTIVE,
      progressPercent: 44,
    },
  });

  const enrollment3 = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: testUser.id,
        courseId: course3.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      courseId: course3.id,
      status: EnrollmentStatus.ACTIVE,
      progressPercent: 18,
    },
  });

  console.log("✓ Enrollments created");

  // Create lesson progress
  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: testUser.id,
        lessonId: lesson1.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      lessonId: lesson1.id,
      completed: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      score: 100,
    },
  });

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: testUser.id,
        lessonId: lesson2.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      lessonId: lesson2.id,
      completed: true,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      score: 95,
    },
  });

  console.log("✓ Lesson progress created");

  // Create user badges
  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId: testUser.id,
        badgeId: badge1.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      badgeId: badge1.id,
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId: testUser.id,
        badgeId: badge3.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      badgeId: badge3.id,
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✓ User badges created");

  // Create or update streak
  const existingStreak = await prisma.streak.findFirst({ where: { userId: testUser.id } });
  if (existingStreak) {
    await prisma.streak.update({
      where: { id: existingStreak.id },
      data: {
        currentCount: 7,
        longestCount: 12,
        lastActivityAt: new Date(),
      },
    });
  } else {
    await prisma.streak.create({
      data: {
        userId: testUser.id,
        currentCount: 7,
        longestCount: 12,
        lastActivityAt: new Date(),
      },
    });
  }

  console.log("✓ Streak created");

  // Create or update leaderboard entry
  const existingLeaderboard = await prisma.leaderboardEntry.findFirst({
    where: { userId: testUser.id, period: "all_time" },
  });
  if (existingLeaderboard) {
    await prisma.leaderboardEntry.update({
      where: { id: existingLeaderboard.id },
      data: { points: 150, rank: 12 },
    });
  } else {
    await prisma.leaderboardEntry.create({
      data: {
        userId: testUser.id,
        period: "all_time",
        points: 150,
        rank: 12,
      },
    });
  }

  console.log("✓ Leaderboard entry created");

  console.log("✅ Seeding completed!");
  console.log(`\nAll courses, badges, and progress linked to your account (${testUser.name})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
