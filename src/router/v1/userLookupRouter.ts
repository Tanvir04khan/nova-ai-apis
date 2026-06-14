import { Router } from "express";
import { userLookup } from "../../controller/v1/userLookup";

const userLookupRouter = Router();

userLookupRouter.post("/api/v1/user-lookup", userLookup);

export default userLookupRouter;
