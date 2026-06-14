import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { ErrorModel } from "../../models/errorModel";
import { APIStatus, generateRefreshAndJWTToken, StatusCode } from "../../utils";
import DatabaseAccessLayer from "../../database/access-layer";
import { env } from "../../config/env";
import { ResponseModel } from "../../models/responseModel";

export const userLookup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, refreshToken } = req.body;

    const dal: DatabaseAccessLayer = req.dal;

    if (!userId || !refreshToken) {
      throw new ErrorModel(
        "not authorized.",
        StatusCode.UNAUTHORIZED,
        APIStatus.ERROR,
      );
    }

    const user = await dal.userDAL.getUserById(userId);

    if (!user.length) {
      throw new ErrorModel(
        "not authorized.",
        StatusCode.UNAUTHORIZED,
        APIStatus.ERROR,
      );
    }

    const refreshTokenExpiry = new Date(user[0].refreshTokenExpiry ?? "");
    const currentDate = new Date();

    if (
      Date.parse(refreshTokenExpiry.toUTCString()) <
      Date.parse(currentDate.toUTCString())
    ) {
      console.log("refresh token expired");
      throw new ErrorModel(
        "not authorized.",
        StatusCode.UNAUTHORIZED,
        APIStatus.ERROR,
      );
    }

    const isValidRefreshToken = bcrypt.compareSync(
      refreshToken + env.SERVER_KEY,
      user[0].refreshToken ?? "",
    );

    if (!isValidRefreshToken) {
      throw new ErrorModel(
        "not authorized.",
        StatusCode.UNAUTHORIZED,
        APIStatus.ERROR,
      );
    }

    const { jwtToken, refreshToken: rt } = await generateRefreshAndJWTToken(
      user[0].userId,
      user[0].email,
      dal,
    );

    res.status(StatusCode.OK).json(
      new ResponseModel(
        {
          userId: user[0].userId,
          accessToken: jwtToken,
          refreshToken: rt,
        },
        APIStatus.SUCCESS,
        StatusCode.OK,
        "logged in successfully.",
      ),
    );
  } catch (error) {
    next(error);
  }
};
