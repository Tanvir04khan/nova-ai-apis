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
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NOVA_WEBAPP_URL: process.env.NOVA_WEBAPP_URL,
  MCP_SERVER_SECRETKEY: process.env.MCP_SERVER_SECRETKEY,
  MCP_SERVER_URL: process.env.MCP_SERVER_URL,
};

export type ENV = typeof env;
