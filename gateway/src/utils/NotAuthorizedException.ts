import { HttpException, HttpStatus } from '@nestjs/common';

export class NotAuthorizedException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
