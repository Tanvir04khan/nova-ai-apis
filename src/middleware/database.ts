import { NextFunction, Request, Response } from "express";
import DatabaseAccessLayer from "../database/access-layer";

const attachDAL = (req: Request, _res: Response, next: NextFunction) => {
  req.dal = new DatabaseAccessLayer();
  next();
};

export default attachDAL;
