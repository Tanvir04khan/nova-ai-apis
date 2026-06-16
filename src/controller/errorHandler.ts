import { Request, Response, NextFunction } from "express";
import { ResponseModel } from "../models/responseModel";
import { APIStatus, StatusCode } from "../utils";
import { ErrorModel } from "../models/errorModel";

const errorHandler = (
  err: ErrorModel | unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    if (err instanceof ErrorModel) {
      console.log(err.message);
      return res
        .status(err.statusCode || StatusCode.SERVER_ERROR)
        .json(
          new ResponseModel(
            null,
            (err.status as APIStatus) || APIStatus.ERROR,
            err.statusCode || StatusCode.SERVER_ERROR,
            err.message || "error",
          ),
        );
    }

    console.error((err as any).message);
    return res
      .status(StatusCode.SERVER_ERROR)
      .json(
        new ResponseModel(
          null,
          APIStatus.ERROR,
          StatusCode.SERVER_ERROR,
          "internal server error.",
        ),
      );
  } catch (error: any) {
    console.error("Error in error handler:", error.message);
    res
      .status(StatusCode.SERVER_ERROR)
      .json(
        new ResponseModel(
          null,
          APIStatus.ERROR,
          StatusCode.SERVER_ERROR,
          "internal server error.",
        ),
      );
  }
};

export default errorHandler;
