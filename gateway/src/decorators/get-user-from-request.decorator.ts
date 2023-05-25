import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NotAuthenticatedException } from 'src/utils/NotAuthenticatedException';

export const GetUser = createParamDecorator(
    (data, req: ExecutionContext) => {
        const user = req.switchToHttp().getRequest().user;
        if (!user) {
            throw new NotAuthenticatedException();
        }
        return user;
    },
);
