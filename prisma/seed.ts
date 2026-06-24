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

  const lesson1 = await prisma.lesson.upsert({
    where: { id: "lesson-1" },
    update: {
      content: `Money is one of the most fundamental concepts in modern society, yet few people stop to think about what it actually is and why it exists.

Before money was invented, people used a barter system — trading goods and services directly with one another. A farmer might trade wheat for a blacksmith's tools, or a hunter might exchange meat for clothing. While this worked in small communities, it had a major flaw: both parties had to want exactly what the other was offering at the same time. This is called the "double coincidence of wants," and it made trade incredibly difficult as societies grew larger.

Money solved this problem by acting as a middle layer — a universally accepted medium of exchange. Instead of trading wheat directly for tools, the farmer could sell wheat for money, then use that money to buy tools whenever needed. This simple shift unlocked the complexity of modern economies.

Over time, money has taken many forms. Early civilizations used commodity money — things with intrinsic value like gold, silver, grain, or shells. Later, governments introduced coins and paper notes backed by gold reserves (known as the gold standard). Today, most money is fiat currency, meaning it has value because a government declares it legal tender and people trust and accept it.

Money serves three core functions that make it useful. First, it is a medium of exchange — it facilitates buying and selling without the need for barter. Second, it is a store of value — you can save it today and spend it in the future (though inflation can erode this over time). Third, it is a unit of account — it gives us a common language to measure and compare the value of very different things, from a loaf of bread to a house.

Understanding these functions helps explain why managing money well is so important. When you earn, save, spend, or invest, you are essentially deciding how to allocate a resource that represents your time and effort. Building good financial habits starts with respecting what money truly is — not just coins and paper, but a tool that, when used wisely, gives you freedom and options in life.`,
    },
    create: {
      id: "lesson-1",
      moduleId: module1_1.id,
      title: "What is Money?",
      slug: "what-is-money",
      summary: "Explore the history and purpose of money.",
      content: `Money is one of the most fundamental concepts in modern society, yet few people stop to think about what it actually is and why it exists.

Before money was invented, people used a barter system — trading goods and services directly with one another. A farmer might trade wheat for a blacksmith's tools, or a hunter might exchange meat for clothing. While this worked in small communities, it had a major flaw: both parties had to want exactly what the other was offering at the same time. This is called the "double coincidence of wants," and it made trade incredibly difficult as societies grew larger.

Money solved this problem by acting as a middle layer — a universally accepted medium of exchange. Instead of trading wheat directly for tools, the farmer could sell wheat for money, then use that money to buy tools whenever needed. This simple shift unlocked the complexity of modern economies.

Over time, money has taken many forms. Early civilizations used commodity money — things with intrinsic value like gold, silver, grain, or shells. Later, governments introduced coins and paper notes backed by gold reserves (known as the gold standard). Today, most money is fiat currency, meaning it has value because a government declares it legal tender and people trust and accept it.

Money serves three core functions that make it useful. First, it is a medium of exchange — it facilitates buying and selling without the need for barter. Second, it is a store of value — you can save it today and spend it in the future (though inflation can erode this over time). Third, it is a unit of account — it gives us a common language to measure and compare the value of very different things, from a loaf of bread to a house.

Understanding these functions helps explain why managing money well is so important. When you earn, save, spend, or invest, you are essentially deciding how to allocate a resource that represents your time and effort. Building good financial habits starts with respecting what money truly is — not just coins and paper, but a tool that, when used wisely, gives you freedom and options in life.`,
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 5,
      pointsAwarded: 10,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { id: "lesson-2" },
    update: {
      content: `Two of the most important financial habits you can build are saving and investing — but many people use these terms interchangeably when they actually serve very different purposes.

Saving means setting aside money in a safe, easily accessible place for short-term needs or emergencies. A savings account at a bank is the most common example. The money is protected, available whenever you need it, and typically earns a small amount of interest. Saving is ideal for your emergency fund (usually three to six months of living expenses), a vacation you are planning in the next year, or any purchase you expect to make soon.

Investing, on the other hand, means putting your money to work in assets that have the potential to grow over time — such as stocks, bonds, mutual funds, real estate, or a business. Unlike savings, investments carry risk: their value can go up or down. However, the potential reward is much higher. Historically, a diversified stock portfolio has returned an average of around seven to ten percent per year over long periods, far outpacing the interest earned in a savings account.

The key difference comes down to time horizon and risk tolerance. If you need the money within one to three years, save it. If you will not need it for five years or more, investing is likely the smarter choice because time allows you to ride out market fluctuations and benefit from compound growth.

Compound growth is one of the most powerful forces in personal finance. When your investments earn returns, those returns are reinvested and begin earning returns of their own. Over decades, this creates exponential growth. A single investment of one thousand dollars at a seven percent annual return becomes roughly eight thousand dollars after thirty years — without adding another cent.

The practical takeaway is this: build your savings first to create a financial safety net, then invest what you can afford to leave untouched for the long term. Both habits work together. Savings give you stability and peace of mind; investing builds wealth over time. Most financially healthy people do both simultaneously, allocating a portion of each paycheck to each goal.`,
    },
    create: {
      id: "lesson-2",
      moduleId: module1_1.id,
      title: "Saving vs. Investing",
      slug: "saving-vs-investing",
      summary: "Understand the difference and when to use each.",
      content: `Two of the most important financial habits you can build are saving and investing — but many people use these terms interchangeably when they actually serve very different purposes.

Saving means setting aside money in a safe, easily accessible place for short-term needs or emergencies. A savings account at a bank is the most common example. The money is protected, available whenever you need it, and typically earns a small amount of interest. Saving is ideal for your emergency fund (usually three to six months of living expenses), a vacation you are planning in the next year, or any purchase you expect to make soon.

Investing, on the other hand, means putting your money to work in assets that have the potential to grow over time — such as stocks, bonds, mutual funds, real estate, or a business. Unlike savings, investments carry risk: their value can go up or down. However, the potential reward is much higher. Historically, a diversified stock portfolio has returned an average of around seven to ten percent per year over long periods, far outpacing the interest earned in a savings account.

The key difference comes down to time horizon and risk tolerance. If you need the money within one to three years, save it. If you will not need it for five years or more, investing is likely the smarter choice because time allows you to ride out market fluctuations and benefit from compound growth.

Compound growth is one of the most powerful forces in personal finance. When your investments earn returns, those returns are reinvested and begin earning returns of their own. Over decades, this creates exponential growth. A single investment of one thousand dollars at a seven percent annual return becomes roughly eight thousand dollars after thirty years — without adding another cent.

The practical takeaway is this: build your savings first to create a financial safety net, then invest what you can afford to leave untouched for the long term. Both habits work together. Savings give you stability and peace of mind; investing builds wealth over time. Most financially healthy people do both simultaneously, allocating a portion of each paycheck to each goal.`,
      type: LessonType.ARTICLE,
      order: 2,
      estimatedMinutes: 8,
      pointsAwarded: 15,
    },
  });

  const lesson3 = await prisma.lesson.upsert({
    where: { id: "lesson-3" },
    update: {
      content: `A budget is simply a plan for your money — a way to tell your income where to go instead of wondering where it went. Despite its reputation as a restrictive tool, a good budget is actually the opposite: it gives you clarity, control, and the freedom to spend on what matters without guilt.

The first step in building a budget is understanding your income. This means your take-home pay after taxes, not your gross salary. If your income varies month to month, use a conservative estimate based on your lowest recent months to avoid overcommitting.

Next, list all your expenses. It helps to split them into two categories: fixed expenses and variable expenses. Fixed expenses stay the same each month — rent, loan repayments, insurance premiums, and subscription services. Variable expenses change — groceries, dining out, entertainment, transport, and clothing. Go through your last two or three months of bank statements to get an accurate picture of what you actually spend, not what you think you spend. Most people are surprised by the gap.

Once you have your income and expenses laid out, subtract your total expenses from your income. If the number is positive, you have a surplus — money you can direct toward savings or investments. If it is negative, you are spending more than you earn and need to make adjustments.

One of the most popular budgeting frameworks is the 50/30/20 rule. It suggests allocating fifty percent of your take-home income to needs (housing, food, utilities, transport), thirty percent to wants (dining out, entertainment, hobbies), and twenty percent to savings and debt repayment. This is a starting point, not a strict rule — adjust the percentages based on your own goals and circumstances.

The most important habit is to review your budget regularly. Life changes — income goes up or down, unexpected expenses appear, goals shift. A budget is a living document. Checking in monthly keeps you honest and allows you to course-correct before small overspending becomes a big problem.

Tools like spreadsheets, banking apps, or dedicated budgeting software can make this process much easier. The best tool is the one you will actually use consistently. Start simple, stay consistent, and remember that the goal of a budget is not to restrict your life but to design it intentionally.`,
    },
    create: {
      id: "lesson-3",
      moduleId: module1_2.id,
      title: "Budget 101",
      slug: "budget-101",
      summary: "Create your first budget.",
      content: `A budget is simply a plan for your money — a way to tell your income where to go instead of wondering where it went. Despite its reputation as a restrictive tool, a good budget is actually the opposite: it gives you clarity, control, and the freedom to spend on what matters without guilt.

The first step in building a budget is understanding your income. This means your take-home pay after taxes, not your gross salary. If your income varies month to month, use a conservative estimate based on your lowest recent months to avoid overcommitting.

Next, list all your expenses. It helps to split them into two categories: fixed expenses and variable expenses. Fixed expenses stay the same each month — rent, loan repayments, insurance premiums, and subscription services. Variable expenses change — groceries, dining out, entertainment, transport, and clothing. Go through your last two or three months of bank statements to get an accurate picture of what you actually spend, not what you think you spend. Most people are surprised by the gap.

Once you have your income and expenses laid out, subtract your total expenses from your income. If the number is positive, you have a surplus — money you can direct toward savings or investments. If it is negative, you are spending more than you earn and need to make adjustments.

One of the most popular budgeting frameworks is the 50/30/20 rule. It suggests allocating fifty percent of your take-home income to needs (housing, food, utilities, transport), thirty percent to wants (dining out, entertainment, hobbies), and twenty percent to savings and debt repayment. This is a starting point, not a strict rule — adjust the percentages based on your own goals and circumstances.

The most important habit is to review your budget regularly. Life changes — income goes up or down, unexpected expenses appear, goals shift. A budget is a living document. Checking in monthly keeps you honest and allows you to course-correct before small overspending becomes a big problem.

Tools like spreadsheets, banking apps, or dedicated budgeting software can make this process much easier. The best tool is the one you will actually use consistently. Start simple, stay consistent, and remember that the goal of a budget is not to restrict your life but to design it intentionally.`,
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 10,
      pointsAwarded: 20,
    },
  });

  const lesson4 = await prisma.lesson.upsert({
    where: { id: "lesson-4" },
    update: {
      content: `The Business Model Canvas, developed by Alexander Osterwalder, is a one-page strategic tool that helps entrepreneurs and managers describe, design, and analyze how a business creates, delivers, and captures value. It replaces the traditional lengthy business plan with a visual map of nine interconnected building blocks.

The first block is Customer Segments — the specific groups of people or organizations your business serves. A business can target a mass market, a niche market, multiple segments simultaneously, or act as a platform connecting two or more distinct groups (like a marketplace connecting buyers and sellers).

The second block is Value Propositions — the bundle of products and services that create value for your customers. Your value proposition answers the question: why would someone choose you over an alternative? It might be price, convenience, design, performance, customization, or solving a problem no one else is addressing.

Third is Channels — how you reach your customer segments to deliver your value proposition. Channels include your website, physical stores, sales teams, partner networks, and social media. Effective channels raise awareness, help customers evaluate your offer, allow purchase, and provide post-purchase support.

Fourth is Customer Relationships — the type of relationship you establish with each segment. This ranges from self-service and automation to dedicated personal assistance. Your relationship strategy affects customer acquisition, retention, and upselling.

Fifth is Revenue Streams — how your business earns money from each customer segment. Common models include one-time sales, subscription fees, licensing, advertising, and transaction fees. Understanding your revenue streams helps you evaluate which customers are most valuable.

Sixth is Key Resources — the most important assets required to make your business model work. These can be physical (factories, vehicles), intellectual (patents, data, brand), human (specialized talent), or financial (credit lines, investor capital).

Seventh is Key Activities — the most important things your business must do to operate successfully. For a software company, that might be platform development. For a consultancy, it is knowledge management and problem solving.

Eighth is Key Partnerships — the network of suppliers and partners that make your business model work. Partnerships help you optimize resources, reduce risk, and acquire capabilities you do not have internally.

Ninth is Cost Structure — all costs incurred to operate your business model. Once you understand your key resources, activities, and partnerships, you can identify your major costs. Businesses are either cost-driven (minimizing expenses wherever possible) or value-driven (focused on premium value creation).

The real power of the Business Model Canvas is not in filling it out once — it is in using it as a living tool to test assumptions, spot weaknesses, and explore alternatives. Successful entrepreneurs revisit their canvas regularly as they learn more about their customers and market.`,
    },
    create: {
      id: "lesson-4",
      moduleId: module2_1.id,
      title: "The 9 Building Blocks",
      slug: "9-building-blocks",
      summary: "Master the Business Model Canvas.",
      content: `The Business Model Canvas, developed by Alexander Osterwalder, is a one-page strategic tool that helps entrepreneurs and managers describe, design, and analyze how a business creates, delivers, and captures value. It replaces the traditional lengthy business plan with a visual map of nine interconnected building blocks.

The first block is Customer Segments — the specific groups of people or organizations your business serves. A business can target a mass market, a niche market, multiple segments simultaneously, or act as a platform connecting two or more distinct groups (like a marketplace connecting buyers and sellers).

The second block is Value Propositions — the bundle of products and services that create value for your customers. Your value proposition answers the question: why would someone choose you over an alternative? It might be price, convenience, design, performance, customization, or solving a problem no one else is addressing.

Third is Channels — how you reach your customer segments to deliver your value proposition. Channels include your website, physical stores, sales teams, partner networks, and social media. Effective channels raise awareness, help customers evaluate your offer, allow purchase, and provide post-purchase support.

Fourth is Customer Relationships — the type of relationship you establish with each segment. This ranges from self-service and automation to dedicated personal assistance. Your relationship strategy affects customer acquisition, retention, and upselling.

Fifth is Revenue Streams — how your business earns money from each customer segment. Common models include one-time sales, subscription fees, licensing, advertising, and transaction fees. Understanding your revenue streams helps you evaluate which customers are most valuable.

Sixth is Key Resources — the most important assets required to make your business model work. These can be physical (factories, vehicles), intellectual (patents, data, brand), human (specialized talent), or financial (credit lines, investor capital).

Seventh is Key Activities — the most important things your business must do to operate successfully. For a software company, that might be platform development. For a consultancy, it is knowledge management and problem solving.

Eighth is Key Partnerships — the network of suppliers and partners that make your business model work. Partnerships help you optimize resources, reduce risk, and acquire capabilities you do not have internally.

Ninth is Cost Structure — all costs incurred to operate your business model. Once you understand your key resources, activities, and partnerships, you can identify your major costs. Businesses are either cost-driven (minimizing expenses wherever possible) or value-driven (focused on premium value creation).

The real power of the Business Model Canvas is not in filling it out once — it is in using it as a living tool to test assumptions, spot weaknesses, and explore alternatives. Successful entrepreneurs revisit their canvas regularly as they learn more about their customers and market.`,
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
