import { Router } from "express";
import {
  handleCallback,
  redirectToAuthURL,
} from "../../controller/v1/googleAuth";

const googleAuthRouter = Router();

googleAuthRouter.get("/api/v1/auth/google", redirectToAuthURL);
googleAuthRouter.get("/api/v1/auth/google/callback", handleCallback);

export default googleAuthRouter;
