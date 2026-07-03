import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, LessonType, BadgeRarity, EnrollmentStatus } from "@prisma/client";

const connectionString = process.env.DATABASE_URL ?? "postgresql://localhost:5432/finpath";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const userId = "cmque4q6r0005gsvidgp3kehh";
  const testUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!testUser) {
    console.error(`❌ User with ID ${userId} not found.`);
    process.exit(1);
  }

  console.log(`✓ User found: ${testUser.name} (${testUser.email})`);

  // ── Reset your progress ──────────────────────────────────────────
  await prisma.lessonProgress.deleteMany({ where: { userId } });
  await prisma.userBadge.deleteMany({ where: { userId } });
  await prisma.leaderboardEntry.deleteMany({ where: { userId } });
  await prisma.streak.deleteMany({ where: { userId } });
  await prisma.enrollment.deleteMany({ where: { userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { points: 0, level: 1, streakDays: 0 },
  });
  console.log("✓ Your progress reset");

  // ── Courses ──────────────────────────────────────────────────────
  const course1 = await prisma.course.upsert({
    where: { slug: "financial-literacy-101" },
    update: {
      title: "Foundations of Financial Literacy",
      description: "Master the basics of personal finance, budgeting, and saving strategies. Learn how money works, how to build a budget, and how to make your money grow over time.",
      coverImage: "/courses/financial-literacy.jpg",
    },
    create: {
      slug: "financial-literacy-101",
      title: "Foundations of Financial Literacy",
      description: "Master the basics of personal finance, budgeting, and saving strategies. Learn how money works, how to build a budget, and how to make your money grow over time.",
      difficulty: "beginner",
      published: true,
      order: 1,
      coverImage: "/courses/financial-literacy.jpg",
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "business-planning-essentials" },
    update: {
      title: "Business Planning Essentials",
      description: "Learn how to structure a business plan, set measurable goals, and track key metrics. Covers the Business Model Canvas, market analysis, and financial forecasting.",
      coverImage: "/courses/business-planning.jpg",
    },
    create: {
      slug: "business-planning-essentials",
      title: "Business Planning Essentials",
      description: "Learn how to structure a business plan, set measurable goals, and track key metrics. Covers the Business Model Canvas, market analysis, and financial forecasting.",
      difficulty: "intermediate",
      published: true,
      order: 2,
      coverImage: "/courses/business-planning.jpg",
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: "marketing-analytics" },
    update: {
      title: "Marketing Metrics and Analytics",
      description: "Understand ROI, conversion funnels, and data-driven decision making. Learn to measure campaign performance, interpret data, and optimize marketing spend.",
      coverImage: "/courses/marketing-analytics.jpg",
    },
    create: {
      slug: "marketing-analytics",
      title: "Marketing Metrics and Analytics",
      description: "Understand ROI, conversion funnels, and data-driven decision making. Learn to measure campaign performance, interpret data, and optimize marketing spend.",
      difficulty: "intermediate",
      published: true,
      order: 3,
      coverImage: "/courses/marketing-analytics.jpg",
    },
  });

  console.log("✓ Courses created");

  // ── Modules ──────────────────────────────────────────────────────
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

  const module3_1 = await prisma.module.upsert({
    where: { id: "module-3-1" },
    update: {},
    create: {
      id: "module-3-1",
      courseId: course3.id,
      title: "Core Marketing Metrics",
      description: "Learn the foundational metrics every marketer tracks.",
      order: 1,
    },
  });

  console.log("✓ Modules created");

  // ── Lessons ──────────────────────────────────────────────────────
  const lesson1Content = `Money is one of the most fundamental concepts in modern society, yet few people stop to think about what it actually is and why it exists.

Before money was invented, people used a barter system — trading goods and services directly with one another. A farmer might trade wheat for a blacksmith's tools, or a hunter might exchange meat for clothing. While this worked in small communities, it had a major flaw: both parties had to want exactly what the other was offering at the same time. This is called the "double coincidence of wants," and it made trade incredibly difficult as societies grew larger.

Money solved this problem by acting as a middle layer — a universally accepted medium of exchange. Instead of trading wheat directly for tools, the farmer could sell wheat for money, then use that money to buy tools whenever needed. This simple shift unlocked the complexity of modern economies.

Over time, money has taken many forms. Early civilizations used commodity money — things with intrinsic value like gold, silver, grain, or shells. Later, governments introduced coins and paper notes backed by gold reserves (known as the gold standard). Today, most money is fiat currency, meaning it has value because a government declares it legal tender and people trust and accept it.

Money serves three core functions that make it useful. First, it is a medium of exchange — it facilitates buying and selling without the need for barter. Second, it is a store of value — you can save it today and spend it in the future (though inflation can erode this over time). Third, it is a unit of account — it gives us a common language to measure and compare the value of very different things, from a loaf of bread to a house.

Understanding these functions helps explain why managing money well is so important. When you earn, save, spend, or invest, you are essentially deciding how to allocate a resource that represents your time and effort. Building good financial habits starts with respecting what money truly is — not just coins and paper, but a tool that, when used wisely, gives you freedom and options in life.`;

  const lesson2Content = `Two of the most important financial habits you can build are saving and investing — but many people use these terms interchangeably when they actually serve very different purposes.

Saving means setting aside money in a safe, easily accessible place for short-term needs or emergencies. A savings account at a bank is the most common example. The money is protected, available whenever you need it, and typically earns a small amount of interest. Saving is ideal for your emergency fund (usually three to six months of living expenses), a vacation you are planning in the next year, or any purchase you expect to make soon.

Investing, on the other hand, means putting your money to work in assets that have the potential to grow over time — such as stocks, bonds, mutual funds, real estate, or a business. Unlike savings, investments carry risk: their value can go up or down. However, the potential reward is much higher. Historically, a diversified stock portfolio has returned an average of around seven to ten percent per year over long periods, far outpacing the interest earned in a savings account.

The key difference comes down to time horizon and risk tolerance. If you need the money within one to three years, save it. If you will not need it for five years or more, investing is likely the smarter choice because time allows you to ride out market fluctuations and benefit from compound growth.

Compound growth is one of the most powerful forces in personal finance. When your investments earn returns, those returns are reinvested and begin earning returns of their own. Over decades, this creates exponential growth. A single investment of one thousand dollars at a seven percent annual return becomes roughly eight thousand dollars after thirty years — without adding another cent.

The practical takeaway is this: build your savings first to create a financial safety net, then invest what you can afford to leave untouched for the long term. Both habits work together. Savings give you stability and peace of mind; investing builds wealth over time. Most financially healthy people do both simultaneously, allocating a portion of each paycheck to each goal.`;

  const lesson3Content = `A budget is simply a plan for your money — a way to tell your income where to go instead of wondering where it went. Despite its reputation as a restrictive tool, a good budget is actually the opposite: it gives you clarity, control, and the freedom to spend on what matters without guilt.

The first step in building a budget is understanding your income. This means your take-home pay after taxes, not your gross salary. If your income varies month to month, use a conservative estimate based on your lowest recent months to avoid overcommitting.

Next, list all your expenses. It helps to split them into two categories: fixed expenses and variable expenses. Fixed expenses stay the same each month — rent, loan repayments, insurance premiums, and subscription services. Variable expenses change — groceries, dining out, entertainment, transport, and clothing. Go through your last two or three months of bank statements to get an accurate picture of what you actually spend, not what you think you spend. Most people are surprised by the gap.

Once you have your income and expenses laid out, subtract your total expenses from your income. If the number is positive, you have a surplus — money you can direct toward savings or investments. If it is negative, you are spending more than you earn and need to make adjustments.

One of the most popular budgeting frameworks is the 50/30/20 rule. It suggests allocating fifty percent of your take-home income to needs (housing, food, utilities, transport), thirty percent to wants (dining out, entertainment, hobbies), and twenty percent to savings and debt repayment. This is a starting point, not a strict rule — adjust the percentages based on your own goals and circumstances.

The most important habit is to review your budget regularly. Life changes — income goes up or down, unexpected expenses appear, goals shift. A budget is a living document. Checking in monthly keeps you honest and allows you to course-correct before small overspending becomes a big problem.

Tools like spreadsheets, banking apps, or dedicated budgeting software can make this process much easier. The best tool is the one you will actually use consistently. Start simple, stay consistent, and remember that the goal of a budget is not to restrict your life but to design it intentionally.`;

  const lesson4Content = `The Business Model Canvas, developed by Alexander Osterwalder, is a one-page strategic tool that helps entrepreneurs and managers describe, design, and analyze how a business creates, delivers, and captures value. It replaces the traditional lengthy business plan with a visual map of nine interconnected building blocks.

The first block is Customer Segments — the specific groups of people or organizations your business serves. A business can target a mass market, a niche market, multiple segments simultaneously, or act as a platform connecting two or more distinct groups (like a marketplace connecting buyers and sellers).

The second block is Value Propositions — the bundle of products and services that create value for your customers. Your value proposition answers the question: why would someone choose you over an alternative? It might be price, convenience, design, performance, customization, or solving a problem no one else is addressing.

Third is Channels — how you reach your customer segments to deliver your value proposition. Channels include your website, physical stores, sales teams, partner networks, and social media. Effective channels raise awareness, help customers evaluate your offer, allow purchase, and provide post-purchase support.

Fourth is Customer Relationships — the type of relationship you establish with each segment. This ranges from self-service and automation to dedicated personal assistance. Your relationship strategy affects customer acquisition, retention, and upselling.

Fifth is Revenue Streams — how your business earns money from each customer segment. Common models include one-time sales, subscription fees, licensing, advertising, and transaction fees. Understanding your revenue streams helps you evaluate which customers are most valuable.

Sixth is Key Resources — the most important assets required to make your business model work. These can be physical (factories, vehicles), intellectual (patents, data, brand), human (specialized talent), or financial (credit lines, investor capital).

Seventh is Key Activities — the most important things your business must do to operate successfully. For a software company, that might be platform development. For a consultancy, it is knowledge management and problem solving.

Eighth is Key Partnerships — the network of suppliers and partners that make your business model work. Partnerships help you optimize resources, reduce risk, and acquire capabilities you do not have internally.

Ninth is Cost Structure — all costs incurred to operate your business model. Once you understand your key resources, activities, and partnerships, you can identify your major costs. Businesses are either cost-driven (minimizing expenses wherever possible) or value-driven (focused on premium value creation).

The real power of the Business Model Canvas is not in filling it out once — it is in using it as a living tool to test assumptions, spot weaknesses, and explore alternatives. Successful entrepreneurs revisit their canvas regularly as they learn more about their customers and market.`;

  const lesson5Content = `Marketing without metrics is just guessing with extra steps. To make confident decisions about where to spend time and budget, you need to understand a handful of core metrics that show whether your efforts are actually working.

The first metric every marketer should know is Customer Acquisition Cost (CAC) — how much you spend, on average, to acquire one new customer. It is calculated by dividing total marketing and sales spend by the number of new customers gained in that period. A rising CAC over time can signal market saturation, increased competition, or declining campaign efficiency.

Closely related is Customer Lifetime Value (LTV) — the total revenue you can expect from a customer over the entire relationship, not just their first purchase. Comparing LTV to CAC is one of the most important health checks a business can run: if you are spending more to acquire customers than they will ever generate in revenue, the business model is not sustainable, no matter how many customers you sign up.

Conversion rate measures the percentage of people who take a desired action — completing a purchase, signing up for a newsletter, requesting a demo — out of everyone who had the opportunity to do so. It is calculated as (number of conversions ÷ total visitors) × 100. Tracking conversion rate at each stage of your funnel (awareness, interest, decision, action) helps you pinpoint exactly where potential customers are dropping off.

Return on Investment (ROI) ties everything together financially. It compares the profit generated by a campaign to the cost of running it: ROI = (Revenue − Cost) ÷ Cost × 100. A campaign with a positive ROI is generating more value than it costs; a negative ROI means money is being lost, even if vanity metrics like impressions or clicks look impressive.

Finally, it is worth distinguishing between leading and lagging indicators. Leading indicators (like website traffic or email open rates) predict future outcomes and can be acted on quickly. Lagging indicators (like quarterly revenue or churn rate) confirm what has already happened. A strong marketing analytics practice tracks both: leading indicators for fast course-correction, lagging indicators for evaluating overall strategy.

Mastering these core metrics does not require advanced statistics — it requires discipline in tracking the right numbers consistently and asking what the data is actually telling you before making your next move.`;

  await prisma.lesson.upsert({
    where: { id: "lesson-1" },
    update: { content: lesson1Content },
    create: {
      id: "lesson-1",
      moduleId: module1_1.id,
      title: "What is Money?",
      slug: "what-is-money",
      summary: "Explore the history and purpose of money.",
      content: lesson1Content,
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 5,
      pointsAwarded: 10,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson-2" },
    update: { content: lesson2Content },
    create: {
      id: "lesson-2",
      moduleId: module1_1.id,
      title: "Saving vs. Investing",
      slug: "saving-vs-investing",
      summary: "Understand the difference and when to use each.",
      content: lesson2Content,
      type: LessonType.ARTICLE,
      order: 2,
      estimatedMinutes: 8,
      pointsAwarded: 15,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson-3" },
    update: { content: lesson3Content },
    create: {
      id: "lesson-3",
      moduleId: module1_2.id,
      title: "Budget 101",
      slug: "budget-101",
      summary: "Create your first budget.",
      content: lesson3Content,
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 10,
      pointsAwarded: 20,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson-4" },
    update: { content: lesson4Content },
    create: {
      id: "lesson-4",
      moduleId: module2_1.id,
      title: "The 9 Building Blocks",
      slug: "9-building-blocks",
      summary: "Master the Business Model Canvas.",
      content: lesson4Content,
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 12,
      pointsAwarded: 25,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "lesson-5" },
    update: { content: lesson5Content },
    create: {
      id: "lesson-5",
      moduleId: module3_1.id,
      title: "CAC, LTV, Conversion Rate, and ROI",
      slug: "core-marketing-metrics",
      summary: "The four numbers every marketer needs to track.",
      content: lesson5Content,
      type: LessonType.ARTICLE,
      order: 1,
      estimatedMinutes: 9,
      pointsAwarded: 15,
    },
  });

  console.log("✓ Lessons created");

  // ── Challenges (one per module) ───────────────────────────────────
  const challenge1Data = {
    questions: [
      {
        question: "What problem did money solve compared to bartering?",
        options: [
          "It made goods last longer",
          "It eliminated the need for the 'double coincidence of wants'",
          "It made goods heavier to transport",
          "It removed the need for trust between traders",
        ],
        correctIndex: 1,
      },
      {
        question: "Which of these is NOT one of the three core functions of money?",
        options: ["Medium of exchange", "Store of value", "Unit of account", "Source of interest"],
        correctIndex: 3,
      },
      {
        question: "What is fiat currency?",
        options: [
          "Currency backed by gold reserves",
          "Currency with no government backing at all",
          "Currency that has value because a government declares it legal tender",
          "A type of cryptocurrency",
        ],
        correctIndex: 2,
      },
    ],
  };

  const challenge2Data = {
    questions: [
      {
        question: "What is the 50/30/20 rule used for?",
        options: [
          "Splitting investment portfolios",
          "Allocating income across needs, wants, and savings",
          "Calculating loan interest",
          "Setting tax brackets",
        ],
        correctIndex: 1,
      },
      {
        question: "Which is a fixed expense?",
        options: ["Dining out", "Rent", "Entertainment", "Clothing"],
        correctIndex: 1,
      },
      {
        question: "What should you base your budget income on if it varies month to month?",
        options: [
          "Your highest recent month",
          "Your average over the past year",
          "A conservative estimate based on your lowest recent months",
          "Your expected income next year",
        ],
        correctIndex: 2,
      },
    ],
  };

  const challenge3Data = {
    questions: [
      {
        question: "What does the Value Proposition block of the Business Model Canvas describe?",
        options: [
          "How you reach customers",
          "Why a customer would choose you over alternatives",
          "Your largest costs",
          "Your key suppliers",
        ],
        correctIndex: 1,
      },
      {
        question: "Which block describes how a business actually earns money?",
        options: ["Key Activities", "Customer Relationships", "Revenue Streams", "Key Resources"],
        correctIndex: 2,
      },
      {
        question: "What is the main advantage of the Business Model Canvas over a traditional business plan?",
        options: [
          "It requires no research",
          "It's a visual, one-page tool that's easy to revisit and adapt",
          "It guarantees business success",
          "It removes the need for a value proposition",
        ],
        correctIndex: 1,
      },
    ],
  };

  const challenge4Data = {
    questions: [
      {
        question: "What does CAC measure?",
        options: [
          "Total company revenue",
          "Average cost to acquire one new customer",
          "Customer satisfaction score",
          "Number of active users",
        ],
        correctIndex: 1,
      },
      {
        question: "Why is comparing LTV to CAC important?",
        options: [
          "It shows your stock price",
          "It checks if customers are worth more than they cost to acquire",
          "It calculates employee salaries",
          "It measures website speed",
        ],
        correctIndex: 1,
      },
      {
        question: "What's the difference between leading and lagging indicators?",
        options: [
          "Leading indicators predict future outcomes; lagging indicators confirm what already happened",
          "They are the same thing",
          "Leading indicators are always financial; lagging indicators are not",
          "Lagging indicators are faster to measure",
        ],
        correctIndex: 0,
      },
    ],
  };

  await prisma.lesson.upsert({
    where: { id: "challenge-1" },
    update: { challengeData: challenge1Data },
    create: {
      id: "challenge-1",
      moduleId: module1_1.id,
      title: "Challenge: Money Basics",
      slug: "challenge-money-basics",
      summary: "Put your knowledge of money and its functions to the test.",
      type: LessonType.CHALLENGE,
      challengeData: challenge1Data,
      order: 3,
      estimatedMinutes: 3,
      pointsAwarded: 20,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "challenge-2" },
    update: { challengeData: challenge2Data },
    create: {
      id: "challenge-2",
      moduleId: module1_2.id,
      title: "Challenge: Budgeting",
      slug: "challenge-budgeting",
      summary: "Put your budgeting knowledge to the test.",
      type: LessonType.CHALLENGE,
      challengeData: challenge2Data,
      order: 2,
      estimatedMinutes: 3,
      pointsAwarded: 20,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "challenge-3" },
    update: { challengeData: challenge3Data },
    create: {
      id: "challenge-3",
      moduleId: module2_1.id,
      title: "Challenge: Business Model Canvas",
      slug: "challenge-business-model-canvas",
      summary: "Put your Business Model Canvas knowledge to the test.",
      type: LessonType.CHALLENGE,
      challengeData: challenge3Data,
      order: 2,
      estimatedMinutes: 3,
      pointsAwarded: 20,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "challenge-4" },
    update: { challengeData: challenge4Data },
    create: {
      id: "challenge-4",
      moduleId: module3_1.id,
      title: "Challenge: Marketing Metrics",
      slug: "challenge-marketing-metrics",
      summary: "Put your marketing metrics knowledge to the test.",
      type: LessonType.CHALLENGE,
      challengeData: challenge4Data,
      order: 2,
      estimatedMinutes: 3,
      pointsAwarded: 20,
    },
  });

  console.log("✓ Challenges created");

  // ── Badges ───────────────────────────────────────────────────────
  await prisma.badge.upsert({
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

  await prisma.badge.upsert({
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

  await prisma.badge.upsert({
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

  // ── Enrollments ──────────────────────────────────────────────────
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course1.id } },
    update: { progressPercent: 0, status: EnrollmentStatus.ACTIVE },
    create: { userId, courseId: course1.id, status: EnrollmentStatus.ACTIVE, progressPercent: 0 },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course2.id } },
    update: { progressPercent: 0, status: EnrollmentStatus.ACTIVE },
    create: { userId, courseId: course2.id, status: EnrollmentStatus.ACTIVE, progressPercent: 0 },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course3.id } },
    update: { progressPercent: 0, status: EnrollmentStatus.ACTIVE },
    create: { userId, courseId: course3.id, status: EnrollmentStatus.ACTIVE, progressPercent: 0 },
  });

  console.log("✓ Your enrollments reset");

  // ── Fake users ───────────────────────────────────────────────────
  const fakeUsers = [
    { name: "Alice Nguyen", email: "alice@finpath.dev", points: 320, level: 4, avatarId: "owl" },
    { name: "Bob Tran", email: "bob@finpath.dev", points: 275, level: 3, avatarId: "rocket" },
    { name: "Clara Le", email: "clara@finpath.dev", points: 240, level: 3, avatarId: "dolphin" },
    { name: "David Pham", email: "david@finpath.dev", points: 190, level: 2, avatarId: "wolf" },
    { name: "Eva Hoang", email: "eva@finpath.dev", points: 160, level: 2, avatarId: "phoenix" },
    { name: "Frank Do", email: "frank@finpath.dev", points: 130, level: 2, avatarId: "lion" },
    { name: "Grace Vu", email: "grace@finpath.dev", points: 95, level: 1, avatarId: "turtle" },
    { name: "Henry Mai", email: "henry@finpath.dev", points: 60, level: 1, avatarId: "panda" },
    { name: "Iris Bui", email: "iris@finpath.dev", points: 40, level: 1, avatarId: "robot" },
  ];

  const createdFakeUsers = [];
  for (const u of fakeUsers) {
    const fake = await prisma.user.upsert({
      where: { email: u.email },
      update: { points: u.points, level: u.level, avatarId: u.avatarId },
      create: { name: u.name, email: u.email, points: u.points, level: u.level, avatarId: u.avatarId },
    });
    createdFakeUsers.push(fake);
  }

  console.log("✓ Fake users created");

  // ── Leaderboard ──────────────────────────────────────────────────
  const allForLeaderboard = [
    ...createdFakeUsers.map((u) => ({ id: u.id, points: u.points })),
    { id: userId, points: 0 },
  ].sort((a, b) => b.points - a.points);

  for (let i = 0; i < allForLeaderboard.length; i++) {
    const u = allForLeaderboard[i];
    const existing = await prisma.leaderboardEntry.findFirst({ where: { userId: u.id, period: "all_time" } });
    if (existing) {
      await prisma.leaderboardEntry.update({ where: { id: existing.id }, data: { points: u.points, rank: i + 1 } });
    } else {
      await prisma.leaderboardEntry.create({ data: { userId: u.id, period: "all_time", points: u.points, rank: i + 1 } });
    }

    const recentPoints = i < 5 ? Math.floor(u.points * 0.3) : Math.floor(u.points * 0.1);
    const existingRecent = await prisma.leaderboardEntry.findFirst({ where: { userId: u.id, period: "last_7_days" } });
    if (existingRecent) {
      await prisma.leaderboardEntry.update({ where: { id: existingRecent.id }, data: { points: recentPoints, rank: i + 1 } });
    } else {
      await prisma.leaderboardEntry.create({ data: { userId: u.id, period: "last_7_days", points: recentPoints, rank: i + 1 } });
    }
  }

  console.log("✓ Leaderboard entries created");

  // ── Streak ───────────────────────────────────────────────────────
  await prisma.streak.create({
    data: { userId, currentCount: 0, longestCount: 0, lastActivityAt: null },
  });

  console.log("✓ Streak created");
  console.log("✅ Seeding completed!");
  console.log(`\nYour account (${testUser.name}) is reset and ready to test from scratch.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });