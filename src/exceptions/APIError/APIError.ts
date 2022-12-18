export class APIError {
  public readonly code: number;

  public readonly message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }

  public static notFound(msg: string = 'Not found'): APIError {
    return new APIError(404, msg);
  }

  public static badRequest(msg: string = 'Request is incorrect'): APIError {
    return new APIError(400, msg);
  }
}
