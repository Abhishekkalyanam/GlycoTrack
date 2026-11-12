const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.env.PORT) || 5000;
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:root@localhost:5432/sweety?schema=public";
const jwtSecret = process.env.JWT_SECRET || "sweety_super_secret_jwt_key_2026_kenpath_assessment";

module.exports = {
  port,
  databaseUrl,
  jwtSecret,
  nodeEnv: process.env.NODE_ENV || "development",
};
