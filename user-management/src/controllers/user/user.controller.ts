import { Controller, HttpStatus, Inject, UseInterceptors } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { IAdminToUserEvent, IUserActivedEvent, IUserAuthReponse, IUserCreatedEvent, IUserDeactivedEvent, IUserDeletedEvent, IUserResponse, IUserToAdminEvent, IUserUdpatedEvent, Subjects } from '@sobhankiani/shopc-common-lib';
import { UserService } from '../../services/user-services/user.service';
import { PrometheusInterceptor } from 'decorators/response-time.decorator';

@Controller('user')
@UseInterceptors(PrometheusInterceptor)
export class UserController {
    constructor(
        private userService: UserService,
        @Inject('NATS_SERVICE') private natsClient: ClientProxy,
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
            const userObj = result.userEntity.toObject()

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
                errors: ["Could Not Complete The Operation"],
                data: null
            }
        }
    }

    @MessagePattern("USER_LOGIN")
    async login(params: { email: string, password: string }): Promise<IUserAuthReponse> {
        try {
            const result = await this.userService.login({ email: params.email, password: params.password });
            if (!result) {
                return {
                    message: "Email Or Password Is Not Correct",
                    status: HttpStatus.UNAUTHORIZED,
                    errors: ["Could Not Login"],
                    data: null
                }
            }

            const userObj = result.userEntity.toObject()

            const data = {
                token: result.token,
                user: userObj
            }

            return {
                message: "Login Successful",
                status: HttpStatus.OK,
                errors: null,
                data: data
            }

        } catch (e) {
            return {
                message: "Could Not Complete The Operation",
                status: HttpStatus.BAD_REQUEST,
                errors: ["Could Not Complete The Operation"],
                data: null
            }
        }
    }

    @MessagePattern("USER_UPDATE")
    async updateUser(params: { id: string, updateData: Prisma.UserUpdateInput }): Promise<IUserResponse> {
        try {
            const userEntity = await this.userService.updateUser(params.id, params.updateData);
            if (!userEntity) {
                return {
                    message: "User Not Found",
                    status: HttpStatus.NOT_FOUND,
                    errors: ['User Not Found'],
                    data: null
                }
            }
            const userObj = userEntity.toObject();

            const eventData: IUserUdpatedEvent = {
                subject: Subjects.UserUpdated,
                data: {
                    ...userObj
                }
            }
            this.natsClient.emit<any, IUserUdpatedEvent>(Subjects.UserUpdated, eventData);

            return {
                message: "User Updated Successfully",
                status: HttpStatus.OK,
                errors: null,
                data: userObj
            }


        } catch (e) {
            return {
                message: "Could Not Complete The Operation",
                status: HttpStatus.BAD_REQUEST,
                errors: ["Could Not Complete The Operation"],
                data: null
            }
        }

    }

    @MessagePattern("USER_DELETE")
    async deleteUser(params: { id: string }) {
        try {
            const userEntity = await this.userService.deleteUser(params.id);
            if (!userEntity) {
                return {
                    message: "User Not Found",
                    status: HttpStatus.NOT_FOUND,
                    errors: ['User Not Found'],
                    data: null
                }
            }

            const userObj = userEntity.toObject();
            const eventData: IUserDeletedEvent = {
                subject: Subjects.UserDeleted,
                data: {
                    ...userObj
                }
            }
            this.natsClient.emit<any, IUserDeletedEvent>(Subjects.UserDeleted, eventData);

            return {
                message: "User Updated",
                status: HttpStatus.OK,
                errors: null,
                data: userObj
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

    @MessagePattern("USER_TOGGLE_ACTIVATION")
    async toggleActivation(params: { id: string }): Promise<IUserResponse> {
        try {
            const userEntity = await this.userService.toggleUserIsActive(params.id);
            if (!userEntity) {
                return {
                    message: "User Not Found",
                    status: HttpStatus.NOT_FOUND,
                    errors: ['User Not Found'],
                    data: null
                }
            }
            const userObj = userEntity.toObject();

            if (userObj.isActive) {
                const eventData: IUserActivedEvent = {
                    subject: Subjects.UserActived,
                    data: {
                        id: userObj.id,
                        isActive: userObj.isActive
                    }
                }
                this.natsClient.emit<any, IUserActivedEvent>(Subjects.UserActived, eventData);
            } else {
                const eventData: IUserDeactivedEvent = {
                    subject: Subjects.UserDeactived,
                    data: {
                        id: userObj.id,
                        isActive: userObj.isActive
                    }
                }
                this.natsClient.emit<any, IUserDeactivedEvent>(Subjects.UserDeactived, eventData);
            }

            return {
                message: "User Activation Toggled",
                status: HttpStatus.OK,
                errors: null,
                data: userObj
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

    @MessagePattern("USER_VERIFY")
    async verifyUser(params: { token: string, roles?: string[] }) {
        try {
            const userEntity = await this.userService.verifyUser(params.token, params.roles);
            if (!userEntity) {
                return {
                    message: "Could Not Verify The User",
                    status: HttpStatus.BAD_REQUEST,
                    errors: ['Could Not Verify The User'],
                    data: null
                }
            }
            const userObj = userEntity.toObject()
            if (params.roles && params.roles.length > 0) {
                const authorized = userObj.roles.some((role) => params.roles.includes(role))
                if (!authorized) {
                    return {
                        message: "Could Not Authorized The User",
                        status: HttpStatus.UNAUTHORIZED,
                        errors: ['Could Not Authorized The User'],
                        data: null

                    }
                }
            }

            return {
                message: "User Verified",
                status: HttpStatus.OK,
                errors: null,
                data: userObj
            }
        } catch (e) {
            return {
                message: "Could Not Complete The Operation",
                status: HttpStatus.BAD_REQUEST,
                errors: ["Could Not Complete The Operation"],
                data: null
            }
        }

    }

    @MessagePattern("USER_MAKE_ADMIN")
    async makeUserAdmin(params: { id: string }) {
        try {

            const userEntity = await this.userService.makeUserAdmin(params.id);
            if (!userEntity) {
                return {
                    message: "Could Not Find The User",
                    status: HttpStatus.BAD_REQUEST,
                    errors: ['Could Not Find The User'],
                    data: null
                }
            }
            const userObj = userEntity.toObject()

            const eventData: IUserToAdminEvent = {
                subject: Subjects.UserToAdmin,
                data: {
                    id: userObj.id,
                    version: userObj.version
                }
            }

            this.natsClient.emit<IUserToAdminEvent>(Subjects.UserToAdmin, eventData);

            return {
                message: "User Role Changed",
                status: HttpStatus.OK,
                errors: null,
                data: userObj
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

    @MessagePattern("USER_REMOVE_ADMIN_ROLE")
    async removeAdminRoleFromUser(params: { id: string }) {
        try {
            const userEntity = await this.userService.removeAdminRoleFromUser(params.id);
            if (!userEntity) {
                return {
                    message: "Could Not Find The User",
                    status: HttpStatus.BAD_REQUEST,
                    errors: ['Could Not Find The User'],
                    data: null
                }
            }
            const userObj = userEntity.toObject()

            const eventData: IAdminToUserEvent = {
                subject: Subjects.AdminToUser,
                data: {
                    id: userObj.id,
                    version: userObj.version
                }
            }

            this.natsClient.emit<IAdminToUserEvent>(Subjects.AdminToUser, eventData);

            return {
                message: "UserVerified",
                status: HttpStatus.OK,
                errors: null,
                data: userObj
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



}
