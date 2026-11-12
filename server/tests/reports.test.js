const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Glucose Reports API Endpoints", () => {
  let userAToken;
  let userBToken;
  let userAId;
  let userBId;

  // Let's use fixed dates for deterministic testing:
  // Month: 2026-10 (previous month), 2026-11 (current month)
  const reportDate = "2026-11-05";
  const emptyDate = "2026-05-01"; // no readings here

  beforeAll(async () => {
    // Register User A
    const resA = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Report Tester A",
        email: `report_a_${Date.now()}@sweety.com`,
        password: "Password123!",
      });
    userAToken = resA.body.token;
    userAId = resA.body.user.id;

    // Register User B
    const resB = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Report Tester B",
        email: `report_b_${Date.now()}@sweety.com`,
        password: "Password123!",
      });
    userBToken = resB.body.token;
    userBId = resB.body.user.id;

    // Insert controlled readings for User A:
    // On 2026-11-05 (3 readings: 90, 140, 130 -> Highest: 140, Lowest: 90, Avg: (90+140+130)/3 = 360/3 = 120.0)
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ date: reportDate, timeSlot: "Morning (fasting)", value: 90 });
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ date: reportDate, timeSlot: "After breakfast", value: 140 });
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ date: reportDate, timeSlot: "After lunch", value: 130 });

    // On 2026-11-02 (2 readings: 100, 150) -> For MTD on 2026-11-05:
    // Total readings = 3 + 2 = 5: [90, 140, 130, 100, 150]
    // Highest: 150, Lowest: 90, Sum = 610, Avg: 610/5 = 122.0
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ date: "2026-11-02", timeSlot: "Morning (fasting)", value: 100 });
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ date: "2026-11-02", timeSlot: "After lunch", value: 150 });

    // In Previous Month (October 2026: 2026-10-15): 2 readings (80, 120) -> Highest: 120, Lowest: 80, Avg: 100.0, Count: 2
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ date: "2026-10-15", timeSlot: "Morning (fasting)", value: 80 });
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ date: "2026-10-15", timeSlot: "After dinner", value: 120 });

    // Add a high reading for User B on 2026-11-05 (value: 500) to verify isolation
    await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${userBToken}`)
      .send({ date: reportDate, timeSlot: "Morning (fasting)", value: 500 });
  });

  afterAll(async () => {
    await prisma.reading.deleteMany({
      where: {
        userId: { in: [userAId, userBId] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [userAId, userBId] },
      },
    });
    await prisma.$disconnect();
  });

  describe("A. Daily Report (GET /api/reports/daily)", () => {
    it("should calculate highest, lowest, average rounded to 1 decimal, total count, and slot list for User A", async () => {
      const res = await request(app)
        .get(`/api/reports/daily?date=${reportDate}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.date).toBe(reportDate);
      expect(res.body.totalReadings).toBe(3);
      expect(res.body.highest).toBe(140);
      expect(res.body.lowest).toBe(90);
      expect(res.body.average).toBe(120.0);
      expect(res.body.readings).toHaveLength(3);

      const slots = res.body.readings.map((r) => r.timeSlot);
      expect(slots).toContain("Morning (fasting)");
      expect(slots).toContain("After breakfast");
      expect(slots).toContain("After lunch");
    });

    it("should return friendly empty state when no readings exist for selected date", async () => {
      const res = await request(app)
        .get(`/api/reports/daily?date=${emptyDate}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalReadings).toBe(0);
      expect(res.body.highest).toBeNull();
      expect(res.body.lowest).toBeNull();
      expect(res.body.average).toBeNull();
      expect(res.body.readings).toEqual([]);
    });

    it("should isolate user readings in daily report (User A does not see User B's 500 reading)", async () => {
      const resA = await request(app)
        .get(`/api/reports/daily?date=${reportDate}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(resA.body.highest).toBe(140); // User B's 500 is excluded

      const resB = await request(app)
        .get(`/api/reports/daily?date=${reportDate}`)
        .set("Authorization", `Bearer ${userBToken}`);

      expect(resB.body.totalReadings).toBe(1);
      expect(resB.body.highest).toBe(500);
    });
  });

  describe("B. Month-to-date Report (GET /api/reports/month-to-date)", () => {
    it("should calculate stats from 1st of month to selected date", async () => {
      const res = await request(app)
        .get(`/api/reports/month-to-date?date=${reportDate}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.startDate).toBe("2026-11-01");
      expect(res.body.endDate).toBe(reportDate);
      expect(res.body.totalReadings).toBe(5);
      expect(res.body.highest).toBe(150);
      expect(res.body.lowest).toBe(90);
      expect(res.body.average).toBe(122.0);
    });

    it("should return friendly empty state when no readings exist in month-to-date", async () => {
      const res = await request(app)
        .get(`/api/reports/month-to-date?date=2026-01-10`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalReadings).toBe(0);
      expect(res.body.highest).toBeNull();
      expect(res.body.lowest).toBeNull();
      expect(res.body.average).toBeNull();
      expect(res.body.readings).toEqual([]);
    });
  });

  describe("C. Previous Month Report (GET /api/reports/monthly)", () => {
    it("should calculate stats for the complete previous calendar month relative to date", async () => {
      const res = await request(app)
        .get(`/api/reports/monthly?date=${reportDate}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.year).toBe(2026);
      expect(res.body.month).toBe(10);
      expect(res.body.startDate).toBe("2026-10-01");
      expect(res.body.endDate).toBe("2026-10-31");
      expect(res.body.totalReadings).toBe(2);
      expect(res.body.highest).toBe(120);
      expect(res.body.lowest).toBe(80);
      expect(res.body.average).toBe(100.0);
    });

    it("should return friendly empty state when no readings exist in previous month", async () => {
      const res = await request(app)
        .get(`/api/reports/monthly?date=2026-03-15`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalReadings).toBe(0);
      expect(res.body.highest).toBeNull();
      expect(res.body.lowest).toBeNull();
      expect(res.body.average).toBeNull();
      expect(res.body.readings).toEqual([]);
    });
  });
});
