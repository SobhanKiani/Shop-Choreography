import { SetMetadata } from '@nestjs/common';

export const IS_PRIVATE = 'isPrivate';
export const IsPrivate = (isPrivate: boolean) => {
  return SetMetadata(IS_PRIVATE, isPrivate);
};
