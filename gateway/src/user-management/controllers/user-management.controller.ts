import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Param, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { SignUpDTO } from '../dtos/sign-up.dto';
import { CLIENTS_ENUM, IUserAuthReponse, ROLE_ENUM, UserMessagePatterns } from '@sobhankiani/shopc-common-lib';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginDTO } from '../dtos/login.dto';
import { GetUser } from 'src/decorators/get-user-from-request.decorator';
import { AuthGuard } from 'src/guards/auth.gurad';
import { IsPrivate } from 'src/decorators/is-private.decorator';
import { UpdateDTO } from '../dtos/update.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

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

    @Put('/me')
    @IsPrivate(true)
    @HttpCode(HttpStatus.OK)
    async updateUser(@Req() request: Request, @Body(ValidationPipe) updateData: UpdateDTO, @GetUser() user) {
        const result = await firstValueFrom(
            this.userClient.send<IUserAuthReponse, { id: string, updateData: UpdateDTO }>(
                UserMessagePatterns.USER_UPDATE,
                {
                    id: user.id,
                    updateData
                }
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

    @Delete('/me')
    @IsPrivate(true)
    @HttpCode(HttpStatus.OK)
    async deleteUser(@Req() request: Request, @GetUser() user) {
        const result = await firstValueFrom(
            this.userClient.send<IUserAuthReponse, { id: string }>(
                UserMessagePatterns.USER_DELETE,
                {
                    id: user.id,
                }
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

    @Get('/me')
    @IsPrivate(true)
    @HttpCode(HttpStatus.OK)
    async getUser(@Req() request: Request, @GetUser() user) {
        return user;
    }

    @Post('/:id/make-admin')
    @IsPrivate(true)
    @UseGuards(RolesGuard)
    @Roles(ROLE_ENUM.ADMIN)
    async makeUserAdmin(@Param('id') id: string, @GetUser() user) {
        const result = await firstValueFrom(
            this.userClient.send<IUserAuthReponse, { id: string }>(
                UserMessagePatterns.USER_MAKE_ADMIN,
                {
                    id: id
                }
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

    @Post('/:id/make-normal-user')
    @IsPrivate(true)
    @UseGuards(RolesGuard)
    @Roles(ROLE_ENUM.ADMIN)
    async makeUserNormal(@Param('id') id: string, @GetUser() user) {

        console.log(user)
        const result = await firstValueFrom(
            this.userClient.send<IUserAuthReponse, { id: string }>(
                UserMessagePatterns.USER_REMOVE_ADMIN_ROLE,
                {
                    id: id
                }
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

