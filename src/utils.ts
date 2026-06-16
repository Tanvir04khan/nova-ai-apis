import { randomBytes } from "crypto";
import { env } from "./config/env";
import bcrypt from "bcrypt";
import DatabaseAccessLayer from "./database/access-layer";
import { sign, SignOptions } from "jsonwebtoken";
import { GeminiModels } from "./services/google-genai";
import axios, { AxiosHeaders } from "axios";

export const model: GeminiModels = "gemma-4-26b-a4b-it";

export enum APIStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  CONFLICT = 409,
  SERVER_ERROR = 500,
}

export enum mcpRoute {
  GetTools = "/api/v1/tools",
  processEvent = "/api/v1/tools/trigger-event",
}

export const getMCPURL = (url: string) => `${env.MCP_SERVER_URL}${url}`;

const generateRefreshToken = () => {
  if (!env.SERVER_KEY || !env.SALT_ROUNDS) {
    console.error("Missing environment variables for token generation.");
    throw new Error("Server error.");
  }
  const refreshToken = randomBytes(64).toString("hex");
  const hashedRefreshToken = bcrypt.hashSync(
    refreshToken + env.SERVER_KEY,
    Number(env.SALT_ROUNDS),
  );
  const refreshTokenExpiry = new Date(Date.now());
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // Set expiry to 30 days
  return { refreshToken, hashedRefreshToken, refreshTokenExpiry };
};

const generateJWTToken = (userId: string, email: string) => {
  const serverKey = env.SERVER_KEY;
  const jwtExpiry = env.JWT_EXPIRY;

  if (!serverKey || !jwtExpiry) {
    console.error("Missing environment variables for JWT generation.");
    throw new Error("Server error.");
  }

  const jwtToken = sign({ userId, email }, serverKey, {
    expiresIn: jwtExpiry,
  } as SignOptions);

  return jwtToken;
};

export const generateRefreshAndJWTToken = async (
  userId: string,
  email: string,
  dal: DatabaseAccessLayer,
) => {
  const { hashedRefreshToken, refreshToken, refreshTokenExpiry } =
    generateRefreshToken();

  await dal.userDAL.saveRefreshToken(
    userId,
    hashedRefreshToken,
    refreshTokenExpiry,
  );

  const jwtToken = generateJWTToken(userId, email);

  return {
    refreshToken,
    jwtToken,
  };
};

export const getOrigin = () => {
  if (env.ENV === "production") {
    return "https://novaai.app";
  }
  return "http://localhost:5173";
};

export enum MessageRole {
  User = "user",
  Model = "model",
}

export enum ToolChatRole {
  User = "user",
  Model = "model",
}

export const generateMCPRequestHeader = async (
  geminiSelectedTool: string,
  database: DatabaseAccessLayer,
  userId: string,
) => {
  const apiConfig: axios.AxiosRequestConfig<any> = {
    // headers: {
    //   "Content-Type": "application/json",
    //   authorization: env.MCP_SERVER_SECRETKEY,
    // },
  };

  const headers = new AxiosHeaders();
  headers.set("Content-Type", "application/json");
  headers.set("authorization", env.MCP_SERVER_SECRETKEY);

  const selectedTool: {
    eventName: string;
  } = JSON.parse(geminiSelectedTool);

  if (selectedTool.eventName === "send_email") {
    const refreshToken = await database.userDAL.getGmailRefreshToken(userId);

    headers.set("X-Gmail-Refresh-Token", refreshToken?.gmailRefreshToken);

    // apiConfig.headers!["X-Gmail-Refresh-Token"] =
    //   refreshToken?.gmailRefreshToken;
  }

  return headers;
};
