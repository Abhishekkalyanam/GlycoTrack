const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");
const { getTodayString } = require("../src/utils/validators");

describe("Glucose Readings API Endpoints", () => {
  let userAToken;
  let userBToken;
  let userAId;
  let userBId;
  const today = getTodayString();
  const testDate = "2026-11-01"; // safely in the past

  beforeAll(async () => {
    // Create User A
    const resA = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User A",
        email: `usera_${Date.now()}@sweety.com`,
        password: "Password123!",
      });
    userAToken = resA.body.token;
    userAId = resA.body.user.id;

    // Create User B
    const resB = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User B",
        email: `userb_${Date.now()}@sweety.com`,
        password: "Password123!",
      });
    userBToken = resB.body.token;
    userBId = resB.body.user.id;
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

  describe("Validation Rules on Adding Readings", () => {
    it("should successfully add a valid reading", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "Morning (fasting)",
          value: 95,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("reading");
      expect(res.body.reading.value).toBe(95);
      expect(res.body.reading.timeSlot).toBe("Morning (fasting)");
      expect(res.body.reading.date).toBe(testDate);
      expect(res.body.reading.userId).toBe(userAId);
    });

    it("Rule 1: should reject missing glucose value with exact error message", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "After breakfast",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Please enter a glucose value.");
    });

    it("Rule 2: should reject glucose value below 40 with exact error message", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "After breakfast",
          value: 39,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Value must be between 40 and 600 mg/dl.");
    });

    it("Rule 2: should reject glucose value above 600 with exact error message", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "After breakfast",
          value: 601,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Value must be between 40 and 600 mg/dl.");
    });

    it("Rule 2: should reject non-integer glucose values with exact error message", async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "After breakfast",
          value: 125.5,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Value must be between 40 and 600 mg/dl.");
    });

    it("Rule 3: should reject duplicate reading for the same time slot on the same date", async () => {
      // "Morning (fasting)" is already added for testDate
      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "Morning (fasting)",
          value: 110,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already have .+ Morning \(fasting\) reading for this date/i);
    });

    it("Rule 3: should reject duplicate for 'After breakfast' with 'an After breakfast' error", async () => {
      // Add first
      await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "After breakfast",
          value: 140,
        });

      // Try duplicate
      const duplicateRes = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "After breakfast",
          value: 145,
        });

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.message).toBe("You already have an After breakfast reading for this date.");
    });

    it("Rule 4: should reject more than 4 readings per day per user", async () => {
      // Add remaining 2 slots: After lunch, After dinner
      await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "After lunch",
          value: 120,
        });

      await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "After dinner",
          value: 130,
        });

      // Now User A has 4 readings for testDate. Try to add a 5th
      const fifthRes = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: testDate,
          timeSlot: "Morning (fasting)",
          value: 115,
        });

      expect(fifthRes.status).toBe(400);
      // Either slot duplicate or max 4 is hit
      expect(fifthRes.body.message).toMatch(/(already have|can add only 4 readings per day)/i);
    });

    it("Rule 5: should reject future dates with exact error message", async () => {
      const futureDate = "2099-12-31";
      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: futureDate,
          timeSlot: "Morning (fasting)",
          value: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Date cannot be in the future.");
    });
  });

  describe("Editing and Deleting Readings", () => {
    let readingToEdit;
    const editDate = "2026-11-02";

    beforeEach(async () => {
      // Clear readings on editDate for clean test
      await prisma.reading.deleteMany({
        where: { userId: userAToken ? userAId : 0, date: new Date(editDate + "T00:00:00.000Z") },
      });

      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: editDate,
          timeSlot: "Morning (fasting)",
          value: 102,
        });
      readingToEdit = res.body.reading;
    });

    it("should successfully edit an existing reading", async () => {
      const res = await request(app)
        .put(`/api/readings/${readingToEdit.id}`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: editDate,
          timeSlot: "Morning (fasting)",
          value: 108,
        });

      expect(res.status).toBe(200);
      expect(res.body.reading.value).toBe(108);
      expect(res.body.reading.id).toBe(readingToEdit.id);
    });

    it("should not count the existing reading against the 4-reading limit when editing", async () => {
      // Add 3 more readings to reach 4 total for editDate
      await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ date: editDate, timeSlot: "After breakfast", value: 135 });
      await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ date: editDate, timeSlot: "After lunch", value: 125 });
      await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ date: editDate, timeSlot: "After dinner", value: 140 });

      // There are now 4 readings on editDate. Editing one of them should NOT fail with "can add only 4"
      const res = await request(app)
        .put(`/api/readings/${readingToEdit.id}`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: editDate,
          timeSlot: "Morning (fasting)",
          value: 110,
        });

      expect(res.status).toBe(200);
      expect(res.body.reading.value).toBe(110);
    });

    it("should reject edit if changing timeSlot to one already taken on that date", async () => {
      // Add After breakfast
      await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ date: editDate, timeSlot: "After breakfast", value: 135 });

      // Try editing readingToEdit (Morning) to "After breakfast"
      const res = await request(app)
        .put(`/api/readings/${readingToEdit.id}`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: editDate,
          timeSlot: "After breakfast",
          value: 105,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("You already have an After breakfast reading for this date.");
    });

    it("should successfully delete a reading", async () => {
      const res = await request(app)
        .delete(`/api/readings/${readingToEdit.id}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);

      // Verify it cannot be retrieved
      const getRes = await request(app)
        .get(`/api/readings/${readingToEdit.id}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe("User Data Isolation", () => {
    let readingOfUserA;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/readings")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          date: "2026-11-03",
          timeSlot: "Morning (fasting)",
          value: 99,
        });
      readingOfUserA = res.body.reading;
    });

    it("User B cannot view User A's reading by ID", async () => {
      const res = await request(app)
        .get(`/api/readings/${readingOfUserA.id}`)
        .set("Authorization", `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it("User B cannot edit User A's reading", async () => {
      const res = await request(app)
        .put(`/api/readings/${readingOfUserA.id}`)
        .set("Authorization", `Bearer ${userBToken}`)
        .send({
          date: "2026-11-03",
          timeSlot: "Morning (fasting)",
          value: 250,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it("User B cannot delete User A's reading", async () => {
      const res = await request(app)
        .delete(`/api/readings/${readingOfUserA.id}`)
        .set("Authorization", `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it("User B's GET /api/readings does not contain User A's readings", async () => {
      const res = await request(app)
        .get("/api/readings")
        .set("Authorization", `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      const ids = res.body.readings.map((r) => r.id);
      expect(ids).not.toContain(readingOfUserA.id);
    });
  });
});

