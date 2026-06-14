import { APIStatus, StatusCode } from "../utils";

export class ResponseModel<T = null> {
  status: APIStatus;
  statusCode: StatusCode;
  message: string;
  data: T;

  constructor(
    data: T,
    status: APIStatus,
    statusCode: StatusCode,
    message: string,
  ) {
    this.data = data;
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
  }
}
