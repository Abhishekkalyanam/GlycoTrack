const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma");

function parseDateToUtc(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function formatDateStr(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function main() {
  console.log("🌱 Starting Sweety database seed...");

  // Clean existing data
  await prisma.reading.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // 1. Create demo user
  const demoUser = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "demo@sweety.com",
      password: hashedPassword,
    },
  });
  console.log(`✓ Created demo user: ${demoUser.email} (ID: ${demoUser.id})`);

  // 2. Create second user for isolation testing
  const secondUser = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "sarah@sweety.com",
      password: hashedPassword,
    },
  });
  console.log(`✓ Created test user: ${secondUser.email} (ID: ${secondUser.id})`);

  // Generate realistic sample glucose readings for demo user
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();

  const demoReadings = [];

  // A. Today's readings (3 completed slots so far)
  const todayStr = formatDateStr(new Date(Date.UTC(currentYear, currentMonth, currentDay)));
  const todayUtc = parseDateToUtc(todayStr);

  demoReadings.push(
    { userId: demoUser.id, date: todayUtc, timeSlot: "Morning (fasting)", value: 92 },
    { userId: demoUser.id, date: todayUtc, timeSlot: "After breakfast", value: 138 },
    { userId: demoUser.id, date: todayUtc, timeSlot: "After lunch", value: 124 }
  );

  // B. Earlier days in current month
  for (let d = currentDay - 1; d >= 1; d--) {
    const dateStr = formatDateStr(new Date(Date.UTC(currentYear, currentMonth, d)));
    const dUtc = parseDateToUtc(dateStr);

    demoReadings.push(
      { userId: demoUser.id, date: dUtc, timeSlot: "Morning (fasting)", value: 85 + ((d * 7) % 25) },
      { userId: demoUser.id, date: dUtc, timeSlot: "After breakfast", value: 130 + ((d * 11) % 35) },
      { userId: demoUser.id, date: dUtc, timeSlot: "After lunch", value: 115 + ((d * 13) % 30) },
      { userId: demoUser.id, date: dUtc, timeSlot: "After dinner", value: 120 + ((d * 17) % 35) }
    );
  }

  // C. Previous calendar month readings
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear -= 1;
  }
  const daysInPrevMonth = new Date(Date.UTC(prevYear, prevMonth + 1, 0)).getUTCDate();

  // Pick representative days across previous month
  const sampleDays = [1, 4, 7, 10, 14, 18, 21, 25, 28, daysInPrevMonth];
  for (const d of sampleDays) {
    const dateStr = formatDateStr(new Date(Date.UTC(prevYear, prevMonth, d)));
    const dUtc = parseDateToUtc(dateStr);

    demoReadings.push(
      { userId: demoUser.id, date: dUtc, timeSlot: "Morning (fasting)", value: 88 + ((d * 3) % 20) },
      { userId: demoUser.id, date: dUtc, timeSlot: "After breakfast", value: 135 + ((d * 5) % 30) },
      { userId: demoUser.id, date: dUtc, timeSlot: "After lunch", value: 118 + ((d * 7) % 25) },
      { userId: demoUser.id, date: dUtc, timeSlot: "After dinner", value: 125 + ((d * 9) % 30) }
    );
  }

  // Insert demo user readings
  for (const item of demoReadings) {
    await prisma.reading.create({ data: item });
  }
  console.log(`✓ Inserted ${demoReadings.length} readings for demo user`);

  // D. Insert readings for Sarah to verify isolation
  const sarahReading1 = await prisma.reading.create({
    data: {
      userId: secondUser.id,
      date: todayUtc,
      timeSlot: "Morning (fasting)",
      value: 105,
    },
  });
  console.log(`✓ Inserted isolated reading for ${secondUser.email} (ID: ${sarahReading1.id})`);

  console.log("✅ Database seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Demo Credentials:");
  console.log("Email:    demo@sweety.com");
  console.log("Password: Password123!");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

