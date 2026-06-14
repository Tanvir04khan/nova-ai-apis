import { Router } from "express";
import { verifyJWTToken } from "../../middleware/verifyJWTToken";
import { getUser } from "../../controller/v1/user";

const userRouter = Router();

userRouter.get("/api/v1/user/:userId", verifyJWTToken, getUser);

export default userRouter;
