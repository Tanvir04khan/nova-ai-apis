// src/google.ts

import { google } from "googleapis";
import { env } from "./config/env";

export const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/v1/auth/google/callback",
);
