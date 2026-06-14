import { Router } from "express";
import { chat } from "../../controller/v1/chat";
import { verifyJWTToken } from "../../middleware/verifyJWTToken";

const chatRouter = Router();

chatRouter.post("/api/v1/chat", verifyJWTToken, chat);

export default chatRouter;
