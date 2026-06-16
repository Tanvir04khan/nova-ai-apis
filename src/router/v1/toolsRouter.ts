import { Router } from "express";
import { verifyJWTToken } from "../../middleware/verifyJWTToken";
import { getToolChats, tools } from "../../controller/v1/tools";

export const toolRouter = Router();

toolRouter.post("/api/v1/tools", verifyJWTToken, tools);
toolRouter.get("/api/v1/tool-chat/:userId", verifyJWTToken, getToolChats);

export default toolRouter;
