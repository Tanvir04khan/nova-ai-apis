import { APIStatus, StatusCode } from "../utils";

export class ErrorModel extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: StatusCode, status: APIStatus) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
  }
}
