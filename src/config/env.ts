import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  ENV: process.env.ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  SERVER_KEY: process.env.SERVER_KEY,
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

export type ENV = typeof env;
