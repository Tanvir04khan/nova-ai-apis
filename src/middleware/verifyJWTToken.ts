import { NextFunction, Request, Response } from "express";
import { ErrorModel } from "../models/errorModel";
import { APIStatus, StatusCode } from "../utils";
import { verify } from "jsonwebtoken";
import { env } from "../config/env";

export const verifyJWTToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const { authorization } = req.headers;

    if (!env.SERVER_KEY) {
      console.log("missing Server Key.");

      throw new ErrorModel(
        "internal server error",
        StatusCode.SERVER_ERROR,
        APIStatus.ERROR,
      );
    }

    if (!authorization) {
      throw new ErrorModel(
        "no authorized.",
        StatusCode.UNAUTHORIZED,
        APIStatus.ERROR,
      );
    }

    const jwtToken = authorization.split(" ")[1];

    verify(jwtToken, env.SERVER_KEY);

    next();
  } catch (error) {
    next(error);
  }
};
