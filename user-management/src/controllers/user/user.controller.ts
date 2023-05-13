import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { IUserAuthReponse, IUserCreatedEvent, Subjects } from '@sobhankiani/shopc-common-lib';
import { Email } from 'entities/user/value-objects';
import { UserService } from 'services/user-services/user.service';
@Controller('user')
export class UserController {
    constructor(
        @Inject('NATS_SERVICE') private natsClient: ClientProxy,
        @Inject() private userService: UserService
    ) { }

    @MessagePattern("USER_SIGN_UP")
    async signUp(params: Prisma.UserCreateInput): Promise<IUserAuthReponse> {
        try {

            const result = await this.userService.signUp(params);
            if (!result) {
                return {
                    message: "Could Not Complete The Operation",
                    status: HttpStatus.BAD_REQUEST,
                    errors: ["Could Not Create User"],
                    data: null
                }
            }
            const userObj = await result.userEntity.toObject()
            delete userObj.password;

            const data = {
                token: result.token,
                user: userObj
            }


            const eventData: IUserCreatedEvent = {
                subject: Subjects.UserCreated,
                data: userObj
            }
            this.natsClient.emit<any, IUserCreatedEvent>(Subjects.UserCreated, eventData)

            return {
                message: "Sign Up Completed",
                status: HttpStatus.CREATED,
                errors: null,
                data: data
            }
        } catch (e) {
            return {
                message: "Could Not Complete The Operation",
                status: HttpStatus.BAD_REQUEST,
                errors: [e.errors],
                data: null
            }
        }
    }

    @MessagePattern("USER_LOGIN")
    async login(params: { email: string, password: string }): Promise<IUserAuthReponse> {
        try {
            const result = await this.userService.login(params.email, params.password);
            if (!result) {
                return {
                    message: "Email Or Password Is Not Correct",
                    status: HttpStatus.BAD_REQUEST,
                    errors: ["Could Not Login"],
                    data: null
                }
            }

            const userObj = await result.userEntity.toObject()
            delete userObj.password;

            const data = {
                token: result.token,
                user: userObj
            }

            return {
                message: "Login Completed",
                status: HttpStatus.OK,
                errors: null,
                data: data
            }

        } catch (e) {
            return {
                message: "Could Not Complete The Operation",
                status: HttpStatus.BAD_REQUEST,
                errors: [e.errors],
                data: null
            }
        }
    }

    @MessagePattern("USER_UPDATE")
    async updateUser() { }

    @MessagePattern("USER_DELETE")
    async deleteUser() { }

    @MessagePattern("USER_TOGGLE_ACTIVATION")
    async toggleActivation() { }

    @MessagePattern("USER_VERIFY")
    async verifyUser() { }

    @MessagePattern("USER_MAKE_ADMIN")
    async makeUserAdmin() { }

    @MessagePattern("USER_REMOVE_ADMIN_ROLE")
    async removeAdminRoleFromUser() { }

    @MessagePattern("USER_GET_BY_CRIDENTIAL")
    async getUserByUniqueCridentials() { }

}
