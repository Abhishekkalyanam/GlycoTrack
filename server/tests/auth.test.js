const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Authentication API Endpoints", () => {
  const timestamp = Date.now();
  const testUser = {
    name: "Auth Test User",
    email: `auth_test_${timestamp}@sweety.com`,
    password: "Password123!",
  };

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "auth_test_",
        },
      },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should successfully register a new user with valid name, email, and password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should reject registration with duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it("should reject registration with missing name", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: `missing_name_${timestamp}@sweety.com`,
          password: "Password123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/name/i);
    });

    it("should reject registration with invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Invalid Email User",
          email: "not-an-email",
          password: "Password123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/valid email/i);
    });

    it("should reject registration with short password (< 6 chars)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Short Pwd",
          email: `short_pwd_${timestamp}@sweety.com`,
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should successfully log in with correct email and password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    });

    it("should reject login with incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword999!",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nobody_exists_here@sweety.com",
          password: "Password123!",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });
  });

  describe("Protected routes and /api/auth/me", () => {
    let validToken;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      validToken = res.body.token;
    });

    it("should reject request without Authorization header", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/authentication required/i);
    });

    it("should reject request with invalid / forged token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token-xyz");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid or expired token/i);
    });

    it("should return authenticated user profile with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.name).toBe(testUser.name);
    });
  });
});

