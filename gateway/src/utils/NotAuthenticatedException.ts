import { HttpException, HttpStatus } from '@nestjs/common';

export class NotAuthenticatedException extends HttpException {
  constructor() {
    super('Not Authenticated', HttpStatus.FORBIDDEN);
  }
}
