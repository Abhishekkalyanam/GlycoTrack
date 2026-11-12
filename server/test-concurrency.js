const request = require("supertest");
const app = require("./src/app");
const prisma = require("./src/config/prisma");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("./src/config/env");

async function testConcurrency() {
  console.log("Testing concurrent insertion handling...");
  const user = await prisma.user.create({
    data: {
      name: "Concurrent Test User",
      email: `concurrent_${Date.now()}@sweety.com`,
      password: "hashedpassword123",
    },
  });

  const token = jwt.sign({ userId: user.id }, jwtSecret);

  // Send two requests in parallel for the exact same date and slot
  const p1 = request(app)
    .post("/api/readings")
    .set("Authorization", `Bearer ${token}`)
    .send({ date: "2026-11-09", timeSlot: "After lunch", value: 120 });

  const p2 = request(app)
    .post("/api/readings")
    .set("Authorization", `Bearer ${token}`)
    .send({ date: "2026-11-09", timeSlot: "After lunch", value: 125 });

  const [res1, res2] = await Promise.all([p1, p2]);
  const statuses = [res1.status, res2.status].sort();

  console.log("HTTP Responses:", res1.status, res2.status);

  const count = await prisma.reading.count({
    where: {
      userId: user.id,
      date: new Date("2026-11-09T00:00:00.000Z"),
      timeSlot: "After lunch",
    },
  });

  console.log("Database readings count for this slot:", count);

  // Cleanup
  await prisma.reading.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  if (statuses[0] === 201 && statuses[1] === 400 && count === 1) {
    console.log("✅ Concurrency & Unique Constraint Protection PASS: Exactly 1 record inserted, 2nd rejected with 400.");
  } else {
    console.error("❌ Concurrency test failed:", statuses, "count:", count);
    process.exit(1);
  }
}

testConcurrency()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
