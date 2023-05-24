import { Body, Controller, HttpCode, HttpException, HttpStatus, Inject, Post, Req, ValidationPipe } from '@nestjs/common';
import { SignUpDTO } from '../dtos/sign-up.dto';
import { CLIENTS_ENUM, IUserAuthReponse, UserMessagePatterns } from '@sobhankiani/shopc-common-lib';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginDTO } from '../dtos/login.dto';

@Controller('user-management')
export class UserManagementController {
    constructor(
        @Inject(CLIENTS_ENUM.USER_MANAGEMENT_SERVICE) private readonly userClient: ClientProxy,
    ) { }

    @Post('/sign-up')
    async signUp(@Req() request: Request, @Body(ValidationPipe) signUpDTO: SignUpDTO) {
        const result = await firstValueFrom(
            this.userClient.send<IUserAuthReponse, SignUpDTO>(
                UserMessagePatterns.USER_SIGN_UP,
                signUpDTO,
            ),
        );

        if (result.status !== HttpStatus.CREATED) {
            throw new HttpException(
                { message: result.message, errors: result.errors },
                result.status,
            );
        }

        return {
            data: result.data,
            status: result.status
        }
    }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(@Req() request: Request, @Body(ValidationPipe) loginData: LoginDTO) {
        const result = await firstValueFrom(
            this.userClient.send<IUserAuthReponse, LoginDTO>(
                UserMessagePatterns.USER_LOGIN,
                loginData,
            ),
        );

        if (result.status !== HttpStatus.OK) {
            throw new HttpException(
                { message: result.message, errors: result.errors },
                result.status,
            );
        }

        return {
            data: result.data,
            status: result.status
        }
    }



}

