import { Router } from "express";
import { verifyJWTToken } from "../../middleware/verifyJWTToken";
import {
  createConversation,
  getConversation,
} from "../../controller/v1/conversation";

export const conversationRouter = Router();

conversationRouter.post(
  "/api/v1/create-conversation",
  verifyJWTToken,
  createConversation,
);

conversationRouter.get(
  "/api/v1/conversation/:userId",
  verifyJWTToken,
  getConversation,
);

conversationRouter.post;

export default conversationRouter;
