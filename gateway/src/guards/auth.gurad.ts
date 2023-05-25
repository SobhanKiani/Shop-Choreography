import {
    CanActivate,
    ExecutionContext,
    Inject,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { CLIENTS_ENUM, IUserResponse, UserMessagePatterns } from '@sobhankiani/shopc-common-lib';
import { firstValueFrom } from 'rxjs';
import { IS_PRIVATE } from 'src/decorators/is-private.decorator';


export class AuthGuard implements CanActivate, OnApplicationBootstrap {
    constructor(
        private readonly reflector: Reflector,
        @Inject(CLIENTS_ENUM.USER_MANAGEMENT_SERVICE) private readonly authClient: ClientProxy,
    ) { }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const isPrivate = this.reflector.get<string[]>(
            IS_PRIVATE,
            context.getHandler(),
        );
        if (!isPrivate) {
            return true;
        }

        const authToken = request.headers?.authorization?.split(' ')[1];
        if (authToken) {
            const authResult = await firstValueFrom(
                this.authClient.send<IUserResponse>(
                    UserMessagePatterns.USER_VERIFY,
                    { token: authToken },
                ),
            );

            const user = authResult.data;

            if (user?.email || user?.id) {
                request.user = user;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async onApplicationBootstrap() {
        await this.authClient.connect();
    }
}
