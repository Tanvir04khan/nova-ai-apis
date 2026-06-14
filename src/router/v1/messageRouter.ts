import { Router } from "express";
import { verifyJWTToken } from "../../middleware/verifyJWTToken";
import { createMessage, getMessages } from "../../controller/v1/message";

const messageRouter = Router();

messageRouter.post("/api/v1/create-messages", verifyJWTToken, createMessage);
messageRouter.post("/api/v1/messages/:userId", verifyJWTToken, getMessages);

export default messageRouter;
