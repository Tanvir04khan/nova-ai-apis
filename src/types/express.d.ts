// src/types/express.d.ts

import { DatabaseAccessLayer } from "../database/DatabaseAccessLayer";

declare global {
  namespace Express {
    interface Request {
      dal: DatabaseAccessLayer;
    }
  }
}

export {};
